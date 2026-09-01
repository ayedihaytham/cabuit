'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'

async function assertOwner(businessId: string) {
  const user = await requireUser(['MERCHANT'])
  const biz = await db.business.findFirst({ where: { id: businessId, ownerId: user.id }, select: { id: true, slug: true } })
  if (!biz) throw new Error('Établissement introuvable')
  return biz
}

export async function addMenuSection(businessId: string, formData: FormData) {
  const biz = await assertOwner(businessId)
  const title = String(formData.get('title') ?? '').trim()
  if (title.length < 2) return { error: 'Titre requis.' }
  const count = await db.menuSection.count({ where: { businessId } })
  await db.menuSection.create({ data: { businessId, title, position: count } })
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  return { ok: true }
}

export async function addMenuItem(businessId: string, sectionId: string, formData: FormData) {
  const biz = await assertOwner(businessId)
  const name = String(formData.get('name') ?? '').trim()
  const price = String(formData.get('price') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  if (name.length < 2 || price.length < 1) return { error: 'Nom et prix requis.' }
  const count = await db.menuItem.count({ where: { sectionId } })
  await db.menuItem.create({ data: { sectionId, name, price, description, position: count } })
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  return { ok: true }
}

export async function deleteMenuItem(businessId: string, itemId: string) {
  const biz = await assertOwner(businessId)
  await db.menuItem.delete({ where: { id: itemId } })
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  return { ok: true }
}

export async function deleteMenuSection(businessId: string, sectionId: string) {
  const biz = await assertOwner(businessId)
  await db.menuSection.delete({ where: { id: sectionId } })
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  return { ok: true }
}
