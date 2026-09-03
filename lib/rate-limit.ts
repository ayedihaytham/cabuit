import { headers } from 'next/headers'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ------------------------------------------------------------------
// Repli en mémoire (mono-instance) — utilisé si Upstash n'est pas configuré.
// ------------------------------------------------------------------

type Bucket = { count: number; resetAt: number }
const store = new Map<string, Bucket>()

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

// ------------------------------------------------------------------
// Upstash Redis (multi-instance, persistant) — activé par variables d'env.
// ------------------------------------------------------------------

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

const limiters = new Map<string, Ratelimit>()

function upstashLimiter(max: number, windowSec: number) {
  const key = `${max}:${windowSec}`
  let rl = limiters.get(key)
  if (!rl) {
    rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
      prefix: 'winou/rl',
      analytics: false,
    })
    limiters.set(key, rl)
  }
  return rl
}

/**
 * Limiteur asynchrone : Upstash si configuré, sinon repli en mémoire.
 * Retourne `{ ok, retryAfter? }`.
 */
export async function limit(key: string, max: number, windowMs: number) {
  if (redis) {
    try {
      const res = await upstashLimiter(max, Math.ceil(windowMs / 1000)).limit(key)
      return {
        ok: res.success,
        retryAfter: res.success ? undefined : Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
      }
    } catch {
      // Redis indisponible : on ne bloque pas l'utilisateur, on retombe en mémoire.
    }
  }
  const r = rateLimit(key, max, windowMs)
  return { ok: r.ok, retryAfter: 'retryAfter' in r ? r.retryAfter : undefined }
}

/** IP du visiteur d'après les en-têtes (proxy Vercel). */
export async function clientIp() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local'
}

/** Garde prête à l'emploi pour une Server Action. */
export async function guard(action: string, max: number, windowMs: number) {
  const ip = await clientIp()
  const res = await limit(`${action}:${ip}`, max, windowMs)
  if (!res.ok) {
    return { error: `Trop de tentatives. Réessayez dans ${res.retryAfter ?? 60} s.` }
  }
  return null
}
