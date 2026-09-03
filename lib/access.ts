import type { Role } from '@prisma/client'

export type Principal = { id: string; role: Role }
export type BusinessAccess = {
  ownerId: string
  createdById: string | null
  claimedByOwnerAt: Date | null
}

/**
 * Peut éditer une fiche : le gérant, un admin, ou le commercial qui l'a créée
 * tant que le gérant n'a pas repris la main. Fonction pure (testable).
 */
export function canManageBusiness(user: Principal, biz: BusinessAccess): boolean {
  if (user.role === 'ADMIN') return true
  if (biz.ownerId === user.id) return true
  if (user.role === 'COMMERCIAL' && biz.createdById === user.id && !biz.claimedByOwnerAt) return true
  return false
}
