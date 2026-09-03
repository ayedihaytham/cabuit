'use server'

import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'

export async function markNotificationRead(id: string) {
  const user = await getSessionUser()
  if (!user) return { error: 'Non connecté.' }
  await db.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  })
  return { ok: true }
}

export async function markAllNotificationsRead() {
  const user = await getSessionUser()
  if (!user) return { error: 'Non connecté.' }
  await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  })
  return { ok: true }
}
