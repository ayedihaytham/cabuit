import type { MetadataRoute } from 'next'
import { appUrl } from '@/lib/email'
import { listBusinessSlugs } from '@/lib/queries'

export const revalidate = 3600

const STATIC_PATHS = [
  '',
  '/restauration',
  '/recherche',
  '/tarifs',
  '/a-propos',
  '/contact',
  '/cgu',
  '/confidentialite',
  '/mentions-legales',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.6,
  }))

  let businessEntries: MetadataRoute.Sitemap = []
  try {
    const businesses = await listBusinessSlugs()
    businessEntries = businesses.map((b) => ({
      url: `${base}/commerce/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    // base indisponible : on renvoie au moins les pages statiques
  }

  return [...staticEntries, ...businessEntries]
}
