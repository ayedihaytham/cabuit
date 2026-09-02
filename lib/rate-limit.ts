import { headers } from 'next/headers'

type Bucket = { count: number; resetAt: number }
const store = new Map<string, Bucket>()

/**
 * Limiteur simple en mémoire (fenêtre glissante). Par instance — suffisant
 * pour un déploiement mono-région / faible trafic. TODO(prod) : Upstash Redis
 * si multi-région.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const b = store.get(key)
  if (!b || b.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) }
  }
  b.count++
  return { ok: true, remaining: limit - b.count }
}

/** IP du visiteur d'après les en-têtes (proxy Vercel). */
export async function clientIp() {
  const h = await headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'local'
  )
}

/** Garde prête à l'emploi pour une Server Action. */
export async function guard(action: string, limit: number, windowMs: number) {
  const ip = await clientIp()
  const res = rateLimit(`${action}:${ip}`, limit, windowMs)
  if (!res.ok) {
    return { error: `Trop de tentatives. Réessayez dans ${res.retryAfter ?? 60} s.` }
  }
  return null
}
