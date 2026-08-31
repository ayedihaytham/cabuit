export type Category = 'Restauration' | 'Cafés & salons de thé'

export type Business = {
  /** Identifiant stable, sert d'URL : /commerce/<slug> */
  slug: string
  name: string
  category: Category
  /** Type de cuisine / d'ambiance affiché en libellé (ex. « Cuisine tunisienne »). */
  type: string
  city: string
  address: string
  description: string
  image: string
  verified: boolean
  rating: number
  reviewCount: number
  /** Badge éditorial optionnel (« Coup de cœur », « Nouveau »…). */
  tag?: string
  phone?: string
  whatsapp?: string
  instagram?: string
}

export type MenuItem = {
  name: string
  description: string
  price: string
}

export type MenuSection = {
  title: string
  items: MenuItem[]
}

export type Review = {
  author: string
  date: string
  rating: number
  text: string
  reply?: string
}

export type Plan = {
  name: string
  /** Prix de l'abonnement annuel, en dinars. */
  pricePerYear: number
  description: string
  features: string[]
  popular?: boolean
}

export type AdReservation = {
  id: string
  businessName: string
  businessSlug: string
  category: Category
  dates: string
  days: number
  paid: number
  status: string
}
