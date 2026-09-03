import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Export RGPD : toutes les données personnelles de l'utilisateur connecté (JSON). */
export async function GET() {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })

  const [user, favorites, reviews, redemptions, notifications, businesses] = await Promise.all([
    db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true, name: true, email: true, phone: true, city: true, role: true,
        emailVerified: true, createdAt: true,
      },
    }),
    db.favorite.findMany({
      where: { userId: session.id },
      select: { createdAt: true, business: { select: { name: true, slug: true } } },
    }),
    db.review.findMany({
      where: { authorId: session.id },
      select: { rating: true, text: true, status: true, createdAt: true, business: { select: { name: true } } },
    }),
    db.offerRedemption.findMany({
      where: { userId: session.id },
      select: {
        code: true, createdAt: true, usedAt: true,
        offer: { select: { title: true, business: { select: { name: true } } } },
      },
    }),
    db.notification.findMany({
      where: { userId: session.id },
      select: { type: true, title: true, body: true, createdAt: true, readAt: true },
    }),
    db.business.findMany({
      where: { ownerId: session.id },
      select: { name: true, slug: true, status: true, createdAt: true },
    }),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    user,
    favorites,
    reviews,
    offerRedemptions: redemptions,
    notifications,
    ownedBusinesses: businesses,
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="winou-mes-donnees-${session.id}.json"`,
    },
  })
}
