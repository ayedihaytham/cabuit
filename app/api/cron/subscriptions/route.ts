import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { TAG } from '@/lib/queries'
import { sendEmail, layout, appUrl } from '@/lib/email'
import { notify } from '@/lib/notifications'
import { reportError } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GRACE_DAYS = 7 // après fin d'essai avant suspension
const RENEWAL_WINDOW_DAYS = 30 // relance avant échéance
const RENEWAL_GRACE_DAYS = 14 // après échéance avant suspension

const day = 86_400_000
const pay = (id: string) => `${appUrl()}/paiement?business=${id}`

/**
 * À exécuter 1×/jour (Vercel Cron ou cron externe).
 * - fin d'essai -> PENDING_PAYMENT + email
 * - impayé (essai) > GRACE_DAYS -> commerce suspendu
 * - échéance d'abonnement dans 30 j -> relance (une fois)
 * - échéance dépassée -> PAST_DUE
 * - PAST_DUE > RENEWAL_GRACE_DAYS sans nouveau paiement -> commerce suspendu
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const bearer = request.headers.get('authorization') === `Bearer ${secret}`
    const key = new URL(request.url).searchParams.get('key') === secret
    if (!bearer && !key) return NextResponse.json({ ok: false }, { status: 401 })
  }

  const now = new Date()
  const result = {
    expiredTrials: 0,
    trialSuspended: 0,
    renewalReminders: 0,
    lapsed: 0,
    renewalSuspended: 0,
    eventsPruned: 0,
  }

  try {
    // 0. Purge des événements d'audience de plus de 120 jours (borne la table).
    const pruned = await db.event.deleteMany({
      where: { createdAt: { lt: new Date(now.getTime() - 120 * day) } },
    })
    result.eventsPruned = pruned.count
    // 1. Fin d'essai -> à régler
    const expiredTrials = await db.subscription.findMany({
      where: { status: 'TRIALING', trialEndsAt: { lt: now } },
      include: { business: { include: { owner: { select: { id: true, email: true } } } } },
    })
    for (const sub of expiredTrials) {
      await db.subscription.update({ where: { id: sub.id }, data: { status: 'PENDING_PAYMENT' } })
      void notify({
        userId: sub.business.owner.id,
        type: 'trial.ended',
        title: 'Essai gratuit terminé',
        body: `Réglez l'abonnement de ${sub.business.name} pour garder la fiche en ligne.`,
        href: `/paiement?business=${sub.businessId}`,
      })
      void sendEmail({
        to: sub.business.owner.email,
        subject: 'Votre essai Winou est terminé — réglez pour rester en ligne',
        html: layout(
          'Essai gratuit terminé',
          `<p>L'essai de <strong>${sub.business.name}</strong> est arrivé à échéance.
           Réglez votre abonnement (${sub.pricePerYear} DT / an) pour que votre fiche reste publique.</p>`,
          { href: pay(sub.businessId), label: 'Régler maintenant' },
        ),
      })
    }
    result.expiredTrials = expiredTrials.length

    // 2. Impayé après essai -> suspension
    const trialOverdue = await db.subscription.findMany({
      where: {
        status: { in: ['PENDING_PAYMENT', 'PAST_DUE'] },
        currentPeriodEnd: null,
        trialEndsAt: { lt: new Date(now.getTime() - GRACE_DAYS * day) },
        business: { status: 'ACTIVE' },
        payments: { none: { status: 'PAID' } },
      },
      include: { business: { include: { owner: { select: { id: true, email: true } } } } },
    })
    for (const sub of trialOverdue) {
      await db.$transaction([
        db.business.update({ where: { id: sub.businessId }, data: { status: 'SUSPENDED' } }),
        db.subscription.update({ where: { id: sub.id }, data: { status: 'PAST_DUE' } }),
      ])
      void notify({
        userId: sub.business.owner.id,
        type: 'business.suspended',
        title: 'Fiche suspendue — abonnement impayé',
        body: `${sub.business.name} n'est plus visible. Réglez pour la réactiver.`,
        href: `/paiement?business=${sub.businessId}`,
      })
      void sendEmail({
        to: sub.business.owner.email,
        subject: `Fiche ${sub.business.name} suspendue — abonnement impayé`,
        html: layout(
          'Fiche suspendue',
          `<p>Faute de règlement, la fiche de <strong>${sub.business.name}</strong> n'est plus publique.</p>`,
          { href: pay(sub.businessId), label: 'Régler et réactiver' },
        ),
      })
    }
    result.trialSuspended = trialOverdue.length

    // 3. Relance avant échéance de renouvellement (une seule fois par cycle)
    const renewSoon = await db.subscription.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: { gt: now, lt: new Date(now.getTime() + RENEWAL_WINDOW_DAYS * day) },
        renewalRemindedAt: null,
      },
      include: { business: { include: { owner: { select: { id: true, email: true } } } } },
    })
    for (const sub of renewSoon) {
      await db.subscription.update({ where: { id: sub.id }, data: { renewalRemindedAt: now } })
      const dueStr = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(sub.currentPeriodEnd!)
      void notify({
        userId: sub.business.owner.id,
        type: 'renewal.reminder',
        title: 'Abonnement à renouveler bientôt',
        body: `${sub.business.name} — échéance le ${dueStr}.`,
        href: `/paiement?business=${sub.businessId}`,
      })
      void sendEmail({
        to: sub.business.owner.email,
        subject: `Renouvellement de l'abonnement ${sub.business.name}`,
        html: layout(
          'Votre abonnement arrive à échéance',
          `<p>L'abonnement de <strong>${sub.business.name}</strong> se termine le ${dueStr}.
           Renouvelez-le (${sub.pricePerYear} DT / an) pour éviter toute interruption.</p>`,
          { href: pay(sub.businessId), label: 'Renouveler' },
        ),
      })
    }
    result.renewalReminders = renewSoon.length

    // 4. Échéance dépassée -> PAST_DUE (grâce : la fiche reste en ligne)
    const lapsed = await db.subscription.findMany({
      where: { status: 'ACTIVE', currentPeriodEnd: { lt: now } },
      include: { business: { include: { owner: { select: { id: true, email: true } } } } },
    })
    for (const sub of lapsed) {
      await db.subscription.update({ where: { id: sub.id }, data: { status: 'PAST_DUE' } })
      void notify({
        userId: sub.business.owner.id,
        type: 'renewal.lapsed',
        title: 'Abonnement échu',
        body: `Réglez le renouvellement de ${sub.business.name} sous ${RENEWAL_GRACE_DAYS} jours.`,
        href: `/paiement?business=${sub.businessId}`,
      })
      void sendEmail({
        to: sub.business.owner.email,
        subject: `Abonnement ${sub.business.name} échu`,
        html: layout(
          'Abonnement échu',
          `<p>L'abonnement de <strong>${sub.business.name}</strong> est arrivé à échéance.
           Vous avez ${RENEWAL_GRACE_DAYS} jours pour le renouveler avant suspension de la fiche.</p>`,
          { href: pay(sub.businessId), label: 'Renouveler maintenant' },
        ),
      })
    }
    result.lapsed = lapsed.length

    // 5. PAST_DUE (renouvellement) dépassant la grâce -> suspension
    const renewalOverdue = await db.subscription.findMany({
      where: {
        status: 'PAST_DUE',
        currentPeriodEnd: { lt: new Date(now.getTime() - RENEWAL_GRACE_DAYS * day) },
        business: { status: 'ACTIVE' },
      },
      include: { business: { include: { owner: { select: { id: true, email: true } } } } },
    })
    for (const sub of renewalOverdue) {
      await db.business.update({ where: { id: sub.businessId }, data: { status: 'SUSPENDED' } })
      void notify({
        userId: sub.business.owner.id,
        type: 'business.suspended',
        title: 'Fiche suspendue — abonnement non renouvelé',
        body: `${sub.business.name} n'est plus visible. Réglez pour la réactiver.`,
        href: `/paiement?business=${sub.businessId}`,
      })
      void sendEmail({
        to: sub.business.owner.email,
        subject: `Fiche ${sub.business.name} suspendue`,
        html: layout(
          'Fiche suspendue',
          `<p>Sans renouvellement, la fiche de <strong>${sub.business.name}</strong> n'est plus publique.</p>`,
          { href: pay(sub.businessId), label: 'Régler et réactiver' },
        ),
      })
    }
    result.renewalSuspended = renewalOverdue.length
  } catch (e) {
    reportError(e, { scope: 'cron/subscriptions' })
    return NextResponse.json({ ok: false, ...result }, { status: 500 })
  }

  revalidateTag(TAG.businesses, 'max')
  revalidateTag(TAG.stats, 'max')
  return NextResponse.json({ ok: true, ...result })
}
