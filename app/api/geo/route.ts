import { NextResponse } from 'next/server'
import { matchGovernorate, nearestGovernorate, governorateLabel } from '@/lib/regions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Reverse-geocoding via OpenStreetMap (Nominatim, sans clé) : GPS -> gouvernorat.
 * Repli sur le centroïde le plus proche si le nom renvoyé n'est pas reconnu.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Coordonnées invalides.' }, { status: 400 })
  }

  let key: string | null = null
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=8&accept-language=fr`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Winou/1.0 (+https://winou.tn)' },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      const a = data.address ?? {}
      key =
        matchGovernorate(a.state) ??
        matchGovernorate(a.region) ??
        matchGovernorate(a.county) ??
        matchGovernorate(a.city)
    }
  } catch {
    /* réseau/timeout : on tombe sur le repli géométrique */
  }

  if (!key) key = nearestGovernorate(lat, lng)
  return NextResponse.json({ region: key, label: governorateLabel(key) })
}
