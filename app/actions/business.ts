'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { slugify } from '@/lib/slug'
import { businessSchema, submitSchema } from '@/lib/validations'
import { PLANS } from '@/lib/data/plans'
import { TAG } from '@/lib/queries'

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; ok?: boolean }

async function uniqueSlug(base: string) {
  const root = slugify(base) || 'commerce'
  let slug = root
  let n = 2
  while (await db.business.findUnique({ where: { slug } })) {
    slug = `${root}-${n++}`
  }
  return slug
}

/** Crée un établissement (brouillon) pour le commerçant connecté. */
export async function createBusiness(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser(['MERCHANT'])

  const parsed = businessSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const data = parsed.data

  const business = await db.business.create({
    data: {
      ownerId: user.id,
      name: data.name,
      slug: await uniqueSlug(data.name),
      category: data.category,
      type: data.type,
      region: data.region,
      city: data.city,
      address: data.address,
      description: data.description,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      instagram: data.instagram || null,
      status: 'DRAFT',
    },
  })

  revalidatePath('/dashboard')
  redirect(`/dashboard/${business.id}?created=1`)
}

/** Met à jour la fiche (propriétaire uniquement). */
export async function updateBusiness(businessId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser(['MERCHANT'])
  const existing = await db.business.findFirst({ where: { id: businessId, ownerId: user.id } })
  if (!existing) return { error: 'Établissement introuvable.' }

  const parsed = businessSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }
  const data = parsed.data

  await db.business.update({
    where: { id: businessId },
    data: {
      name: data.name,
      category: data.category,
      type: data.type,
      region: data.region,
      city: data.city,
      address: data.address,
      description: data.description,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      instagram: data.instagram || null,
    },
  })

  revalidatePath(`/dashboard/${businessId}`)
  revalidateTag(TAG.businesses, 'max')
  return { ok: true }
}

/**
 * Soumet l'établissement à validation : crée l'abonnement avec l'acceptation
 * des CGA (horodatée + IP) et passe le statut à PENDING.
 */
export async function submitBusiness(businessId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser(['MERCHANT'])
  const business = await db.business.findFirst({
    where: { id: businessId, ownerId: user.id },
    include: { subscription: true },
  })
  if (!business) return { error: 'Établissement introuvable.' }
  if (business.status !== 'DRAFT' && business.status !== 'REJECTED') {
    return { error: 'Cet établissement est déjà soumis.' }
  }

  const parsed = submitSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }

  const plan = PLANS.find((p) => p.name.toUpperCase() === parsed.data.tier)
  if (!plan) return { error: 'Offre inconnue.' }

  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'inconnue'

  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 30)

  await db.$transaction([
    db.subscription.upsert({
      where: { businessId },
      update: {
        tier: parsed.data.tier,
        pricePerYear: plan.pricePerYear,
        acceptedTermsAt: new Date(),
        acceptedTermsIp: ip,
        status: 'TRIALING',
        trialEndsAt: trialEnd,
      },
      create: {
        businessId,
        tier: parsed.data.tier,
        pricePerYear: plan.pricePerYear,
        status: 'TRIALING',
        trialEndsAt: trialEnd,
        acceptedTermsAt: new Date(),
        acceptedTermsIp: ip,
        contractVersion: 'v1',
      },
    }),
    db.business.update({ where: { id: businessId }, data: { status: 'PENDING' } }),
  ])

  revalidateTag(TAG.stats, 'max')
  redirect('/dashboard?submitted=1')
}

/** Édition d'une fiche par un ADMIN (pour corriger un abonné). */
export async function adminUpdateBusiness(
  businessId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireUser(['ADMIN'])

  const parsed = businessSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }
  const d = parsed.data

  const biz = await db.business.update({
    where: { id: businessId },
    data: {
      name: d.name,
      category: d.category,
      type: d.type,
      region: d.region,
      city: d.city,
      address: d.address,
      description: d.description,
      phone: d.phone || null,
      whatsapp: d.whatsapp || null,
      instagram: d.instagram || null,
    },
  })
  await db.auditLog.create({
    data: { actorId: admin.id, action: 'business.edit', entity: 'Business', entityId: businessId },
  })

  revalidateTag(TAG.businesses, 'max')
  revalidatePath(`/admin/commerces/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  return { ok: true }
}
