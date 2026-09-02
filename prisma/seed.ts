import { PrismaClient, type Category as DbCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { BUSINESSES } from '../lib/data/businesses'
import { PETIT_SOUK_MENU, PETIT_SOUK_REVIEWS } from '../lib/data/petit-souk'
import type { Category } from '../lib/types'

const db = new PrismaClient()

function toDbCategory(category: Category): DbCategory {
  return category === 'Restauration' ? 'RESTAURANT' : 'CAFE'
}

function oneYearFromNow() {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date
}

function inDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function main() {
  // --- Admin ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@winou.tn'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'change-me'
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Admin Winou',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      emailVerified: new Date(),
    },
  })
  console.log(`✔ admin: ${admin.email}`)

  // --- Commerçant de démonstration + reprise des fiches de lib/data ---
  const merchant = await db.user.upsert({
    where: { email: 'commercant@winou.tn' },
    update: { role: 'MERCHANT' },
    create: {
      email: 'commercant@winou.tn',
      name: 'Propriétaire démo',
      role: 'MERCHANT',
      passwordHash: await bcrypt.hash('demo1234', 10),
      emailVerified: new Date(),
      city: 'La Marsa',
    },
  })

  const TIER_PRICE = { ESSENTIEL: 200, POPULAIRE: 300, PREMIUM: 500 } as const

  for (const b of BUSINESSES) {
    const business = await db.business.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        ownerId: merchant.id,
        name: b.name,
        slug: b.slug,
        category: toDbCategory(b.category),
        type: b.type,
        address: b.address,
        city: b.city,
        description: b.description,
        phone: b.phone,
        whatsapp: b.whatsapp,
        instagram: b.instagram,
        status: 'ACTIVE',
        verified: b.verified,
        rating: b.rating,
        reviewCount: b.reviewCount,
      },
    })

    // Abonnement actif avec acceptation des CGA
    await db.subscription.upsert({
      where: { businessId: business.id },
      update: {},
      create: {
        businessId: business.id,
        tier: b.slug === 'le-petit-souk' ? 'PREMIUM' : 'POPULAIRE',
        status: 'ACTIVE',
        pricePerYear: b.slug === 'le-petit-souk' ? TIER_PRICE.PREMIUM : TIER_PRICE.POPULAIRE,
        trialEndsAt: inDays(-1),
        currentPeriodEnd: oneYearFromNow(),
        acceptedTermsAt: new Date(),
        acceptedTermsIp: '127.0.0.1',
        contractVersion: 'v1',
      },
    })
  }
  console.log(`✔ ${BUSINESSES.length} commerces + abonnements`)

  // --- Bons plans de démonstration ---
  const OFFERS: Record<string, { title: string; discountLabel: string; description: string; conditions?: string }[]> = {
    'le-petit-souk': [
      {
        title: 'Le café offert après le déjeuner',
        discountLabel: '1 offert',
        description: 'Un café ou un thé offert pour tout déjeuner à la carte, du lundi au vendredi.',
        conditions: 'Midi en semaine · 1 par personne',
      },
    ],
    'cafe-panorama': [
      {
        title: 'Happy hour pâtisseries',
        discountLabel: '-20%',
        description: '-20% sur toutes les pâtisseries maison entre 16h et 18h.',
        conditions: 'Tous les jours, 16h–18h',
      },
    ],
    'salon-el-bahia': [
      {
        title: 'Le 2ᵉ thé à moitié prix',
        discountLabel: '-50%',
        description: 'Le deuxième thé à la menthe à -50% pour toute commande de deux thés.',
      },
    ],
  }
  for (const [slug, list] of Object.entries(OFFERS)) {
    const biz = await db.business.findUnique({ where: { slug } })
    if (!biz) continue
    for (const o of list) {
      const exists = await db.offer.findFirst({ where: { businessId: biz.id, title: o.title } })
      if (!exists) {
        await db.offer.create({
          data: { businessId: biz.id, status: 'ACTIVE', ...o, conditions: o.conditions ?? null },
        })
      }
    }
  }
  console.log('✔ bons plans de démo')

  // --- Fiche vitrine : menu + avis pour Le Petit Souk ---
  const petitSouk = await db.business.findUnique({ where: { slug: 'le-petit-souk' } })
  if (petitSouk) {
    const sectionCount = await db.menuSection.count({ where: { businessId: petitSouk.id } })
    if (sectionCount === 0) {
      for (const [i, section] of PETIT_SOUK_MENU.entries()) {
        await db.menuSection.create({
          data: {
            businessId: petitSouk.id,
            title: section.title,
            position: i,
            items: {
              create: section.items.map((item, j) => ({
                name: item.name,
                description: item.description,
                price: item.price,
                position: j,
              })),
            },
          },
        })
      }
      console.log(`✔ menu Petit Souk (${PETIT_SOUK_MENU.length} sections)`)
    }

    // Clients de démonstration + avis publiés
    for (const [i, review] of PETIT_SOUK_REVIEWS.entries()) {
      const client = await db.user.upsert({
        where: { email: `client${i + 1}@winou.tn` },
        update: {},
        create: {
          email: `client${i + 1}@winou.tn`,
          name: review.author,
          role: 'CLIENT',
          passwordHash: await bcrypt.hash('demo1234', 10),
          emailVerified: new Date(),
        },
      })
      await db.review.upsert({
        where: { businessId_authorId: { businessId: petitSouk.id, authorId: client.id } },
        update: {},
        create: {
          businessId: petitSouk.id,
          authorId: client.id,
          rating: review.rating,
          text: review.text,
          status: 'PUBLISHED',
          ownerReply: review.reply ?? null,
          ownerRepliedAt: review.reply ? new Date() : null,
        },
      })
    }
    console.log(`✔ ${PETIT_SOUK_REVIEWS.length} avis + clients de démo`)
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await db.$disconnect()
    process.exit(1)
  })
