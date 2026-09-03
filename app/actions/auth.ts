'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { signIn } from '@/auth'
import { db } from '@/lib/db'
import { signupClientSchema } from '@/lib/validations'
import { sendEmail, layout, appUrl, escapeHtml } from '@/lib/email'
import { guard } from '@/lib/rate-limit'
import { createEmailVerifyToken } from '@/lib/tokens'

export type SignupState = { error?: string; fieldErrors?: Record<string, string[]> }

async function createAccount(
  formData: FormData,
  role: 'CLIENT' | 'MERCHANT',
  redirectTo: string,
): Promise<SignupState> {
  const limited = await guard(`signup:${role}`, 5, 60 * 60 * 1000)
  if (limited) return limited

  const parsed = signupClientSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'Un compte existe déjà avec cet email.' }
  }

  await db.user.create({
    data: {
      name,
      email,
      role,
      passwordHash: await bcrypt.hash(password, 10),
      emailVerified: null,
    },
  })

  await db.event.create({ data: { type: 'SIGNUP' } }).catch(() => {})

  const verifyToken = await createEmailVerifyToken(email)
  const verifyLink = `${appUrl()}/verifier-email?token=${verifyToken}`
  void sendEmail({
    to: email,
    subject: 'Confirmez votre adresse email — Winou',
    html: layout(
      `Bienvenue ${escapeHtml(name)} 👋`,
      `<p>${
        role === 'MERCHANT'
          ? 'Votre compte commerçant est créé.'
          : 'Votre compte est créé.'
      } Confirmez votre adresse email pour ${
        role === 'MERCHANT' ? 'publier votre fiche' : 'récupérer des bons plans'
      }.</p>
       <p style="color:#9a8f82">Ce lien est valable 24 heures.</p>`,
      { href: verifyLink, label: 'Confirmer mon email' },
    ),
  })

  try {
    await signIn('credentials', { email, password, redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Compte créé, mais la connexion a échoué. Connectez-vous manuellement.' }
    }
    throw error // redirection Next -> on laisse passer
  }
  return {}
}

export async function signupClient(_prev: SignupState, formData: FormData) {
  return createAccount(formData, 'CLIENT', '/espace-client')
}

export async function signupMerchant(_prev: SignupState, formData: FormData) {
  return createAccount(formData, 'MERCHANT', '/dashboard/nouveau')
}
