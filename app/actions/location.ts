'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { requireMerchant } from '@/lib/session'
import { TAG } from '@/lib/queries'
import { DAYS, type WeekHours } from '@/lib/hours'

/** Extrait lat/lng d'un lien Google Maps ou d'une saisie "lat, lng". */
function parseCoords(input: string): { lat: number; lng: number } | null {
  const s = input.trim()
  const at = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) // .../@36.87,10.32,15z
  const q = s.match(/[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/) // ...?q=36.87,10.32
  const d = s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) // ...!3d36.87!4d10.32
  const raw = s.match(/^(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)$/) // "36.87, 10.32"
  const m = at || q || d || raw
  if (!m) return null
  const lat = Number(m[1])
  const lng = Number(m[2])
  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

export async function updateLocationHours(businessId: string, formData: FormData) {
  const user = await requireMerchant()
  const biz = await db.business.findFirst({
    where: { id: businessId, ownerId: user.id },
    select: { id: true, slug: true },
  })
  if (!biz) return { error: 'Établissement introuvable.' }

  const mapInput = String(formData.get('mapUrl') ?? '')
  const coords = mapInput ? parseCoords(mapInput) : null

  const hours = {} as WeekHours
  for (const { key } of DAYS) {
    hours[key] = {
      closed: formData.get(`${key}_closed`) === 'on',
      open: String(formData.get(`${key}_open`) ?? '09:00'),
      close: String(formData.get(`${key}_close`) ?? '22:00'),
    }
  }

  await db.business.update({
    where: { id: businessId },
    data: {
      hours: hours as object,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    },
  })

  revalidatePath(`/dashboard/${businessId}`)
  revalidatePath(`/commerce/${biz.slug}`)
  revalidateTag(TAG.businesses, 'max')
  return { ok: true, coords: Boolean(coords) }
}
