import Link from 'next/link'
import { ArrowRight, Plus, Star, Heart, ExternalLink } from 'lucide-react'
import { AppHeader } from '@/components/dashboard/app-header'
import { requireMerchant } from '@/lib/session'
import { getMerchantBusinesses } from '@/lib/queries'
import { BUSINESS_STATUS_LABELS, SUB_STATUS_LABELS, CATEGORY_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const user = await requireMerchant()
  const businesses = await getMerchantBusinesses(user.id)
  const { submitted } = await searchParams

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader label="Espace commerçant" userName={user.name ?? user.email} homeHref="/dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Vos établissements</p>
            <h1 className="mt-2 font-display text-4xl">Mon tableau de bord</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajoutez vos restaurants et cafés, suivez leur validation et leur abonnement.
            </p>
          </div>
          <Link
            href="/dashboard/nouveau"
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5"
          >
            <Plus className="size-4" /> Ajouter un établissement
          </Link>
        </div>

        {submitted && (
          <p className="mt-6 rounded-xl bg-olive/10 px-4 py-3 text-sm font-medium text-olive">
            Votre demande est envoyée. L’équipe Blayes valide votre fiche sous 48 h.
          </p>
        )}

        {businesses.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold">Aucun établissement pour l’instant</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Créez la fiche de votre restaurant ou café pour rejoindre la carte Blayes.
            </p>
            <Link
              href="/dashboard/nouveau"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              <Plus className="size-4" /> Ajouter mon premier établissement
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {businesses.map((business) => {
              const status = BUSINESS_STATUS_LABELS[business.status]
              return (
                <article
                  key={business.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
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
      </main>
    </div>
  )
}
