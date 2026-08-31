import type { Business, Category } from '@/lib/types'
import { SORT_OPTIONS } from '@/lib/constants'

/**
 * Source unique des commerces référencés (données de démonstration).
 * Chaque page qui affiche des adresses lit ce tableau — ne pas dupliquer ailleurs.
 */
export const BUSINESSES: Business[] = [
  {
    slug: 'le-petit-souk',
    name: 'Le Petit Souk',
    category: 'Restauration',
    type: 'Cuisine tunisienne',
    city: 'La Marsa',
    address: '12 rue du Marché, La Marsa',
    description:
      'Une table généreuse et solaire au cœur de La Marsa, qui revisite les recettes de nos grand-mères avec les produits du marché.',
    image: '/images/petit-souk-interior.png',
    verified: true,
    rating: 4.8,
    reviewCount: 86,
    tag: 'Coup de cœur',
    phone: '+21671123456',
    whatsapp: '21671123456',
    instagram: '@lepetitsouk.tn',
  },
  {
    slug: 'dar-zarrouk',
    name: 'Dar Zarrouk',
    category: 'Restauration',
    type: 'Cuisine méditerranéenne',
    city: 'Sidi Bou Saïd',
    address: 'Rue Hédi Zarrouk, Sidi Bou Saïd',
    description:
      'Une table méditerranéenne avec vue sur la baie et des assiettes pleines de soleil.',
    image: '/images/restaurant.png',
    verified: true,
    rating: 4.7,
    reviewCount: 54,
    tag: 'Nouveau',
  },
  {
    slug: 'le-comptoir-de-tunis',
    name: 'Le Comptoir de Tunis',
    category: 'Restauration',
    type: 'Bistronomie',
    city: 'Tunis Centre',
    address: '5 rue de la Médina, Tunis Centre',
    description:
      'Des recettes locales revisitées dans un décor vivant, au cœur de la médina.',
    image: '/images/cafe.png',
    verified: true,
    rating: 4.6,
    reviewCount: 41,
  },
  {
    slug: 'la-table-du-marche',
    name: 'La Table du Marché',
    category: 'Restauration',
    type: 'Cuisine locale',
    city: 'La Marsa',
    address: 'Avenue Habib Bourguiba, La Marsa',
    description:
      'Une cuisine généreuse, des produits du jour et une ambiance comme à la maison.',
    image: '/images/hero-market.png',
    verified: false,
    rating: 4.4,
    reviewCount: 22,
  },
  {
    slug: 'carthage-kitchen',
    name: 'Carthage Kitchen',
    category: 'Restauration',
    type: 'Cuisine fusion',
    city: 'Carthage',
    address: 'Route de la Goulette, Carthage',
    description:
      'Le spot décontracté pour partager des plats inspirés des deux rives de la Méditerranée.',
    image: '/images/services.png',
    verified: true,
    rating: 4.5,
    reviewCount: 30,
  },
  {
    slug: 'cafe-panorama',
    name: 'Café Panorama',
    category: 'Cafés & salons de thé',
    type: 'Café de spécialité',
    city: 'La Marsa',
    address: 'Corniche de La Marsa',
    description:
      'Torréfaction maison, pâtisseries du jour et une terrasse ouverte sur la mer.',
    image: '/images/cafe.png',
    verified: true,
    rating: 4.6,
    reviewCount: 38,
    tag: 'Nouveau',
  },
  {
    slug: 'salon-el-bahia',
    name: 'Salon El Bahia',
    category: 'Cafés & salons de thé',
    type: 'Salon de thé',
    city: 'Sidi Bou Saïd',
    address: 'Place Sidi Bou Saïd',
    description:
      'Thé à la menthe, cornes de gazelle et jeu de cartes : le salon de thé de quartier dans toute sa douceur.',
    image: '/images/hero-market.png',
    verified: true,
    rating: 4.7,
    reviewCount: 45,
  },
  {
    slug: 'la-terrasse-21',
    name: 'La Terrasse 21',
    category: 'Cafés & salons de thé',
    type: 'Café-restaurant',
    city: 'Les Berges du Lac',
    address: 'Rue du Lac Turkana, Les Berges du Lac',
    description:
      'Brunchs le week-end, cafés filtres en semaine et un rooftop qui prend le soleil toute la journée.',
    image: '/images/services.png',
    verified: false,
    rating: 4.2,
    reviewCount: 17,
  },
  {
    slug: 'maison-jasmin',
    name: 'Maison Jasmin',
    category: 'Cafés & salons de thé',
    type: 'Salon de thé',
    city: 'Ariana',
    address: 'Avenue de l’Indépendance, Ariana',
    description:
      'Un salon de thé lumineux avec une belle sélection d’infusions et de douceurs sans sucre ajouté.',
    image: '/images/accessories.png',
    verified: true,
    rating: 4.5,
    reviewCount: 26,
  },
  {
    slug: 'chez-aicha',
    name: 'Chez Aïcha',
    category: 'Restauration',
    type: 'Cuisine tunisienne',
    city: 'Tunis Centre',
    address: 'Rue Charles de Gaulle, Tunis Centre',
    description:
      'Une adresse discrète pour goûter aux classiques tunisiens sans chichi.',
    image: '/images/restaurant.png',
    verified: true,
    rating: 4.4,
    reviewCount: 19,
  },
]

export function getBusiness(slug: string): Business | undefined {
  return BUSINESSES.find((business) => business.slug === slug)
}

export function getBusinessesByCategory(category: Category): Business[] {
  return BUSINESSES.filter((business) => business.category === category)
}

type FilterOptions = {
  query?: string
  category?: Category | 'all'
  city?: string | 'all'
  verifiedOnly?: boolean
  sort?: (typeof SORT_OPTIONS)[number]
}

export function filterBusinesses({
  query = '',
  category = 'all',
  city = 'all',
  verifiedOnly = false,
  sort = 'Pertinence',
}: FilterOptions): Business[] {
  const term = query.trim().toLowerCase()

  const filtered = BUSINESSES.filter((business) => {
    const matchesTerm =
      !term ||
      [business.name, business.category, business.type, business.city].some((value) =>
        value.toLowerCase().includes(term),
      )
    const matchesCategory = category === 'all' || business.category === category
    const matchesCity = city === 'all' || business.city === city
    const matchesVerified = !verifiedOnly || business.verified
    return matchesTerm && matchesCategory && matchesCity && matchesVerified
  })

  if (sort === 'Note') return [...filtered].sort((a, b) => b.rating - a.rating)
  if (sort === 'Nouveauté') return [...filtered].reverse()
  if (sort === 'Proximité') {
    return [...filtered].sort((a, b) => a.city.localeCompare(b.city))
  }
  return filtered
}
