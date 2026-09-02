import { AppShell } from '@/components/app/app-shell'
import { PageHead, EmptyState } from '@/components/app/ui'
import { adminNav } from '@/lib/nav'
import { ScrollText } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getAdminStats, getAuditLog } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)

export default async function JournalPage() {
  const user = await requireUser(['ADMIN'])
  const [entries, stats] = await Promise.all([getAuditLog(), getAdminStats()])

  return (
    <AppShell
      roleLabel="Administration"
      accent="ink"
      userName={user.name ?? user.email}
      homeHref="/admin"
      nav={adminNav({ reviews: stats.reviewsPending, reports: stats.reportsOpen, messages: stats.messagesOpen })}
      activeKey="journal"
    >
      <PageHead
        eyebrow="Traçabilité"
        title="Journal d’activité"
        subtitle="Les 100 dernières actions d’administration."
      />

      {entries.length === 0 ? (
        <EmptyState icon={ScrollText} text="Aucune action enregistrée." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
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
    </AppShell>
  )
}
