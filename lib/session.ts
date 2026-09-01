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
  if (user.role !== 'MERCHANT') redirect('/')
  return user
}
