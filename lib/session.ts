import { redirect } from 'next/navigation'
import type { Role } from '@prisma/client'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export type SessionUser = { id: string; name: string | null; email: string; role: Role }

/** Identité issue du JWT — aucun accès base de données. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? '',
    role: session.user.role,
  }
}

/** Ligne User complète (createdAt, phone, city…) — 1 requête base. */
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
}

/**
 * Exige une session ; redirige vers la bonne page de login sinon.
 * `roles` : rôles autorisés (ADMIN passe partout). Ne touche pas la base.
 */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    redirect(roles?.includes('CLIENT') ? '/connexion-client' : '/connexion')
  }
  if (roles && user.role !== 'ADMIN' && !roles.includes(user.role)) {
    redirect('/')
  }
  return user
}

/**
 * Espace commerçant strict : un ADMIN est renvoyé vers sa console (il n'a
 * pas d'établissement à lui). Pour voir la fiche d'un abonné, l'admin
 * passe par /admin/commerces/[id].
 */
export async function requireMerchant(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/connexion')
  if (user.role === 'ADMIN') redirect('/admin')
  if (user.role === 'COMMERCIAL') redirect('/commercial')
  if (user.role !== 'MERCHANT') redirect('/')
  return user
}

/** Espace commercial : équipe terrain qui onboarde les établissements. */
export async function requireCommercial(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/connexion')
  if (user.role === 'ADMIN') redirect('/admin')
  if (user.role === 'MERCHANT') redirect('/dashboard')
  if (user.role !== 'COMMERCIAL') redirect('/')
  return user
}

type BusinessAccess = { ownerId: string; createdById: string | null; claimedByOwnerAt: Date | null }

/** Peut éditer la fiche : le gérant, l'admin, ou le commercial qui l'a créée tant que le gérant n'a pas repris la main. */
export function canManageBusiness(user: SessionUser, biz: BusinessAccess): boolean {
  if (user.role === 'ADMIN') return true
  if (biz.ownerId === user.id) return true
  if (user.role === 'COMMERCIAL' && biz.createdById === user.id && !biz.claimedByOwnerAt) return true
  return false
}

/**
 * Contexte d'édition d'une fiche : renvoie `null` si l'utilisateur connecté n'a
 * pas le droit de la gérer (les Server Actions renvoient alors { error }).
 */
export async function getManageableBusiness(businessId: string) {
  const user = await getSessionUser()
  if (!user) return null
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      slug: true,
      status: true,
      ownerId: true,
      createdById: true,
      claimedByOwnerAt: true,
    },
  })
  if (!business || !canManageBusiness(user, business)) return null
  return { user, business }
}
