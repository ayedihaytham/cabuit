import type { BusinessStatus, SubStatus } from '@prisma/client'

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, { label: string; tone: string }> = {
  DRAFT: { label: 'Brouillon', tone: 'bg-secondary text-secondary-foreground' },
  PENDING: { label: 'En validation', tone: 'bg-ochre/20 text-ochre' },
  ACTIVE: { label: 'En ligne', tone: 'bg-olive/15 text-olive' },
  SUSPENDED: { label: 'Suspendu', tone: 'bg-destructive/10 text-destructive' },
  REJECTED: { label: 'Refusé', tone: 'bg-destructive/10 text-destructive' },
}

export const SUB_STATUS_LABELS: Record<SubStatus, string> = {
  TRIALING: 'Essai en cours',
  PENDING_PAYMENT: 'Paiement attendu',
  ACTIVE: 'Abonnement actif',
  PAST_DUE: 'Impayé',
  CANCELED: 'Annulé',
}

export const CATEGORY_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurant',
  CAFE: 'Café / Salon de thé',
}
