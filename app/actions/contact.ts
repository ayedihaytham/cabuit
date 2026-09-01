'use server'

import { z } from 'zod'
import { db } from '@/lib/db'

export type ContactState = { error?: string; ok?: boolean }

const schema = z.object({
  name: z.string().trim().min(2, 'Nom requis').max(80),
  email: z.string().trim().email('Email invalide'),
  message: z.string().trim().min(10, 'Message trop court').max(2000),
})

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide.' }
  }
  await db.contactMessage.create({ data: parsed.data })
  // TODO(emails) : notifier l'équipe via Resend.
  return { ok: true }
}
