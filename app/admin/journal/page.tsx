import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/dashboard/app-header'
import { requireUser } from '@/lib/session'
import { getAuditLog } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)

export default async function JournalPage() {
  const user = await requireUser(['ADMIN'])
  const entries = await getAuditLog()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        label="Administration"
        userName={user.name ?? user.email}
        homeHref="/admin"
        backHref={{ href: '/admin', label: '← Console' }}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta">
          <ArrowLeft className="size-4" /> Console admin
        </Link>
        <h1 className="mt-4 font-display text-4xl">Journal d’activité</h1>
        <p className="mt-2 text-sm text-muted-foreground">Les 100 dernières actions d’administration.</p>

        {entries.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aucune action enregistrée.
          </p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="divide-y divide-border text-sm">
              {entries.map((e) => (
                <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <span className="font-mono text-xs font-bold text-terracotta">{e.action}</span>
                  <span className="text-muted-foreground">
                    {e.entity} · {e.entityId.slice(0, 8)}…
                  </span>
                  <span className="text-muted-foreground">{e.actor.name ?? e.actor.email}</span>
                  <span className="text-xs text-muted-foreground/70">{fmt(e.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
