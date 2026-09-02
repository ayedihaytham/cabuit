import type { MetadataRoute } from 'next'
import { appUrl } from '@/lib/email'

export default function robots(): MetadataRoute.Robots {
  const base = appUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/espace-client', '/paiement', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
