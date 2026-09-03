import { db } from '@/lib/db'
import { reportError } from '@/lib/observability'

type NotifyInput = {
  userId: string
  type: string
  title: string
  body?: string
  href?: string
}

/**
 * Crée une notification in-app. Ne lève jamais : un échec ne doit pas casser
 * l'action métier qui l'a déclenchée.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
      },
    })
  } catch (e) {
    reportError(e, { scope: 'notify', type: input.type })
  }
}
