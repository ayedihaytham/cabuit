'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { requireMerchant, requireUser } from '@/lib/session'
import { TAG } from '@/lib/queries'
import { sendEmail, layout, appUrl, escapeHtml } from '@/lib/email'
import { notify } from '@/lib/notifications'
import { CONTACT_EMAIL } from '@/lib/constants'

/** Le commerçant déclare avoir fait le virement. */
export async function declareBankTransfer(subscriptionId: string, formData: FormData) {
  const user = await requireMerchant()
  const sub = await db.subscription.findFirst({
    where: { id: subscriptionId, business: { ownerId: user.id } },
    include: { business: { select: { name: true, id: true } } },
  })
  if (!sub) return { error: 'Abonnement introuvable.' }

  const reference = String(formData.get('reference') ?? '').trim()
  if (reference.length < 3) return { error: 'Indiquez la référence du virement.' }

  const pending = await db.payment.findFirst({
    where: { subscriptionId, status: 'PENDING' },
  })
  if (pending) return { error: 'Un règlement est déjà en cours de vérification.' }

  await db.payment.create({
    data: {
      subscriptionId,
      amount: sub.pricePerYear,
      method: 'BANK_TRANSFER',
      status: 'PENDING',
      reference,
    },
  })

  void sendEmail({
    to: CONTACT_EMAIL,
    subject: `Virement déclaré — ${sub.business.name}`,
    html: layout(
      'Règlement à vérifier',
      `<p><strong>${sub.business.name}</strong> a déclaré un virement de ${sub.pricePerYear} DT.<br/>
       Référence : ${escapeHtml(reference)}</p>`,
      { href: `${appUrl()}/admin/commerces/${sub.business.id}`, label: 'Vérifier' },
    ),
  })

  revalidatePath(`/dashboard/${sub.business.id}`)
  revalidatePath('/paiement')
  return { ok: true }
}

/** L'admin confirme un règlement en attente. */
export async function confirmPayment(paymentId: string) {
  const admin = await requireUser(['ADMIN'])
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      subscription: { include: { business: { include: { owner: { select: { id: true, email: true, name: true } } } } } },
    },
  })
  if (!payment) return { error: 'Paiement introuvable.' }
  if (payment.status === 'PAID') return { error: 'Déjà confirmé.' }

  const count = await db.payment.count({ where: { status: 'PAID' } })
  const invoiceNumber = payment.invoiceNumber ?? `BLA-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
  // Renouvellement : on prolonge depuis l'échéance en cours si elle est future.
  const current = payment.subscription.currentPeriodEnd
  const base = current && current > new Date() ? new Date(current) : new Date()
  const periodEnd = new Date(base)
  periodEnd.setFullYear(periodEnd.getFullYear() + 1)

  await db.$transaction([
    db.payment.update({
      where: { id: paymentId },
      data: { status: 'PAID', paidAt: new Date(), invoiceNumber, recordedById: admin.id },
    }),
    db.subscription.update({
      where: { id: payment.subscriptionId },
      data: { status: 'ACTIVE', currentPeriodEnd: periodEnd, renewalRemindedAt: null },
    }),
    db.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'payment.confirm',
        entity: 'Payment',
        entityId: paymentId,
        meta: { invoiceNumber, amount: payment.amount },
      },
    }),
  ])

  void sendEmail({
    to: payment.subscription.business.owner.email,
    subject: `Paiement reçu — abonnement ${payment.subscription.business.name} actif`,
    html: layout(
      'Abonnement activé',
      `<p>Nous avons bien reçu votre règlement de ${payment.amount} DT (facture ${invoiceNumber}).
       Votre abonnement est actif jusqu'au ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(periodEnd)}.</p>`,
      { href: `${appUrl()}/dashboard`, label: 'Mon tableau de bord' },
    ),
  })

  void notify({
    userId: payment.subscription.business.owner.id,
    type: 'payment.confirmed',
    title: 'Paiement confirmé',
    body: `Abonnement ${payment.subscription.business.name} actif jusqu'au ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(periodEnd)}.`,
    href: `/dashboard/${payment.subscription.business.id}`,
  })

  revalidateTag(TAG.stats, 'max')
  revalidateTag(TAG.businesses, 'max')
  revalidatePath(`/admin/commerces/${payment.subscription.business.id}`)
  return { ok: true, invoiceNumber }
}
