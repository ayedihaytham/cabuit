'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { isGovernorate } from '@/lib/regions'
import { REGION_COOKIE } from '@/lib/region-prefs'

const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Enregistre le gouvernorat choisi par le visiteur (ou `null` = toute la Tunisie).
 * Cookie non-httpOnly : pas de donnée sensible, et pratique côté client.
 */
export async function setRegion(key: string | null): Promise<{ ok: true }> {
  const jar = await cookies()
  if (key && isGovernorate(key)) {
    jar.set(REGION_COOKIE, key, { maxAge: ONE_YEAR, sameSite: 'lax', path: '/' })
  } else {
    jar.delete(REGION_COOKIE)
  }
  revalidatePath('/', 'layout')
  return { ok: true }
}
