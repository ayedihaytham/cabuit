import type { Business as DbBusiness, BusinessPhoto, Category as DbCategory } from '@prisma/client'
import type { Business as UiBusiness, Category as UiCategory } from '@/lib/types'

const CATEGORY_UI: Record<DbCategory, UiCategory> = {
  RESTAURANT: 'Restauration',
  CAFE: 'Cafés & salons de thé',
}

/** DB -> forme attendue par les composants d'annuaire. `image` vide = pas de photo (placeholder). */
export function toUiBusiness(row: DbBusiness & { photos?: BusinessPhoto[] }): UiBusiness {
  return {
    slug: row.slug,
    name: row.name,
    category: CATEGORY_UI[row.category],
    type: row.type,
    city: row.city,
    address: row.address,
    description: row.description,
    image: row.photos?.[0]?.url ?? '',
    verified: row.verified,
    rating: row.rating,
    reviewCount: row.reviewCount,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    instagram: row.instagram ?? undefined,
  }
}
