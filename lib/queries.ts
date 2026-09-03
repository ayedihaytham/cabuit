import { cache } from 'react'
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
  region?: string
  query?: string
} = {}) {
  const { category, city, region, query } = options
  return db.business.findMany({
    where: {
      status: 'ACTIVE',
      ...(category ? { category } : {}),
      ...(city ? { city } : {}),
      ...(region ? { region } : {}),
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

export type BusinessSort = 'pertinence' | 'note' | 'nouveaute' | 'nom'
export const PAGE_SIZE = 12

type SearchOpts = {
  query?: string
  category?: Category
  region?: string
  verifiedOnly?: boolean
  sort?: BusinessSort
  page?: number
}

/**
 * Recherche paginée côté serveur, mise en cache 60 s par combinaison de filtres
 * (invalidée dès qu'un commerce change via revalidateTag). Amortit la charge DB
 * sous fort trafic.
 */
export const searchBusinesses = unstable_cache(_searchBusinesses, ['search-businesses'], {
  revalidate: 60,
  tags: [TAG.businesses],
})

async function _searchBusinesses(opts: SearchOpts) {
  const { query, category, region, verifiedOnly, sort = 'pertinence' } = opts
  const page = Math.max(1, opts.page ?? 1)
  const term = query?.trim()

  const where = {
    status: 'ACTIVE' as const,
    ...(category ? { category } : {}),
    ...(region ? { region } : {}),
    ...(verifiedOnly ? { verified: true } : {}),
    ...(term
      ? {
          OR: [
            { name: { contains: term, mode: 'insensitive' as const } },
            { type: { contains: term, mode: 'insensitive' as const } },
            { city: { contains: term, mode: 'insensitive' as const } },
            { description: { contains: term, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const orderBy =
    sort === 'note'
      ? [{ verified: 'desc' as const }, { rating: 'desc' as const }]
      : sort === 'nom'
        ? [{ name: 'asc' as const }]
        : [{ createdAt: 'desc' as const }]

  const [rows, total] = await Promise.all([
    db.business.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { photos: { orderBy: { position: 'asc' }, take: 1 } },
    }),
    db.business.count({ where }),
  ])

  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

/** Slugs des fiches en ligne — pour le sitemap. */
export async function listBusinessSlugs() {
  return db.business.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })
}

/**
 * Fiche publique. `cache()` (mémoïsation par requête) : `generateMetadata` et le
 * composant de page partagent la même requête. Pas de `unstable_cache` ici — le
 * retour contient des dates imbriquées que la sérialisation du cache altérerait.
 */
export const getPublicBusiness = cache(async (slug: string) => {
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
})

// ------------------------------------------------------------------
// Bons plans
// ------------------------------------------------------------------

const activeOfferWhere = (region?: string) => ({
  status: 'ACTIVE' as const,
  OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
  business: { status: 'ACTIVE' as const, ...(region ? { region } : {}) },
})

export const listActiveOffers = unstable_cache(_listActiveOffers, ['list-active-offers'], {
  revalidate: 120,
  tags: [TAG.offers, TAG.businesses],
})

async function _listActiveOffers(limit?: number, region?: string) {
  return db.offer.findMany({
    where: activeOfferWhere(region),
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
          region: true,
          photos: { take: 1, orderBy: { position: 'asc' } },
        },
      },
    },
  })
}

export async function countActiveOffers(region?: string) {
  return db.offer.count({ where: activeOfferWhere(region) })
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
    messagesOpen,
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
    db.contactMessage.count({ where: { handled: false } }),
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
    messagesOpen,
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

export async function listAllOffers() {
  return db.offer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { business: { select: { name: true, slug: true } } },
  })
}

export async function listContactMessages(handled = false) {
  return db.contactMessage.findMany({
    where: { handled },
    orderBy: { createdAt: 'desc' },
    take: 100,
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

// ------------------------------------------------------------------
// Espace commercial
// ------------------------------------------------------------------

/** Chiffres plateforme (argumentaire de vente) + portefeuille du commercial. */
export async function getCommercialData(userId: string) {
  const since = daysAgo(30)
  const mine = { createdById: userId }
  const [
    clients,
    activeClients30d,
    businessesActive,
    offersActive,
    redemptions30d,
    views30d,
    cities,
    portfolio,
    portfolioSubs,
    portfolioRedemptions,
  ] = await Promise.all([
    db.user.count({ where: { role: 'CLIENT' } }),
    db.user.count({ where: { role: 'CLIENT', events: { some: { createdAt: { gte: since } } } } }),
    db.business.count({ where: { status: 'ACTIVE' } }),
    db.offer.count({ where: { status: 'ACTIVE' } }),
    db.offerRedemption.count({ where: { createdAt: { gte: since } } }),
    db.event.count({ where: { type: 'BUSINESS_VIEW', createdAt: { gte: since } } }),
    db.business.findMany({ where: { status: 'ACTIVE' }, select: { region: true }, distinct: ['region'] }),
    db.business.findMany({
      where: mine,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: { select: { status: true, tier: true, trialEndsAt: true } },
        _count: { select: { offers: true, reviews: true, favorites: true } },
      },
    }),
    db.subscription.groupBy({
      by: ['status'],
      where: { business: mine },
      _count: true,
    }),
    db.offerRedemption.count({ where: { offer: { business: mine } } }),
  ])

  const subMap = Object.fromEntries(portfolioSubs.map((r) => [r.status, r._count])) as Record<string, number>

  return {
    platform: {
      clients,
      activeClients30d,
      businessesActive,
      offersActive,
      redemptions30d,
      views30d,
      regionsCovered: cities.filter((c) => c.region).length,
    },
    portfolio: {
      total: portfolio.length,
      live: portfolio.filter((b) => b.status === 'ACTIVE').length,
      trialing: subMap.TRIALING ?? 0,
      paying: subMap.ACTIVE ?? 0,
      claimed: portfolio.filter((b) => b.claimedByOwnerAt).length,
      redemptions: portfolioRedemptions,
    },
    businesses: portfolio,
  }
}

/** Une fiche onboardée par ce commercial (accès lecture/gestion selon claim). */
export async function getCommercialBusiness(businessId: string, commercialId: string) {
  return db.business.findFirst({
    where: { id: businessId, createdById: commercialId },
    relationLoadStrategy: 'join',
    include: {
      owner: { select: { name: true, email: true, phone: true, mustChangePassword: true } },
      subscription: true,
      photos: { orderBy: { position: 'asc' } },
      menuSections: { orderBy: { position: 'asc' }, include: { items: { orderBy: { position: 'asc' } } } },
      offers: { orderBy: { createdAt: 'desc' }, include: { redemptions: { include: { user: { select: { name: true } } } } } },
    },
  })
}

export async function listUsersForAdmin(q?: string) {
  const term = q?.trim()
  return db.user.findMany({
    where: term
      ? {
          OR: [
            { email: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
      _count: { select: { businesses: true } },
    },
  })
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// ------------------------------------------------------------------
// Analytics fondateur
// ------------------------------------------------------------------

function dailyBuckets(rows: { createdAt: Date }[], days = 30) {
  const key = (d: Date) => d.toISOString().slice(0, 10)
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(key(r.createdAt), (counts.get(key(r.createdAt)) ?? 0) + 1)
  const out: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({ date: key(d), count: counts.get(key(d)) ?? 0 })
  }
  return out
}

export async function getFounderAnalytics() {
  const since = daysAgo(30)

  const [
    views30,
    signups30,
    signupRows,
    redemptionRows,
    usedAtCounter30,
    distinctClaimers,
    newBusinessRows,
    subsByStatus,
    paidSubs,
    topViewed,
    topOffers,
    searchRows,
    regionRows,
  ] = await Promise.all([
    db.event.count({ where: { type: 'BUSINESS_VIEW', createdAt: { gte: since } } }),
    db.user.count({ where: { createdAt: { gte: since } } }),
    db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.offerRedemption.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.offerRedemption.count({ where: { usedAt: { gte: since } } }),
    db.offerRedemption.findMany({
      where: { createdAt: { gte: since } },
      select: { userId: true },
      distinct: ['userId'],
    }),
    db.business.findMany({
      where: { status: 'ACTIVE', createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.subscription.groupBy({ by: ['status'], _count: true }),
    db.subscription.count({ where: { payments: { some: { status: 'PAID' } } } }),
    db.event.groupBy({
      by: ['businessId'],
      where: { type: 'BUSINESS_VIEW', createdAt: { gte: since }, businessId: { not: null } },
      _count: true,
      orderBy: { _count: { businessId: 'desc' } },
      take: 6,
    }),
    db.offer.findMany({
      where: { redemptionCount: { gt: 0 } },
      orderBy: { redemptionCount: 'desc' },
      take: 6,
      select: { title: true, redemptionCount: true, business: { select: { name: true, slug: true } } },
    }),
    db.event.groupBy({
      by: ['query'],
      where: { type: 'SEARCH', createdAt: { gte: since }, query: { not: null } },
      _count: true,
      orderBy: { _count: { query: 'desc' } },
      take: 8,
    }),
    db.business.groupBy({ by: ['region'], where: { status: 'ACTIVE' }, _count: true }),
  ])

  const viewedIds = topViewed.map((t) => t.businessId!).filter(Boolean)
  const viewedNames = viewedIds.length
    ? await db.business.findMany({ where: { id: { in: viewedIds } }, select: { id: true, name: true, slug: true } })
    : []
  const nameById = new Map(viewedNames.map((b) => [b.id, b]))

  const subMap = Object.fromEntries(subsByStatus.map((r) => [r.status, r._count])) as Record<string, number>
  const trialing = subMap.TRIALING ?? 0
  const totalSubs = subsByStatus.reduce((s, r) => s + r._count, 0)

  return {
    funnel: {
      views: views30,
      signups: signups30,
      claimers: distinctClaimers.length,
      usedAtCounter: usedAtCounter30,
    },
    series: {
      signups: dailyBuckets(signupRows),
      redemptions: dailyBuckets(redemptionRows),
      newBusinesses: dailyBuckets(newBusinessRows),
    },
    conversion: {
      trialing,
      paid: paidSubs,
      totalSubs,
      rate: totalSubs ? Math.round((paidSubs / totalSubs) * 100) : 0,
    },
    topViewed: topViewed.map((t) => ({
      name: nameById.get(t.businessId!)?.name ?? '—',
      slug: nameById.get(t.businessId!)?.slug ?? '',
      views: t._count,
    })),
    topOffers: topOffers.map((o) => ({
      title: o.title,
      business: o.business.name,
      slug: o.business.slug,
      count: o.redemptionCount,
    })),
    topSearches: searchRows.map((s) => ({ query: s.query ?? '', count: s._count })),
    regions: regionRows
      .filter((r) => r.region)
      .map((r) => ({ region: r.region as string, count: r._count }))
      .sort((a, b) => b.count - a.count),
  }
}
