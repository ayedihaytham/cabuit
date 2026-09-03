import type { MetadataRoute } from 'next'
import { BRAND, TAGLINE } from '@/lib/constants'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND} — ${TAGLINE}`,
    short_name: BRAND,
    description:
      'Restaurants et cafés / salons de thé de Tunisie : explorez les bons plans membres près de chez vous.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#faf6f0',
    theme_color: '#f5f0e8',
    lang: 'fr',
    categories: ['food', 'lifestyle', 'shopping'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
