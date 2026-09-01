import Link from 'next/link'
import { Users, Store, TrendingUp, Clock, Star, Flag, ScrollText, Ticket } from 'lucide-react'
import { AppHeader } from '@/components/dashboard/app-header'
import { ModerationActions } from '@/components/admin/moderation-actions'
import { ReviewModeration, ReportActions } from '@/components/admin/simple-actions'
import { requireUser } from '@/lib/session'
import {
  getAdminStats,
  listBusinessesForAdmin,
  listClientsForAdmin,
  listPendingReviews,
  listReports,
} from '@/lib/queries'
import { BUSINESS_STATUS_LABELS, CATEGORY_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

const TABS = [
  { key: 'pending', label: 'En attente' },
  { key: 'active', label: 'En ligne' },
  { key: 'all', label: 'Tous' },
  { key: 'clients', label: 'Clients' },
  { key: 'reviews', label: 'Avis' },
  { key: 'reports', label: 'Signalements' },
] as const
type TabKey = (typeof TABS)[number]['key']

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await requireUser(['ADMIN'])
  const { tab } = await searchParams
  const active: TabKey = (TABS.find((t) => t.key === tab)?.key ?? 'pending') as TabKey

  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader label="Administration" userName={user.name ?? user.email} homeHref="/admin" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <p className="eyebrow">Supervision de la plateforme</p>
        <h1 className="mt-2 font-display text-4xl">Console admin</h1>

        {/* Statistiques */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Users} label="Clients inscrits" value={stats.clients} hint={`${stats.merchants} commerçants · ${stats.admins} admins`} />
          <Stat icon={Store} label="Commerces en ligne" value={stats.businesses.active} hint={`${stats.businesses.total} au total`} />
          <Stat icon={Clock} label="En attente de validation" value={stats.businesses.pending} hint={`${stats.businesses.suspended} suspendus`} />
          <Stat icon={TrendingUp} label="Revenu annuel récurrent" value={`${stats.arr} DT`} hint={`${stats.revenuePaid} DT encaissés`} />
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={Ticket}
            label="Bons plans utilisés (30 j)"
            value={stats.redemptions30d}
            hint={`${stats.offersActive} bons plans actifs`}
          />
          <Stat icon={Star} label="Avis à modérer" value={stats.reviewsPending} />
          <Stat icon={Flag} label="Signalements ouverts" value={stats.reportsOpen} />
          <Link
            href="/admin/journal"
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition hover:border-terracotta"
          >
            <span className="text-sm font-semibold">Journal d’activité</span>
            <ScrollText className="size-4 text-terracotta" />
          </Link>
        </div>

        {/* Onglets */}
        <nav className="mt-10 flex flex-wrap gap-2 border-b border-border">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/admin?tab=${t.key}`}
              className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
                active === t.key
                  ? 'border-b-2 border-terracotta text-terracotta'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6">
          {active === 'clients' ? (
            <ClientsTable />
          ) : active === 'reviews' ? (
            <ReviewsTable />
          ) : active === 'reports' ? (
            <ReportsTable />
          ) : (
            <BusinessTable tab={active} />
          )}
        </div>
      </main>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="rounded-xl bg-terracotta/10 p-2.5 text-terracotta">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

async function BusinessTable({ tab }: { tab: TabKey }) {
  const status = tab === 'pending' ? 'PENDING' : tab === 'active' ? 'ACTIVE' : undefined
  const businesses = await listBusinessesForAdmin(status)

  if (businesses.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Rien ici pour le moment.</p>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="divide-y divide-border">
        {businesses.map((b) => {
          const s = BUSINESS_STATUS_LABELS[b.status]
          return (
            <div key={b.id} className="flex flex-col gap-3 p-5 md:grid md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center">
              <div>
                <Link href={`/admin/commerces/${b.id}`} className="font-semibold hover:text-terracotta">
                  {b.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[b.category]} · {b.city} · {b.owner.email}
                </p>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${s.tone}`}>{s.label}</span>
              <span className="text-sm text-muted-foreground">
                {b.subscription ? `${b.subscription.tier} · ${b.subscription.pricePerYear} DT/an` : 'Sans abonnement'}
              </span>
              <ModerationActions
                businessId={b.id}
                actions={
                  b.status === 'PENDING'
                    ? ['approve', 'reject']
                    : b.status === 'ACTIVE'
                      ? ['suspend']
                      : b.status === 'SUSPENDED'
                        ? ['reactivate']
                        : ['approve', 'reject']
                }
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

async function ClientsTable() {
  const clients = await listClientsForAdmin()
  if (clients.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun client inscrit.</p>
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="divide-y divide-border">
        {clients.map((c) => (
          <div key={c.id} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{c.name ?? 'Sans nom'}</p>
              <p className="text-xs text-muted-foreground">{c.email}{c.city ? ` · ${c.city}` : ''}</p>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{c._count.favorites} favoris</span>
              <span>{c._count.reviews} avis</span>
              <span>{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(c.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function ReviewsTable() {
  const reviews = await listPendingReviews()
  if (reviews.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun avis à modérer.</p>
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="divide-y divide-border">
        {reviews.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {r.author.name ?? r.author.email} · sur{' '}
                <Link href={`/commerce/${r.business.slug}`} className="text-terracotta hover:underline">
                  {r.business.name}
                </Link>
              </p>
              <span className="flex items-center gap-1 text-ochre">
                <Star className="size-3.5 fill-current" /> {r.rating}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{r.text}</p>
            <ReviewModeration reviewId={r.id} />
          </div>
        ))}
      </div>
    </div>
  )
}

async function ReportsTable() {
  const reports = await listReports('OPEN')
  if (reports.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun signalement ouvert.</p>
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="divide-y divide-border">
        {reports.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                <Link href={`/admin/commerces/${r.business.id}`} className="text-terracotta hover:underline">
                  {r.business.name}
                </Link>{' '}
                — {r.reason}
              </p>
              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(r.createdAt)}
              </span>
            </div>
            {r.detail && <p className="text-sm text-muted-foreground">{r.detail}</p>}
            <p className="text-xs text-muted-foreground">
              Signalé par {r.reporter ? (r.reporter.name ?? r.reporter.email) : 'un visiteur'}
            </p>
            <ReportActions reportId={r.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
