'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { signIn } from '@/auth'
import { db } from '@/lib/db'
import { signupClientSchema } from '@/lib/validations'

export type SignupState = { error?: string; fieldErrors?: Record<string, string[]> }

async function createAccount(
  formData: FormData,
  role: 'CLIENT' | 'MERCHANT',
  redirectTo: string,
): Promise<SignupState> {
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
