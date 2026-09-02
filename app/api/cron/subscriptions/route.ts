import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { TAG } from '@/lib/queries'
import { sendEmail, layout, appUrl } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GRACE_DAYS = 7

/**
 * À exécuter 1×/jour (Vercel Cron ou cron externe).
 * - essai terminé -> PENDING_PAYMENT + email
 * - impayé depuis > GRACE_DAYS -> commerce suspendu + email
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && new URL(request.url).searchParams.get('key') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const now = new Date()
  const graceLimit = new Date(now.getTime() - GRACE_DAYS * 86400000)

  // 1. Essais expirés
  const expiredTrials = await db.subscription.findMany({
    where: { status: 'TRIALING', trialEndsAt: { lt: now } },
    include: { business: { include: { owner: { select: { email: true, name: true } } } } },
  })
  for (const sub of expiredTrials) {
    await db.subscription.update({ where: { id: sub.id }, data: { status: 'PENDING_PAYMENT' } })
    void sendEmail({
      to: sub.business.owner.email,
      subject: `Votre essai Winou est terminé — réglez pour rester en ligne`,
      html: layout(
        'Essai gratuit terminé',
        `<p>L'essai de <strong>${sub.business.name}</strong> est arrivé à échéance.
         Réglez votre abonnement (${sub.pricePerYear} DT / an) pour que votre fiche reste publique.</p>`,
        { href: `${appUrl()}/paiement?business=${sub.businessId}`, label: 'Régler maintenant' },
      ),
    })
  }

  // 2. Impayés au-delà du délai de grâce -> suspension
  const overdue = await db.subscription.findMany({
    where: {
      status: { in: ['PENDING_PAYMENT', 'PAST_DUE'] },
      trialEndsAt: { lt: graceLimit },
      business: { status: 'ACTIVE' },
      payments: { none: { status: 'PAID' } },
    },
    include: { business: { include: { owner: { select: { email: true, name: true } } } } },
  })
  for (const sub of overdue) {
    await db.$transaction([
      db.business.update({ where: { id: sub.businessId }, data: { status: 'SUSPENDED' } }),
      db.subscription.update({ where: { id: sub.id }, data: { status: 'PAST_DUE' } }),
    ])
    void sendEmail({
      to: sub.business.owner.email,
      subject: `Fiche ${sub.business.name} suspendue — abonnement impayé`,
      html: layout(
        'Fiche suspendue',
        `<p>Faute de règlement, la fiche de <strong>${sub.business.name}</strong> n'est plus publique.
         Réglez votre abonnement pour la réactiver.</p>`,
        { href: `${appUrl()}/paiement?business=${sub.businessId}`, label: 'Régler et réactiver' },
      ),
    })
  }

  revalidateTag(TAG.businesses, 'max')
  revalidateTag(TAG.stats, 'max')

  return NextResponse.json({
    ok: true,
    expiredTrials: expiredTrials.length,
    suspended: overdue.length,
  })
}
