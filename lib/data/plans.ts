import type { Plan } from '@/lib/types'

/**
 * Offres d'abonnement Blayes — cycle annuel.
 * TODO(produit) : valider les montants annuels définitifs avec l'équipe.
 */
export const PLANS: Plan[] = [
  {
    name: 'Essentiel',
    pricePerYear: 200,
    description: "L'essentiel pour être trouvé près de chez vous.",
    features: [
      'Fiche complète',
      "Jusqu'à 5 photos",
      '1 catégorie',
      'Position standard',
      'Statistiques de base',
    ],
  },
  {
    name: 'Populaire',
    pricePerYear: 300,
    description: 'La visibilité qui fait vraiment la différence.',
    features: [
      "Jusqu'à 15 photos + vidéo courte",
      'Badge Vérifié',
      'Position prioritaire',
      'Statistiques avancées',
      'Mise en avant sur la page d’accueil',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    pricePerYear: 500,
    description: 'Pour devenir une adresse incontournable.',
    features: [
      'Photos illimitées + vidéo',
      'Badges Vérifié + Coup de cœur',
      'Top 3 systématique',
      '-20% sur les espaces sponsorisés',
      'Statistiques complètes + export',
      'Support prioritaire',
    ],
  },
]

/** Durée de l'essai gratuit offert à l'inscription. TODO(produit) : à confirmer. */
export const TRIAL_DAYS = 30

export function getPlan(name: string): Plan | undefined {
  return PLANS.find((plan) => plan.name.toLowerCase() === name.toLowerCase())
}

export function formatYearlyPrice(plan: Plan): string {
  return `${plan.pricePerYear} DT / an`
}
