import Link from 'next/link'
import { ArrowRight, ExternalLink, Heart, Plus, Star, Store } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { PageHead, EmptyState } from '@/components/app/ui'
import { SideSummary } from '@/components/app/side-summary'
import { requireMerchant } from '@/lib/session'
import { getMerchantBusinesses } from '@/lib/queries'
import { BUSINESS_STATUS_LABELS, SUB_STATUS_LABELS, CATEGORY_LABELS } from '@/lib/status'
import { MERCHANT_NAV } from '@/lib/nav'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const user = await requireMerchant()
  const businesses = await getMerchantBusinesses(user.id)
  const { submitted } = await searchParams
  const online = businesses.filter((b) => b.status === 'ACTIVE').length

  return (
    <AppShell
      roleLabel="Espace commerçant"
      userName={user.name ?? user.email}
      homeHref="/dashboard"
      nav={MERCHANT_NAV}
      activeKey="etablissements"
      sidebarHeader={
        <SideSummary label="Établissements" value={businesses.length} hint={`${online} en ligne`} />
      }
    >
      <PageHead
        eyebrow="Vos établissements"
        title="Mon tableau de bord"
        subtitle="Ajoutez vos restaurants et cafés, suivez leur validation, leur abonnement et vos bons plans."
        action={
          <Link
            href="/dashboard/nouveau"
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5"
          >
            <Plus className="size-4" /> Ajouter un établissement
          </Link>
        }
      />

      {submitted && (
        <p className="mb-6 rounded-xl bg-olive/10 px-4 py-3 text-sm font-medium text-olive">
          Votre demande est envoyée. L’équipe Blayes valide votre fiche sous 48 h.
        </p>
      )}

      {businesses.length === 0 ? (
        <EmptyState
          icon={Store}
          text="Créez la fiche de votre restaurant ou café pour rejoindre la carte Blayes."
          cta={
            <Link
              href="/dashboard/nouveau"
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Plus className="size-4" /> Ajouter mon premier établissement
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {businesses.map((business) => {
            const status = BUSINESS_STATUS_LABELS[business.status]
            return (
              <article
                key={business.id}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 transition hover:border-terracotta/25 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-bold">{business.name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {CATEGORY_LABELS[business.category]} · {business.city}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="size-3.5 text-ochre" /> {business._count.reviews} avis
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Heart className="size-3.5 text-terracotta" /> {business._count.favorites} favoris
                    </span>
                    {business.subscription && (
                      <span className="rounded-full bg-secondary px-2 py-0.5">
                        {business.subscription.tier} · {SUB_STATUS_LABELS[business.subscription.status]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {business.status === 'ACTIVE' && (
                    <Link
                      href={`/commerce/${business.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary"
                    >
                      <ExternalLink className="size-3.5" /> Fiche publique
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/${business.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background"
                  >
                    Gérer <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
