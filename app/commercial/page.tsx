import Link from 'next/link'
import {
  ArrowRight,
  Eye,
  MapPin,
  Sparkles,
  Store,
  Ticket,
  UserPlus,
  Users,
} from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { PageHead, EmptyState } from '@/components/app/ui'
import { COMMERCIAL_NAV } from '@/lib/nav'
import { requireCommercial } from '@/lib/session'
import { getCommercialData } from '@/lib/queries'
import { governorateLabel } from '@/lib/regions'
import { BUSINESS_STATUS_LABELS, SUB_STATUS_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

export default async function CommercialDashboard() {
  const user = await requireCommercial()
  const { platform, portfolio, businesses } = await getCommercialData(user.id)

  return (
    <AppShell
      roleLabel="Espace commercial"
      accent="ochre"
      userName={user.name ?? user.email}
      homeHref="/commercial"
      nav={COMMERCIAL_NAV}
      activeKey="overview"
    >
      <PageHead
        eyebrow="Argumentaire & suivi"
        title="Tableau de bord"
        subtitle="Les chiffres à montrer aux gérants, et le suivi de vos fiches."
        action={
          <Link
            href="/commercial/nouveau"
            className="inline-flex items-center gap-2 rounded-full bg-ochre px-5 py-3 text-sm font-bold text-foreground transition hover:-translate-y-0.5"
          >
            <UserPlus className="size-4" /> Onboarder un lieu
          </Link>
        }
      />

      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
        La plateforme aujourd’hui
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat icon={Users} value={platform.clients} label="clients inscrits" hint={`${platform.activeClients30d} actifs sur 30 j`} />
        <Stat icon={Store} value={platform.businessesActive} label="établissements en ligne" hint={`${platform.regionsCovered} gouvernorats couverts`} />
        <Stat icon={Ticket} value={platform.offersActive} label="bons plans actifs" hint={`${platform.redemptions30d} utilisés sur 30 j`} />
        <Stat icon={Eye} value={platform.views30d} label="vues de fiches (30 j)" />
        <Stat icon={Sparkles} value={platform.redemptions30d} label="bons plans dégainés (30 j)" />
        <Stat icon={MapPin} value={platform.regionsCovered} label="gouvernorats avec des adresses" />
      </div>

      <h2 className="mb-3 mt-10 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
        Mon portefeuille
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Store} value={portfolio.total} label="fiches onboardées" />
        <Stat icon={Store} value={portfolio.live} label="en ligne" />
        <Stat icon={Sparkles} value={portfolio.trialing} label="en période d’essai" />
        <Stat icon={Ticket} value={portfolio.paying} label="abonnements réglés" />
      </div>

      <h2 className="mb-4 mt-10 font-display text-2xl font-bold">Mes établissements</h2>
      {businesses.length === 0 ? (
        <EmptyState
          icon={Store}
          text="Vous n’avez pas encore onboardé d’établissement."
          cta={
            <Link href="/commercial/nouveau" className="inline-flex items-center gap-2 rounded-full bg-ochre px-5 py-2.5 text-sm font-bold text-foreground">
              <UserPlus className="size-4" /> Onboarder mon premier lieu
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {businesses.map((b) => {
            const st = BUSINESS_STATUS_LABELS[b.status]
            return (
              <article key={b.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{b.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${st.tone}`}>{st.label}</span>
                    {b.claimedByOwnerAt && (
                      <span className="rounded-full bg-olive/10 px-2 py-0.5 text-[11px] font-bold text-olive">gérant a repris la main</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {governorateLabel(b.region) ?? b.city}
                    {b.subscription && ` · ${SUB_STATUS_LABELS[b.subscription.status]}`}
                    {` · ${b._count.offers} bons plans`}
                  </p>
                </div>
                <Link
                  href={`/commercial/${b.id}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background"
                >
                  {b.claimedByOwnerAt ? 'Voir' : 'Gérer'} <ArrowRight className="size-3.5" />
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
  hint,
}: {
  icon: typeof Users
  value: string | number
  label: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="grid size-9 place-items-center rounded-xl bg-ochre/15 text-ochre">
        <Icon className="size-4" />
      </span>
      <p className="mt-4 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  )
}
