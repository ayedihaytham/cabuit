import * as Sentry from '@sentry/nextjs'

/**
 * Signale une erreur : Sentry si configuré, sinon log structuré en console.
 * À utiliser dans les `catch` où l'on avale l'erreur (cron, emails, jobs).
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, context ? { extra: context } : undefined)
    return
  }
  console.error(
    JSON.stringify({
      level: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
      ts: new Date().toISOString(),
    }),
  )
}
