import { redirect } from 'next/navigation'
import type { Role } from '@prisma/client'
import { auth } from '@/auth'
import { db } from '@/lib/db'

/** Utilisateur courant (ou null) avec ses champs applicatifs. */
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
}

/**
 * Exige une session ; redirige vers la bonne page de login sinon.
 * `roles` : rôles autorisés (ADMIN passe partout).
 */
export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser()
  if (!user) {
    redirect(roles?.includes('CLIENT') ? '/connexion-client' : '/connexion')
  }
  if (roles && user.role !== 'ADMIN' && !roles.includes(user.role)) {
    redirect('/')
  }
  return user
}
