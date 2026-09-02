'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { signIn } from '@/auth'
import { db } from '@/lib/db'
import { signupClientSchema } from '@/lib/validations'
import { sendEmail, layout, appUrl } from '@/lib/email'
import { guard } from '@/lib/rate-limit'

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
      emailVerified: new Date(), // TODO: vérification par email (Phase emails)
    },
  })

  await db.event.create({ data: { type: 'SIGNUP' } }).catch(() => {})

  void sendEmail({
    to: email,
    subject: `Bienvenue sur Winou${role === 'MERCHANT' ? ' — inscrivez votre établissement' : ''} !`,
    html: layout(
      `Bienvenue ${name} 👋`,
      role === 'MERCHANT'
        ? `<p>Votre compte commerçant est créé. Ajoutez votre restaurant ou café,
           choisissez une offre et envoyez la fiche à validation.</p>`
        : `<p>Votre compte est créé. Récupérez des bons plans, gardez vos adresses
           favorites et présentez votre code au comptoir.</p>`,
      { href: `${appUrl()}${redirectTo}`, label: 'Commencer' },
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
