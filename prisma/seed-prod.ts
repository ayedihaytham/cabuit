/**
 * Seed de PRODUCTION — le strict minimum, aucune donnée fictive.
 * Crée : 1 admin + 1 commercial. Idempotent (upsert).
 *
 * Usage (avec DATABASE_URL / DIRECT_URL pointant sur la base de prod) :
 *   pnpm exec tsx prisma/seed-prod.ts
 *
 * Variables reconnues :
 *   SEED_ADMIN_EMAIL       (défaut: admin@winou.tn)
 *   SEED_ADMIN_PASSWORD    (obligatoire en prod — pas de valeur par défaut)
 *   SEED_COMMERCIAL_EMAIL  (défaut: commercial@winou.tn)
 *   SEED_COMMERCIAL_PASSWORD (défaut: mot de passe aléatoire, affiché à la fin)
 */
import { randomBytes } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@winou.tn'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!adminPassword || adminPassword.length < 10) {
    throw new Error('SEED_ADMIN_PASSWORD manquant ou trop court (≥ 10 caractères).')
  }

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Administration Winou',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      emailVerified: new Date(),
    },
  })
  console.log(`✔ admin : ${admin.email}`)

  const comEmail = process.env.SEED_COMMERCIAL_EMAIL ?? 'commercial@winou.tn'
  const comPassword =
    process.env.SEED_COMMERCIAL_PASSWORD ?? `Winou-${randomBytes(6).toString('base64url')}`
  const commercial = await db.user.upsert({
    where: { email: comEmail },
    update: { role: 'COMMERCIAL' },
    create: {
      email: comEmail,
      name: 'Commercial Winou',
      role: 'COMMERCIAL',
      passwordHash: await bcrypt.hash(comPassword, 10),
      emailVerified: new Date(),
    },
  })
  const created = !process.env.SEED_COMMERCIAL_PASSWORD
  console.log(`✔ commercial : ${commercial.email}${created ? ` (mot de passe : ${comPassword})` : ''}`)

  console.log('\nSeed de production terminé.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
