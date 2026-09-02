'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { put } from '@vercel/blob'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireMerchant } from '@/lib/session'
import { TAG } from '@/lib/queries'

const MAX_PHOTOS = 8
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const urlSchema = z.string().trim().url('URL invalide').startsWith('http', 'Doit commencer par http')

async function ownedBusiness(businessId: string, ownerId: string) {
  const biz = await db.business.findFirst({
    where: { id: businessId, ownerId },
    select: { id: true, slug: true, _count: { select: { photos: true } } },
  })
  if (!biz) throw new Error('Établissement introuvable')
  return biz
}

export async function addPhoto(businessId: string, formData: FormData) {
  const user = await requireMerchant()
  let biz
  try {
    biz = await ownedBusiness(businessId, user.id)
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (biz._count.photos >= MAX_PHOTOS) return { error: `Maximum ${MAX_PHOTOS} photos.` }

  const parsed = urlSchema.safeParse(formData.get('url'))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await db.businessPhoto.create({
    data: { businessId, url: parsed.data, position: biz._count.photos },
  })
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  revalidateTag(TAG.businesses, 'max')
  return { ok: true }
}

export async function uploadPhoto(businessId: string, formData: FormData) {
  const user = await requireMerchant()
  let biz
  try {
    biz = await ownedBusiness(businessId, user.id)
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (biz._count.photos >= MAX_PHOTOS) return { error: `Maximum ${MAX_PHOTOS} photos.` }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Aucun fichier.' }
  if (!ACCEPTED.includes(file.type)) return { error: 'Format accepté : JPG, PNG, WebP ou AVIF.' }
  if (file.size > MAX_BYTES) return { error: 'Image trop lourde (5 Mo max).' }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "L'upload n'est pas encore configuré. Collez une URL d'image pour l'instant." }
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  let url: string
  try {
    const blob = await put(`businesses/${businessId}/${crypto.randomUUID()}.${ext}`, file, {
      access: 'public',
      contentType: file.type,
    })
    url = blob.url
  } catch {
    return { error: "Échec de l'envoi. Réessayez." }
  }

  await db.businessPhoto.create({ data: { businessId, url, position: biz._count.photos } })
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  revalidateTag(TAG.businesses, 'max')
  return { ok: true }
}

export async function removePhoto(photoId: string) {
  const user = await requireMerchant()
  const photo = await db.businessPhoto.findFirst({
    where: { id: photoId, business: { ownerId: user.id } },
    include: { business: { select: { id: true, slug: true } } },
  })
  if (!photo) return { error: 'Photo introuvable.' }
  await db.businessPhoto.delete({ where: { id: photoId } })
  // recompacte les positions
  const rest = await db.businessPhoto.findMany({
    where: { businessId: photo.business.id },
    orderBy: { position: 'asc' },
  })
  await db.$transaction(
    rest.map((p, i) => db.businessPhoto.update({ where: { id: p.id }, data: { position: i } })),
  )
  revalidatePath(`/dashboard/${photo.business.id}`)
  revalidatePath(`/commerce/${photo.business.slug}`)
  revalidateTag(TAG.businesses, 'max')
  return { ok: true }
}

export async function setCover(photoId: string) {
  const user = await requireMerchant()
  const photo = await db.businessPhoto.findFirst({
    where: { id: photoId, business: { ownerId: user.id } },
    include: { business: { select: { id: true, slug: true } } },
  })
  if (!photo) return { error: 'Photo introuvable.' }
  const others = await db.businessPhoto.findMany({
    where: { businessId: photo.business.id, id: { not: photoId } },
    orderBy: { position: 'asc' },
  })
  await db.$transaction([
    db.businessPhoto.update({ where: { id: photoId }, data: { position: 0 } }),
    ...others.map((p, i) => db.businessPhoto.update({ where: { id: p.id }, data: { position: i + 1 } })),
  ])
  revalidatePath(`/dashboard/${photo.business.id}`)
  revalidatePath(`/commerce/${photo.business.slug}`)
  revalidateTag(TAG.businesses, 'max')
  return { ok: true }
}
