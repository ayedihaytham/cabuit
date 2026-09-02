import { cookies } from 'next/headers'
import { isGovernorate } from '@/lib/regions'

export const REGION_COOKIE = 'winou_region'

/**
 * Gouvernorat préféré du visiteur (cookie). `null` = toute la Tunisie.
 * Lisible depuis n'importe quel Server Component / Route Handler.
 */
export async function getPreferredRegion(): Promise<string | null> {
  const raw = (await cookies()).get(REGION_COOKIE)?.value
  return isGovernorate(raw) ? raw : null
}
