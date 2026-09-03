'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getManageableBusiness } from '@/lib/session'

async function assertManager(businessId: string) {
  const ctx = await getManageableBusiness(businessId)
  if (!ctx) throw new Error('Accès refusé')
  return ctx.business
}

function touch(businessId: string, slug: string) {
  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commercial/${businessId}`)
  revalidatePath(`/commerce/${slug}`)
}

export async function addMenuSection(businessId: string, formData: FormData) {
  const biz = await assertManager(businessId)
  const title = String(formData.get('title') ?? '').trim()
  if (title.length < 2) return { error: 'Titre requis.' }
  const count = await db.menuSection.count({ where: { businessId } })
  await db.menuSection.create({ data: { businessId, title, position: count } })
  touch(businessId, biz.slug)
  return { ok: true }
}

export async function addMenuItem(businessId: string, sectionId: string, formData: FormData) {
  const biz = await assertManager(businessId)
  const name = String(formData.get('name') ?? '').trim()
  const price = String(formData.get('price') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  if (name.length < 2 || price.length < 1) return { error: 'Nom et prix requis.' }
  const count = await db.menuItem.count({ where: { sectionId } })
  await db.menuItem.create({ data: { sectionId, name, price, description, position: count } })
  touch(businessId, biz.slug)
  return { ok: true }
}

export async function deleteMenuItem(businessId: string, itemId: string) {
  const biz = await assertManager(businessId)
  await db.menuItem.delete({ where: { id: itemId } })
  touch(businessId, biz.slug)
  return { ok: true }
}

export async function deleteMenuSection(businessId: string, sectionId: string) {
  const biz = await assertManager(businessId)
  await db.menuSection.delete({ where: { id: sectionId } })
  touch(businessId, biz.slug)
  return { ok: true }
}
