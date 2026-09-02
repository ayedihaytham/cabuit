'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { TAG } from '@/lib/queries'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser, requireMerchant } from '@/lib/session'

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

async function assertActiveBusiness(businessId: string, ownerId: string) {
  const biz = await db.business.findFirst({
    where: { id: businessId, ownerId },
    select: { id: true, slug: true, status: true },
  })
  if (!biz) throw new Error('Établissement introuvable')
  if (biz.status !== 'ACTIVE') throw new Error('Publiez d’abord votre fiche (abonnement actif requis).')
  return biz
}

export async function createOffer(
  businessId: string,
  _prev: OfferState,
  formData: FormData,
): Promise<OfferState> {
  const user = await requireMerchant()
  let biz
  try {
    biz = await assertActiveBusiness(businessId, user.id)
  } catch (e) {
    return { error: (e as Error).message }
  }

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
  revalidatePath(`/commerce/${biz.slug}`)
  revalidateTag(TAG.offers, 'max')
  revalidateTag(TAG.stats, 'max')
  return { ok: true }
}

export async function toggleOffer(offerId: string) {
  const user = await requireMerchant()
  const offer = await db.offer.findFirst({
    where: { id: offerId, business: { ownerId: user.id } },
    include: { business: { select: { id: true, slug: true } } },
  })
  if (!offer) return { error: 'Bon plan introuvable.' }

  await db.offer.update({
    where: { id: offerId },
    data: { status: offer.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' },
  })
  revalidatePath(`/dashboard/${offer.business.id}`)
  revalidateTag(TAG.offers, 'max')
  return { ok: true }
}

export async function deleteOffer(offerId: string) {
  const user = await requireMerchant()
  const offer = await db.offer.findFirst({
    where: { id: offerId, business: { ownerId: user.id } },
    include: { business: { select: { id: true, slug: true } } },
  })
  if (!offer) return { error: 'Bon plan introuvable.' }
  await db.offer.delete({ where: { id: offerId } })
  revalidatePath(`/dashboard/${offer.business.id}`)
  revalidatePath(`/commerce/${offer.business.slug}`)
  revalidateTag(TAG.offers, 'max')
  return { ok: true }
}

/** Le commerçant valide un code présenté au comptoir. */
export async function markRedemptionUsed(code: string) {
  const user = await requireMerchant()
  const redemption = await db.offerRedemption.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { offer: { include: { business: { select: { ownerId: true, id: true } } } } },
  })
  if (!redemption || redemption.offer.business.ownerId !== user.id) {
    return { error: 'Code inconnu.' }
  }
  if (redemption.usedAt) return { error: 'Ce code a déjà été utilisé.' }

  await db.offerRedemption.update({ where: { id: redemption.id }, data: { usedAt: new Date() } })
  revalidatePath(`/dashboard/${redemption.offer.business.id}`)
  return { ok: true }
}

// ------------------------------------------------------------------
// Client
// ------------------------------------------------------------------

/** Le client récupère un bon plan : crée sa récupération + un code unique. */
export async function claimOffer(offerId: string) {
  const user = await requireUser(['CLIENT'])

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
