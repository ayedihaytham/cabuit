'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { put } from '@vercel/blob'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getManageableBusiness } from '@/lib/session'
import { TAG } from '@/lib/queries'

const MAX_PHOTOS = 8
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const urlSchema = z.string().trim().url('URL invalide').startsWith('http', 'Doit commencer par http')

async function manageableWithPhotoCount(businessId: string) {
  const ctx = await getManageableBusiness(businessId)
  if (!ctx) return null
  const count = await db.businessPhoto.count({ where: { businessId } })
  return { slug: ctx.business.slug, count }
}

function touch(businessId: string, slug: string) {
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commercial/${businessId}`)
  revalidatePath(`/commerce/${slug}`)
  revalidateTag(TAG.businesses, 'max')
}

export async function addPhoto(businessId: string, formData: FormData) {
  const biz = await manageableWithPhotoCount(businessId)
  if (!biz) return { error: 'Accès refusé à cette fiche.' }
  if (biz.count >= MAX_PHOTOS) return { error: `Maximum ${MAX_PHOTOS} photos.` }

  const parsed = urlSchema.safeParse(formData.get('url'))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await db.businessPhoto.create({
    data: { businessId, url: parsed.data, position: biz.count },
  })
  touch(businessId, biz.slug)
  return { ok: true }
}

export async function uploadPhoto(businessId: string, formData: FormData) {
  const biz = await manageableWithPhotoCount(businessId)
  if (!biz) return { error: 'Accès refusé à cette fiche.' }
  if (biz.count >= MAX_PHOTOS) return { error: `Maximum ${MAX_PHOTOS} photos.` }

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

  await db.businessPhoto.create({ data: { businessId, url, position: biz.count } })
  touch(businessId, biz.slug)
  return { ok: true }
}

async function manageablePhoto(photoId: string) {
  const photo = await db.businessPhoto.findUnique({
    where: { id: photoId },
    include: { business: { select: { id: true, slug: true } } },
  })
  if (!photo) return null
  const ctx = await getManageableBusiness(photo.business.id)
  if (!ctx) return null
  return photo
}

export async function removePhoto(photoId: string) {
  const photo = await manageablePhoto(photoId)
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
  touch(photo.business.id, photo.business.slug)
  return { ok: true }
}

export async function setCover(photoId: string) {
  const photo = await manageablePhoto(photoId)
  if (!photo) return { error: 'Photo introuvable.' }
  const others = await db.businessPhoto.findMany({
    where: { businessId: photo.business.id, id: { not: photoId } },
    orderBy: { position: 'asc' },
  })
  await db.$transaction([
    db.businessPhoto.update({ where: { id: photoId }, data: { position: 0 } }),
    ...others.map((p, i) => db.businessPhoto.update({ where: { id: p.id }, data: { position: i + 1 } })),
  ])
  touch(photo.business.id, photo.business.slug)
  return { ok: true }
}
