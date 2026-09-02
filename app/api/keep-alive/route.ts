import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Ping léger pour empêcher le compute Neon (offre gratuite) de s'endormir
 * après 5 min d'inactivité. À appeler toutes les ~4 min par un cron externe
 * (cron-job.org, UptimeRobot…) ou Vercel Cron (voir vercel.json).
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, ts: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 },
    )
  }
}
