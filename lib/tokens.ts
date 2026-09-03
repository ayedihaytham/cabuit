import { randomBytes } from 'node:crypto'
import { db } from '@/lib/db'

const RESET_TTL_MS = 60 * 60 * 1000 // 1 h
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000 // 24 h
const VERIFY_PREFIX = 'verify:'

/** Crée un jeton de réinitialisation pour un email (réutilise VerificationToken). */
export async function createResetToken(email: string) {
  const token = randomBytes(32).toString('hex')
  await db.verificationToken.deleteMany({ where: { identifier: email } })
  await db.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + RESET_TTL_MS) },
  })
  return token
}

/** Valide + consomme un jeton. Renvoie l'email ou null. */
export async function consumeResetToken(token: string): Promise<string | null> {
  const row = await db.verificationToken.findUnique({ where: { token } })
  if (!row) return null
  await db.verificationToken.delete({ where: { token } }).catch(() => {})
  if (row.expires < new Date()) return null
  return row.identifier
}

/** Jeton de vérification d'email (identifiant préfixé pour ne pas croiser le reset). */
export async function createEmailVerifyToken(email: string) {
  const token = randomBytes(32).toString('hex')
  const identifier = VERIFY_PREFIX + email
  await db.verificationToken.deleteMany({ where: { identifier } })
  await db.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + VERIFY_TTL_MS) },
  })
  return token
}

/** Valide + consomme un jeton de vérification. Renvoie l'email ou null. */
export async function consumeEmailVerifyToken(token: string): Promise<string | null> {
  const row = await db.verificationToken.findUnique({ where: { token } })
  if (!row || !row.identifier.startsWith(VERIFY_PREFIX)) return null
  await db.verificationToken.delete({ where: { token } }).catch(() => {})
  if (row.expires < new Date()) return null
  return row.identifier.slice(VERIFY_PREFIX.length)
}
