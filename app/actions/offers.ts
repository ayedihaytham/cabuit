'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { TAG } from '@/lib/queries'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser, getManageableBusiness } from '@/lib/session'
import { guard } from '@/lib/rate-limit'

export type OfferState = { error?: string; ok?: boolean }

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sans I,O,0,1

function makeCode() {
  let s = ''
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return s
}

// ------------------------------------------------------------------
// Commerçant
// ------------------------------------------------------------------

const offerSchema = z.object({
  title: z.string().trim().min(3, 'Titre trop court').max(80),
  discountLabel: z.string().trim().min(2, 'Ex. « -15% », « 1 offert »').max(24),
  description: z.string().trim().min(10, 'Décrivez le bon plan').max(400),
  conditions: z.string().trim().max(200).optional().or(z.literal('')),
  validUntil: z.string().optional().or(z.literal('')),
  maxRedemptions: z.coerce.number().int().min(0).max(100000).default(0),
})

async function manageableOfferBusiness(businessId: string) {
  const ctx = await getManageableBusiness(businessId)
  if (!ctx) return { error: 'Accès refusé à cette fiche.' as string }
  return { slug: ctx.business.slug }
}

export async function createOffer(
  businessId: string,
  _prev: OfferState,
  formData: FormData,
): Promise<OfferState> {
  const biz = await manageableOfferBusiness(businessId)
  if ('error' in biz) return biz

  const parsed = offerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide.' }
  const d = parsed.data

  await db.offer.create({
    data: {
      businessId,
      title: d.title,
      discountLabel: d.discountLabel,
      description: d.description,
      conditions: d.conditions || null,
      validUntil: d.validUntil ? new Date(d.validUntil) : null,
      maxRedemptions: d.maxRedemptions,
      status: 'ACTIVE',
    },
  })

  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commercial/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  revalidateTag(TAG.offers, 'max')
  revalidateTag(TAG.stats, 'max')
  return { ok: true }
}

async function manageableOffer(offerId: string) {
  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: { business: { select: { id: true, slug: true } } },
  })
  if (!offer) return null
  const ctx = await getManageableBusiness(offer.business.id)
  if (!ctx) return null
  return offer
}

export async function toggleOffer(offerId: string) {
  const offer = await manageableOffer(offerId)
  if (!offer) return { error: 'Bon plan introuvable.' }

  await db.offer.update({
    where: { id: offerId },
    data: { status: offer.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' },
  })
  revalidatePath(`/dashboard/${offer.business.id}`)
  revalidatePath(`/commercial/${offer.business.id}`)
  revalidateTag(TAG.offers, 'max')
  return { ok: true }
}

export async function deleteOffer(offerId: string) {
  const offer = await manageableOffer(offerId)
  if (!offer) return { error: 'Bon plan introuvable.' }
  await db.offer.delete({ where: { id: offerId } })
  revalidatePath(`/dashboard/${offer.business.id}`)
  revalidatePath(`/commercial/${offer.business.id}`)
  revalidatePath(`/commerce/${offer.business.slug}`)
  revalidateTag(TAG.offers, 'max')
  return { ok: true }
}

/** Le gérant (ou commercial) valide un code présenté au comptoir. */
export async function markRedemptionUsed(code: string) {
  const redemption = await db.offerRedemption.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { offer: { include: { business: { select: { id: true } } } } },
  })
  if (!redemption) return { error: 'Code inconnu.' }
  const ctx = await getManageableBusiness(redemption.offer.business.id)
  if (!ctx) return { error: 'Code inconnu.' }
  if (redemption.usedAt) return { error: 'Ce code a déjà été utilisé.' }

  await db.offerRedemption.update({ where: { id: redemption.id }, data: { usedAt: new Date() } })
  revalidatePath(`/dashboard/${redemption.offer.business.id}`)
  revalidatePath(`/commercial/${redemption.offer.business.id}`)
  return { ok: true }
}

// ------------------------------------------------------------------
// Client
// ------------------------------------------------------------------

/** Le client récupère un bon plan : crée sa récupération + un code unique. */
export async function claimOffer(
  offerId: string,
): Promise<{ error?: string; ok?: boolean; code?: string }> {
  const user = await requireUser(['CLIENT'])
  const limited = await guard('claim', 20, 60 * 60 * 1000)
  if (limited) return limited

  const account = await db.user.findUnique({ where: { id: user.id }, select: { emailVerified: true } })
  if (!account?.emailVerified) {
    return { error: 'Confirmez votre adresse email pour récupérer un bon plan (lien envoyé à l’inscription).' }
  }

  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: { business: { select: { slug: true } } },
  })
  if (!offer || offer.status !== 'ACTIVE') return { error: 'Bon plan indisponible.' }
  if (offer.validUntil && offer.validUntil < new Date()) return { error: 'Bon plan expiré.' }
  if (offer.maxRedemptions > 0 && offer.redemptionCount >= offer.maxRedemptions) {
    return { error: 'Ce bon plan a atteint sa limite.' }
  }

  const existing = await db.offerRedemption.findUnique({
    where: { offerId_userId: { offerId, userId: user.id } },
  })
  if (existing) return { ok: true, code: existing.code }

  // Code unique (retente en cas de collision)
  let code = makeCode()
  for (let i = 0; i < 5; i++) {
    const clash = await db.offerRedemption.findUnique({ where: { code } })
    if (!clash) break
    code = makeCode()
  }

  await db.$transaction([
    db.offerRedemption.create({ data: { offerId, userId: user.id, code } }),
    db.offer.update({ where: { id: offerId }, data: { redemptionCount: { increment: 1 } } }),
  ])

  revalidateTag(TAG.offers, 'max')
  return { ok: true, code }
}
