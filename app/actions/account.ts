'use server'

import { signOut } from '@/auth'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'

export type DeleteState = { error?: string }

/**
 * Suppression du compte (droit à l'effacement).
 * - CLIENT : suppression immédiate (cascade des favoris / avis / codes / notifications).
 * - MERCHANT : possible seulement si aucun établissement publié (sinon → support).
 * - COMMERCIAL / ADMIN : via le support (journaux d'audit à conserver).
 */
export async function deleteMyAccount(_prev: DeleteState, formData: FormData): Promise<DeleteState> {
  const session = await getSessionUser()
  if (!session) return { error: 'Non connecté.' }

  const confirm = String(formData.get('confirm') ?? '').trim().toLowerCase()
  if (confirm !== session.email.toLowerCase()) {
    return { error: 'Saisissez exactement votre adresse email pour confirmer.' }
  }

  if (session.role === 'ADMIN' || session.role === 'COMMERCIAL') {
    return { error: 'Compte lié à l’équipe Winou : la suppression passe par le support (bonjour@winou.tn).' }
  }

  if (session.role === 'MERCHANT') {
    const published = await db.business.count({
      where: { ownerId: session.id, status: { notIn: ['DRAFT', 'REJECTED'] } },
    })
    if (published > 0) {
      return {
        error:
          'Des établissements sont rattachés à ce compte. Contactez le support pour le fermer (bonjour@winou.tn).',
      }
    }
    // Supprime les brouillons rattachés (cascade sur photos/menus/abonnement).
    await db.business.deleteMany({ where: { ownerId: session.id } })
  }

  // Avis à supprimer -> il faudra recalculer la note des commerces concernés.
  const affected = await db.review.findMany({
    where: { authorId: session.id },
    select: { businessId: true },
  })

  await db.user.delete({ where: { id: session.id } })

  const businessIds = [...new Set(affected.map((r) => r.businessId))]
  for (const id of businessIds) {
    const agg = await db.review.aggregate({
      where: { businessId: id, status: 'PUBLISHED' },
      _avg: { rating: true },
      _count: true,
    })
    await db.business
      .update({ where: { id }, data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count } })
      .catch(() => {})
  }

  await signOut({ redirectTo: '/?compte=supprime' })
  return {}
}
