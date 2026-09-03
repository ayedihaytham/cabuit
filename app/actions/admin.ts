'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { BusinessStatus } from '@prisma/client'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { TAG } from '@/lib/queries'
import { sendEmail, layout, appUrl } from '@/lib/email'
import { notify } from '@/lib/notifications'

const TRANSITIONS: Record<string, BusinessStatus> = {
  approve: 'ACTIVE',
  reject: 'REJECTED',
  suspend: 'SUSPENDED',
  reactivate: 'ACTIVE',
}

/** Change le statut d'un commerce (ADMIN) + trace dans AuditLog. */
export async function moderateBusiness(businessId: string, action: keyof typeof TRANSITIONS) {
  const admin = await requireUser(['ADMIN'])
  const nextStatus = TRANSITIONS[action]
  if (!nextStatus) return { error: 'Action inconnue.' }

  const business = await db.business.findUnique({
    where: { id: businessId },
    include: { subscription: true, owner: { select: { id: true, email: true, name: true } } },
  })
  if (!business) return { error: 'Commerce introuvable.' }

  await db.$transaction([
    db.business.update({ where: { id: businessId }, data: { status: nextStatus } }),
    ...(action === 'approve' && business.subscription && business.subscription.status === 'TRIALING'
      ? [db.subscription.update({ where: { businessId }, data: { status: 'TRIALING' } })]
      : []),
    ...(action === 'suspend' && business.subscription
      ? [db.subscription.update({ where: { businessId }, data: { status: 'PAST_DUE' } })]
      : []),
    db.auditLog.create({
      data: {
        actorId: admin.id,
        action: `business.${action}`,
        entity: 'Business',
        entityId: businessId,
        meta: { from: business.status, to: nextStatus },
      },
    }),
  ])

  if (action === 'approve') {
    void sendEmail({
      to: business.owner.email,
      subject: `${business.name} est en ligne sur Winou 🎉`,
      html: layout(
        'Votre fiche est validée',
        `<p>Bonjour ${business.owner.name ?? ''},</p>
         <p><strong>${business.name}</strong> est désormais visible par tous les membres Winou.
         Pensez à ajouter vos photos et à publier un bon plan pour attirer vos premiers clients.</p>`,
        { href: `${appUrl()}/dashboard`, label: 'Ouvrir mon tableau de bord' },
      ),
    })
  } else if (action === 'reject') {
    void sendEmail({
      to: business.owner.email,
      subject: `Votre fiche ${business.name} nécessite des corrections`,
      html: layout(
        'Fiche à corriger',
        `<p>Votre fiche <strong>${business.name}</strong> n'a pas pu être validée. Corrigez les
         informations depuis votre tableau de bord et renvoyez-la.</p>`,
        { href: `${appUrl()}/dashboard`, label: 'Corriger ma fiche' },
      ),
    })
  }

  const NOTIF: Record<string, { title: string; body: string }> = {
    approve: { title: 'Fiche validée 🎉', body: `${business.name} est en ligne sur Winou.` },
    reject: { title: 'Fiche à corriger', body: `${business.name} n'a pas pu être validée.` },
    suspend: { title: 'Fiche suspendue', body: `${business.name} n'est plus visible.` },
    reactivate: { title: 'Fiche réactivée', body: `${business.name} est de nouveau en ligne.` },
  }
  if (NOTIF[action]) {
    void notify({
      userId: business.owner.id,
      type: `business.${action}`,
      title: NOTIF[action].title,
      body: NOTIF[action].body,
      href: `/dashboard/${businessId}`,
    })
  }

  revalidateTag(TAG.businesses, 'max')
  revalidateTag(TAG.stats, 'max')
  revalidatePath(`/admin/commerces/${businessId}`)
  return { ok: true, status: nextStatus }
}

/** Enregistre un paiement manuel (virement / espèces) sur un abonnement. */
export async function recordPayment(subscriptionId: string, amount: number, method: string) {
  const admin = await requireUser(['ADMIN'])
  const sub = await db.subscription.findUnique({ where: { id: subscriptionId } })
  if (!sub) return { error: 'Abonnement introuvable.' }

  const count = await db.payment.count()
  const invoiceNumber = `BLA-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
  const periodEnd = new Date()
  periodEnd.setFullYear(periodEnd.getFullYear() + 1)

  await db.$transaction([
    db.payment.create({
      data: {
        subscriptionId,
        amount,
        method: method as never,
        status: 'PAID',
        paidAt: new Date(),
        invoiceNumber,
        recordedById: admin.id,
      },
    }),
    db.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'ACTIVE', currentPeriodEnd: periodEnd },
    }),
    db.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'payment.record',
        entity: 'Subscription',
        entityId: subscriptionId,
        meta: { amount, method, invoiceNumber },
      },
    }),
  ])

  revalidateTag(TAG.stats, 'max')
  revalidatePath(`/admin/commerces`)
  return { ok: true, invoiceNumber }
}

// ------------------------------------------------------------------
// Modération des bons plans
// ------------------------------------------------------------------

export async function adminModerateOffer(offerId: string, action: 'pause' | 'activate' | 'remove') {
  const admin = await requireUser(['ADMIN'])
  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: { business: { select: { slug: true } } },
  })
  if (!offer) return { error: 'Bon plan introuvable.' }

  if (action === 'remove') {
    await db.offer.delete({ where: { id: offerId } })
  } else {
    await db.offer.update({
      where: { id: offerId },
      data: { status: action === 'pause' ? 'PAUSED' : 'ACTIVE' },
    })
  }
  await db.auditLog.create({
    data: { actorId: admin.id, action: `offer.${action}`, entity: 'Offer', entityId: offerId },
  })

  revalidateTag(TAG.offers, 'max')
  revalidateTag(TAG.stats, 'max')
  revalidatePath(`/commerce/${offer.business.slug}`)
  revalidatePath('/admin')
  return { ok: true }
}

// ------------------------------------------------------------------
// Messages de contact
// ------------------------------------------------------------------

export async function markContactHandled(id: string) {
  await requireUser(['ADMIN'])
  await db.contactMessage.update({ where: { id }, data: { handled: true } })
  revalidateTag(TAG.stats, 'max')
  revalidatePath('/admin')
  return { ok: true }
}

// ------------------------------------------------------------------
// Utilisateurs
// ------------------------------------------------------------------

const ROLES = ['CLIENT', 'MERCHANT', 'COMMERCIAL', 'ADMIN'] as const
type RoleValue = (typeof ROLES)[number]

export async function adminSetUserRole(userId: string, role: RoleValue) {
  const admin = await requireUser(['ADMIN'])
  if (!ROLES.includes(role)) return { error: 'Rôle inconnu.' }
  if (userId === admin.id) return { error: 'Vous ne pouvez pas changer votre propre rôle.' }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, _count: { select: { businesses: true } } },
  })
  if (!target) return { error: 'Utilisateur introuvable.' }
  if (target.role === role) return { ok: true }

  if (target.role === 'ADMIN') {
    const admins = await db.user.count({ where: { role: 'ADMIN' } })
    if (admins <= 1) return { error: 'Impossible : c’est le dernier administrateur.' }
  }
  if (role === 'CLIENT' && target._count.businesses > 0) {
    return { error: 'Cet utilisateur possède des établissements — gardez-le commerçant.' }
  }

  await db.user.update({ where: { id: userId }, data: { role } })
  await db.auditLog.create({
    data: { actorId: admin.id, action: `user.role.${role}`, entity: 'User', entityId: userId },
  })
  revalidatePath('/admin/utilisateurs')
  revalidateTag(TAG.stats, 'max')
  return { ok: true }
}
