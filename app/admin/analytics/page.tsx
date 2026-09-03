import { AppShell } from '@/components/app/app-shell'
import { PageHead } from '@/components/app/ui'
import { MiniBarChart } from '@/components/admin/mini-bar-chart'
import { adminNav } from '@/lib/nav'
import { requireUser } from '@/lib/session'
import { getAdminStats, getFounderAnalytics } from '@/lib/queries'
import { governorateLabel } from '@/lib/regions'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const user = await requireUser(['ADMIN'])
  const [stats, a] = await Promise.all([getAdminStats(), getFounderAnalytics()])

  const funnel = [
    { label: 'Vues de fiches', value: a.funnel.views },
    { label: 'Inscriptions', value: a.funnel.signups },
    { label: 'Membres ayant récupéré un bon plan', value: a.funnel.claimers },
    { label: 'Codes utilisés au comptoir', value: a.funnel.usedAtCounter },
  ]
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value))

  return (
    <AppShell
      roleLabel="Administration"
      accent="ink"
      userName={user.name ?? user.email}
      homeHref="/admin"
      nav={adminNav({ reviews: stats.reviewsPending, reports: stats.reportsOpen, messages: stats.messagesOpen })}
      activeKey="analytics"
    >
      <PageHead eyebrow="Croissance" title="Analytics" subtitle="Entonnoir, tendances et tops sur 30 jours." />

      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/70">Entonnoir</h2>
      <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
        {funnel.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <span className="w-64 shrink-0 text-sm text-muted-foreground">{f.label}</span>
            <span className="h-6 rounded bg-terracotta/80" style={{ width: `${(f.value / funnelMax) * 100}%`, minWidth: f.value ? 6 : 0 }} />
            <span className="text-sm font-bold">{f.value}</span>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/70">Tendances</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <MiniBarChart data={a.series.signups} label="Inscriptions / jour" />
        <MiniBarChart data={a.series.redemptions} label="Bons plans récupérés / jour" accent="#7c8a3f" />
        <MiniBarChart data={a.series.newBusinesses} label="Nouveaux établissements / jour" accent="#c98a2b" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <KPI label="Abonnements payés" value={a.conversion.paid} hint={`${a.conversion.trialing} en essai`} />
        <KPI label="Taux de conversion" value={`${a.conversion.rate} %`} hint="payés / total abonnements" />
        <KPI label="Total abonnements" value={a.conversion.totalSubs} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <TopList title="Fiches les plus vues (30 j)" rows={a.topViewed.map((r) => ({ label: r.name, value: r.views }))} />
        <TopList title="Bons plans les plus repris" rows={a.topOffers.map((r) => ({ label: `${r.title} · ${r.business}`, value: r.count }))} />
        <TopList title="Recherches fréquentes (30 j)" rows={a.topSearches.map((r) => ({ label: r.query, value: r.count }))} />
        <TopList
          title="Établissements par gouvernorat"
          rows={a.regions.map((r) => ({ label: governorateLabel(r.region) ?? r.region, value: r.count }))}
        />
      </div>
    </AppShell>
  )
}

function KPI({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

function TopList({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Pas encore de données.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-4">
              <span className="truncate text-muted-foreground">{r.label || '—'}</span>
              <span className="shrink-0 font-bold">{r.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
