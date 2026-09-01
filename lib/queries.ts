import type { BusinessStatus, Category } from '@prisma/client'
import { db } from '@/lib/db'

// ------------------------------------------------------------------
// Public / client
// ------------------------------------------------------------------

export async function listActiveBusinesses(options: {
  category?: Category
  city?: string
  query?: string
} = {}) {
  const { category, city, query } = options
  return db.business.findMany({
    where: {
      status: 'ACTIVE',
      ...(category ? { category } : {}),
      ...(city ? { city } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { type: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    include: { photos: { orderBy: { position: 'asc' }, take: 1 } },
  })
}

export async function getPublicBusiness(slug: string) {
  return db.business.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      photos: { orderBy: { position: 'asc' } },
      menuSections: { orderBy: { position: 'asc' }, include: { items: { orderBy: { position: 'asc' } } } },
      reviews: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } },
      },
    },
  })
}

// ------------------------------------------------------------------
// Commerçant
// ------------------------------------------------------------------

export async function getMerchantBusinesses(ownerId: string) {
  return db.business.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
    include: {
      subscription: true,
      _count: { select: { reviews: true, favorites: true } },
    },
  })
}

export async function getOwnedBusiness(id: string, ownerId: string) {
  return db.business.findFirst({
    where: { id, ownerId },
    include: { subscription: true, photos: { orderBy: { position: 'asc' } } },
  })
}

// ------------------------------------------------------------------
// Admin
// ------------------------------------------------------------------

export async function getAdminStats() {
  const [clients, merchants, admins, byStatus, activeSubs, reviewsPending, events30d, payments] =
    await Promise.all([
      db.user.count({ where: { role: 'CLIENT' } }),
      db.user.count({ where: { role: 'MERCHANT' } }),
      db.user.count({ where: { role: 'ADMIN' } }),
      db.business.groupBy({ by: ['status'], _count: true }),
      db.subscription.findMany({
        where: { status: { in: ['ACTIVE', 'TRIALING'] } },
        select: { pricePerYear: true },
      }),
      db.review.count({ where: { status: 'PENDING' } }),
      db.event.count({ where: { createdAt: { gte: daysAgo(30) } } }),
      db.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    ])

  const statusMap = Object.fromEntries(
    byStatus.map((row) => [row.status, row._count]),
  ) as Record<BusinessStatus, number>

  return {
    clients,
    merchants,
    admins,
    businesses: {
      total: byStatus.reduce((sum, row) => sum + row._count, 0),
      active: statusMap.ACTIVE ?? 0,
      pending: statusMap.PENDING ?? 0,
      suspended: statusMap.SUSPENDED ?? 0,
      draft: statusMap.DRAFT ?? 0,
      rejected: statusMap.REJECTED ?? 0,
    },
    arr: activeSubs.reduce((sum, s) => sum + s.pricePerYear, 0),
    revenuePaid: payments._sum.amount ?? 0,
    reviewsPending,
    events30d,
  }
}

export async function listBusinessesForAdmin(status?: BusinessStatus) {
  return db.business.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      owner: { select: { name: true, email: true } },
      subscription: true,
    },
  })
}

export async function getBusinessForAdmin(id: string) {
  return db.business.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true, phone: true } },
      subscription: { include: { payments: { orderBy: { createdAt: 'desc' } } } },
      photos: { orderBy: { position: 'asc' } },
      menuSections: { orderBy: { position: 'asc' }, include: { items: true } },
      _count: { select: { reviews: true, favorites: true, events: true } },
    },
  })
}

export async function listClientsForAdmin() {
  return db.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      createdAt: true,
      _count: { select: { favorites: true, reviews: true } },
    },
  })
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
