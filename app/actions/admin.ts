'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { BusinessStatus } from '@prisma/client'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { TAG } from '@/lib/queries'
import { sendEmail, layout, appUrl } from '@/lib/email'

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
    include: { subscription: true, owner: { select: { email: true, name: true } } },
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
      subject: `${business.name} est en ligne sur Blayes 🎉`,
      html: layout(
        'Votre fiche est validée',
        `<p>Bonjour ${business.owner.name ?? ''},</p>
         <p><strong>${business.name}</strong> est désormais visible par tous les membres Blayes.
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
