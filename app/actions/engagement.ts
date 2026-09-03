'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { TAG } from '@/lib/queries'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser, getSessionUser, getManageableBusiness } from '@/lib/session'
import { guard } from '@/lib/rate-limit'
import { notify } from '@/lib/notifications'

// ------------------------------------------------------------------
// Favoris (client)
// ------------------------------------------------------------------

export async function toggleFavorite(businessId: string) {
  const user = await requireUser(['CLIENT'])
  const existing = await db.favorite.findUnique({
    where: { userId_businessId: { userId: user.id, businessId } },
  })

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } })
  } else {
    await db.favorite.create({ data: { userId: user.id, businessId } })
    await db.event.create({ data: { type: 'FAVORITE_ADD', userId: user.id, businessId } }).catch(() => {})
  }

  revalidatePath('/espace-client')
  return { favorited: !existing }
}

// ------------------------------------------------------------------
// Clic contact (log) — appelé avant d'ouvrir tel:/wa.me
// ------------------------------------------------------------------

export async function logContactClick(businessId: string) {
  const user = await getSessionUser()
  await db.event
    .create({ data: { type: 'CONTACT_CLICK', businessId, userId: user?.id ?? null } })
    .catch(() => {})
}

// ------------------------------------------------------------------
// Avis
// ------------------------------------------------------------------

export type ReviewState = { error?: string; ok?: boolean }

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10, 'Votre avis doit faire au moins 10 caractères').max(1000),
})

/** Un client publie / met à jour son avis (statut PENDING -> modération admin). */
export async function submitReview(
  businessId: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await requireUser(['CLIENT'])
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide.' }
  }

  await db.review.upsert({
    where: { businessId_authorId: { businessId, authorId: user.id } },
    update: { rating: parsed.data.rating, text: parsed.data.text, status: 'PENDING' },
    create: {
      businessId,
      authorId: user.id,
      rating: parsed.data.rating,
      text: parsed.data.text,
      status: 'PENDING',
    },
  })

  revalidatePath(`/commerce`)
  return { ok: true }
}

/** Le commerçant répond à un avis publié sur sa fiche. */
export async function replyToReview(
  reviewId: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { business: { select: { id: true, slug: true } } },
  })
  if (!review) return { error: 'Avis introuvable.' }
  const ctx = await getManageableBusiness(review.business.id)
  if (!ctx) return { error: 'Avis introuvable.' }

  const reply = String(formData.get('reply') ?? '').trim()
  if (reply.length < 3) return { error: 'Réponse trop courte.' }

  await db.review.update({
    where: { id: reviewId },
    data: { ownerReply: reply, ownerRepliedAt: new Date() },
  })
  revalidatePath(`/commerce/${review.business.slug}`)
  revalidatePath('/dashboard')
  return { ok: true }
}

/** Modération admin d'un avis. */
export async function moderateReview(reviewId: string, action: 'publish' | 'reject') {
  const admin = await requireUser(['ADMIN'])
  const status = action === 'publish' ? 'PUBLISHED' : 'REJECTED'
  const review = await db.review.update({
    where: { id: reviewId },
    data: { status },
    include: { business: { select: { id: true, name: true, ownerId: true } } },
  })

  if (action === 'publish') {
    void notify({
      userId: review.business.ownerId,
      type: 'review.published',
      title: 'Nouvel avis publié',
      body: `Un client a laissé un avis (${review.rating}/5) sur ${review.business.name}.`,
      href: `/dashboard/${review.business.id}`,
    })
  }

  // Recalcule note + nombre d'avis publiés du commerce
  const agg = await db.review.aggregate({
    where: { businessId: review.business.id, status: 'PUBLISHED' },
    _avg: { rating: true },
    _count: true,
  })
  await db.business.update({
    where: { id: review.business.id },
    data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
  })

  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: `review.${action}`,
      entity: 'Review',
      entityId: reviewId,
    },
  })

  revalidateTag(TAG.stats, 'max')
  revalidateTag(TAG.businesses, 'max')
  revalidatePath('/admin')
  return { ok: true }
}

// ------------------------------------------------------------------
// Signalements
// ------------------------------------------------------------------

export type ReportState = { error?: string; ok?: boolean }

export async function submitReport(
  businessId: string,
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const limited = await guard('report', 10, 60 * 60 * 1000)
  if (limited) return limited
  const user = await getSessionUser()
  const reason = String(formData.get('reason') ?? '').trim()
  const detail = String(formData.get('detail') ?? '').trim()
  if (reason.length < 3) return { error: 'Précisez le motif.' }

  await db.report.create({
    data: { businessId, reporterId: user?.id ?? null, reason, detail: detail || null },
  })
  revalidateTag(TAG.stats, 'max')
  return { ok: true }
}

export async function resolveReport(reportId: string, action: 'RESOLVED' | 'DISMISSED') {
  const admin = await requireUser(['ADMIN'])
  await db.report.update({
    where: { id: reportId },
    data: { status: action, resolvedById: admin.id, resolvedAt: new Date() },
  })
  revalidateTag(TAG.stats, 'max')
  revalidatePath('/admin')
  return { ok: true }
}
