import { unstable_cache } from 'next/cache'
import type { BusinessStatus, Category } from '@prisma/client'
import { db } from '@/lib/db'

/** Tags de cache — invalidés par les Server Actions via revalidateTag(). */
export const TAG = {
  businesses: 'businesses',
  offers: 'offers',
  stats: 'admin-stats',
} as const

// ------------------------------------------------------------------
// Public / client
// ------------------------------------------------------------------

export const listActiveBusinesses = unstable_cache(
  _listActiveBusinesses,
  ['list-active-businesses'],
  { revalidate: 120, tags: [TAG.businesses] },
)

async function _listActiveBusinesses(options: {
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
    relationLoadStrategy: 'join',
    include: {
      photos: { orderBy: { position: 'asc' } },
      menuSections: { orderBy: { position: 'asc' }, include: { items: { orderBy: { position: 'asc' } } } },
      reviews: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } },
      },
      offers: {
        where: { status: 'ACTIVE', OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

// ------------------------------------------------------------------
// Bons plans
// ------------------------------------------------------------------

const activeOfferWhere = () => ({
  status: 'ACTIVE' as const,
  OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
  business: { status: 'ACTIVE' as const },
})

export const listActiveOffers = unstable_cache(_listActiveOffers, ['list-active-offers'], {
  revalidate: 120,
  tags: [TAG.offers, TAG.businesses],
})

async function _listActiveOffers(limit?: number) {
  return db.offer.findMany({
    where: activeOfferWhere(),
    orderBy: { createdAt: 'desc' },
    take: limit,
    relationLoadStrategy: 'join',
    include: {
      business: {
        select: {
          slug: true,
          name: true,
          category: true,
          city: true,
          photos: { take: 1, orderBy: { position: 'asc' } },
        },
      },
    },
  })
}

export async function countActiveOffers() {
  return db.offer.count({ where: activeOfferWhere() })
}

export async function getClientRedemptions(userId: string) {
  return db.offerRedemption.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    relationLoadStrategy: 'join',
    include: {
      offer: { include: { business: { select: { slug: true, name: true, city: true } } } },
    },
  })
}

export async function getClaimedOfferIds(userId: string) {
  const rows = await db.offerRedemption.findMany({ where: { userId }, select: { offerId: true } })
  return new Set(rows.map((r) => r.offerId))
}

export async function getClientCounts(userId: string) {
  const [me, offers, redemptions, favorites] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    countActiveOffers(),
    db.offerRedemption.count({ where: { userId } }),
    db.favorite.count({ where: { userId } }),
  ])
  return {
    memberSince: me?.createdAt ?? new Date(),
    counts: { offers, redemptions, favorites },
  }
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
    relationLoadStrategy: 'join',
    include: {
      subscription: true,
      photos: { orderBy: { position: 'asc' } },
      menuSections: { orderBy: { position: 'asc' }, include: { items: { orderBy: { position: 'asc' } } } },
      reviews: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } },
      },
      offers: {
        orderBy: { createdAt: 'desc' },
        include: {
          redemptions: {
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
  })
}

export async function getBusinessStats(businessId: string) {
  const since = daysAgo(30)
  const [views, contacts, favorites] = await Promise.all([
    db.event.count({ where: { businessId, type: 'BUSINESS_VIEW', createdAt: { gte: since } } }),
    db.event.count({ where: { businessId, type: 'CONTACT_CLICK', createdAt: { gte: since } } }),
    db.favorite.count({ where: { businessId } }),
  ])
  return { views, contacts, favorites }
}

// ------------------------------------------------------------------
// Client
// ------------------------------------------------------------------

export async function getClientDashboard(userId: string) {
  const [me, favorites, viewed, recommended] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    db.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { business: { include: { photos: { take: 1, orderBy: { position: 'asc' } } } } },
    }),
    db.event.findMany({
      where: { userId, type: 'BUSINESS_VIEW', businessId: { not: null } },
      orderBy: { createdAt: 'desc' },
      distinct: ['businessId'],
      take: 8,
      include: { business: { select: { slug: true, name: true, category: true, city: true } } },
    }),
    db.business.findMany({
      where: { status: 'ACTIVE', favorites: { none: { userId } } },
      orderBy: { rating: 'desc' },
      take: 4,
      include: { photos: { take: 1, orderBy: { position: 'asc' } } },
    }),
  ])
  return { memberSince: me?.createdAt ?? new Date(), favorites, viewed, recommended }
}

// ------------------------------------------------------------------
// Admin
// ------------------------------------------------------------------

export const getAdminStats = unstable_cache(_getAdminStats, ['admin-stats'], {
  revalidate: 120,
  tags: [TAG.stats, TAG.businesses],
})

async function _getAdminStats() {
  const since = daysAgo(30)
  const [
    clients,
    merchants,
    admins,
    byStatus,
    activeSubs,
    reviewsPending,
    events30d,
    payments,
    reportsOpen,
    offersActive,
    redemptions30d,
  ] = await Promise.all([
    db.user.count({ where: { role: 'CLIENT' } }),
    db.user.count({ where: { role: 'MERCHANT' } }),
    db.user.count({ where: { role: 'ADMIN' } }),
    db.business.groupBy({ by: ['status'], _count: true }),
    db.subscription.findMany({
      where: { status: { in: ['ACTIVE', 'TRIALING'] } },
      select: { pricePerYear: true },
    }),
    db.review.count({ where: { status: 'PENDING' } }),
    db.event.count({ where: { createdAt: { gte: since } } }),
    db.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    db.report.count({ where: { status: 'OPEN' } }),
    db.offer.count({ where: { status: 'ACTIVE' } }),
    db.offerRedemption.count({ where: { createdAt: { gte: since } } }),
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
    reportsOpen,
    offersActive,
    redemptions30d,
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
    relationLoadStrategy: 'join',
    include: {
      owner: { select: { name: true, email: true, phone: true } },
      subscription: { include: { payments: { orderBy: { createdAt: 'desc' } } } },
      photos: { orderBy: { position: 'asc' } },
      menuSections: { orderBy: { position: 'asc' }, include: { items: true } },
      _count: { select: { reviews: true, favorites: true, events: true } },
    },
  })
}

export async function listPendingReviews() {
  return db.review.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, email: true } },
      business: { select: { name: true, slug: true } },
    },
  })
}

export async function listReports(status: 'OPEN' | 'RESOLVED' | 'DISMISSED' = 'OPEN') {
  return db.report.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    include: {
      business: { select: { name: true, slug: true, id: true } },
      reporter: { select: { name: true, email: true } },
    },
  })
}

export async function getAuditLog() {
  return db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { actor: { select: { name: true, email: true } } },
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
