import type { Category } from '@/lib/types'

export const BRAND = 'Blayes'
export const TAGLINE = 'Les bonnes adresses près de chez toi'
export const CONTACT_EMAIL = 'bonjour@blayes.tn'
export const INSTAGRAM_URL = 'https://instagram.com/blayes.tn'

/** Blayes regroupe uniquement des restaurants et des cafés / salons de thé. */
export const CATEGORIES: Category[] = ['Restauration', 'Cafés & salons de thé']

export const CITIES = [
  'Tunis Centre',
  'La Marsa',
  'Carthage',
  'Sidi Bou Saïd',
  'Les Berges du Lac',
  'Ariana',
] as const

export const SORT_OPTIONS = ['Pertinence', 'Proximité', 'Nouveauté', 'Note'] as const

export const FOOTER_LINKS = [
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
  { label: 'CGA', href: '/cgu' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'Mentions légales', href: '/mentions-legales' },
]

export const MARKETING_NAV = [
  { label: 'Explorer', href: '/#categories' },
  { label: 'Les bonnes adresses', href: '/#selection' },
  { label: 'Tarifs', href: '/tarifs' },
]
