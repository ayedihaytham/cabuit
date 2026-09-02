'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createResetToken, consumeResetToken } from '@/lib/tokens'
import { sendEmail, layout, appUrl } from '@/lib/email'
import { guard } from '@/lib/rate-limit'

export type ResetState = { error?: string; ok?: boolean }

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email('Email invalide') })
const newPwdSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, '8 caractères minimum'),
})

/** Demande de réinitialisation — réponse toujours « ok » (ne révèle pas l'existence du compte). */
export async function requestReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const limited = await guard('reset', 5, 60 * 60 * 1000)
  if (limited) return limited
  const parsed = emailSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { email } = parsed.data

  const user = await db.user.findUnique({ where: { email } })
  if (user) {
    const token = await createResetToken(email)
    const link = `${appUrl()}/reinitialiser?token=${token}`
    await sendEmail({
      to: email,
      subject: 'Réinitialiser votre mot de passe Winou',
      html: layout(
        'Réinitialisation du mot de passe',
        `<p>Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable 1 heure.</p>
         <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
        { href: link, label: 'Choisir un nouveau mot de passe' },
      ),
    })
  }
  return { ok: true }
}

export async function resetPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = newPwdSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const email = await consumeResetToken(parsed.data.token)
  if (!email) return { error: 'Lien invalide ou expiré. Refaites une demande.' }

  await db.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
  })
  return { ok: true }
}
