'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { guard } from '@/lib/rate-limit'
import { sendEmail, layout } from '@/lib/email'
import { CONTACT_EMAIL } from '@/lib/constants'

export type ContactState = { error?: string; ok?: boolean }

const schema = z.object({
  name: z.string().trim().min(2, 'Nom requis').max(80),
  email: z.string().trim().email('Email invalide'),
  message: z.string().trim().min(10, 'Message trop court').max(2000),
})

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const limited = await guard('contact', 3, 60 * 60 * 1000)
  if (limited) return limited
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide.' }
  }
  await db.contactMessage.create({ data: parsed.data })
  void sendEmail({
    to: CONTACT_EMAIL,
    subject: `Nouveau message — ${parsed.data.name}`,
    html: layout(
      'Message de contact',
      `<p><strong>${parsed.data.name}</strong> (${parsed.data.email})</p><p>${parsed.data.message}</p>`,
    ),
  })
  return { ok: true }
}
