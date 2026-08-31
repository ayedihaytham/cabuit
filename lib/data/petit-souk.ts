import type { MenuSection, Review } from '@/lib/types'

/** Fixtures de la fiche de démonstration « Le Petit Souk ». */

export const PETIT_SOUK_GALLERY = [
  { src: '/images/restaurant.png', alt: 'Salle lumineuse du Petit Souk' },
  { src: '/images/petit-souk-interior.png', alt: 'Salle intérieure du Petit Souk' },
  { src: '/images/petit-souk-dish.png', alt: 'Couscous servi au Petit Souk' },
  { src: '/images/cafe.png', alt: 'Terrasse du restaurant' },
  { src: '/images/petit-souk-dessert.png', alt: 'Dessert aux notes de fleur d’oranger' },
  { src: '/images/hero-market.png', alt: 'Produits frais du marché' },
  { src: '/images/services.png', alt: 'Détail de la décoration' },
  { src: '/images/accessories.png', alt: 'Artisanat et objets de table' },
]

export const PETIT_SOUK_MENU: MenuSection[] = [
  {
    title: 'Entrées',
    items: [
      {
        name: 'Brik à l’œuf coulant',
        description: 'Thon, câpres, persil et citron confit',
        price: '12 DT',
      },
      {
        name: 'Salade méchouia',
        description: 'Poivrons grillés, tomates, œuf et huile d’olive',
        price: '15 DT',
      },
    ],
  },
  {
    title: 'Plats',
    items: [
      {
        name: 'Couscous du Souk',
        description: 'Agneau fondant, légumes de saison et pois chiches',
        price: '28 DT',
      },
      {
        name: 'Poulpe grillé',
        description: 'Poulpe de la côte, charmoula et pommes grenaille',
        price: '34 DT',
      },
      {
        name: 'Pâtes aux fruits de mer',
        description: 'Sauce tomate épicée, calamars et crevettes',
        price: '32 DT',
      },
    ],
  },
  {
    title: 'Desserts',
    items: [
      {
        name: 'Mhalbiya à la fleur d’oranger',
        description: 'Crème de riz, pistaches et eau de rose',
        price: '10 DT',
      },
      {
        name: 'Dattes & chocolat noir',
        description: 'Dattes Deglet Nour, chocolat et fleur de sel',
        price: '12 DT',
      },
    ],
  },
]

export const PETIT_SOUK_REVIEWS: Review[] = [
  {
    author: 'Nour B.',
    date: '12 juin 2026',
    rating: 5,
    text: 'Une adresse pleine de charme. Le couscous est généreux, le service adorable et la terrasse parfaite pour un déjeuner au soleil.',
    reply: 'Merci Nour, toute l’équipe est ravie de vous accueillir à nouveau.',
  },
  {
    author: 'Yassine M.',
    date: '4 juin 2026',
    rating: 5,
    text: 'Très belle découverte à La Marsa. Les produits sont frais et les assiettes ont beaucoup de goût.',
  },
  {
    author: 'Sarra L.',
    date: '28 mai 2026',
    rating: 4,
    text: 'Cadre chaleureux et cuisine authentique. Pensez à réserver le week-end.',
  },
  {
    author: 'Amine K.',
    date: '16 mai 2026',
    rating: 4,
    text: 'Une bonne table pour faire découvrir la cuisine tunisienne à des amis. Portions copieuses.',
    reply: 'Merci Amine pour ce joli retour.',
  },
]

export const PETIT_SOUK_RATING_DISTRIBUTION = [
  { stars: 5, count: 68, width: '79%' },
  { stars: 4, count: 14, width: '16%' },
  { stars: 3, count: 3, width: '4%' },
  { stars: 2, count: 1, width: '1%' },
  { stars: 1, count: 0, width: '0%' },
]
