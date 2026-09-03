'use server'

import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { createEmailVerifyToken } from '@/lib/tokens'
import { sendEmail, layout, appUrl } from '@/lib/email'
import { guard } from '@/lib/rate-limit'

export type VerifyState = { ok?: boolean; error?: string }

/** Renvoie un lien de vérification à l'utilisateur connecté. */
export async function resendVerification(): Promise<VerifyState> {
  const session = await getSessionUser()
  if (!session) return { error: 'Connectez-vous.' }

  const limited = await guard('verify-resend', 3, 60 * 60 * 1000)
  if (limited) return limited

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { email: true, emailVerified: true },
  })
  if (!user) return { error: 'Compte introuvable.' }
  if (user.emailVerified) return { ok: true }

  const token = await createEmailVerifyToken(user.email)
  await sendEmail({
    to: user.email,
    subject: 'Confirmez votre adresse email — Winou',
    html: layout(
      'Confirmation d’adresse email',
      '<p>Cliquez ci-dessous pour confirmer votre adresse. Lien valable 24 heures.</p>',
      { href: `${appUrl()}/verifier-email?token=${token}`, label: 'Confirmer mon email' },
    ),
  })
  return { ok: true }
}
