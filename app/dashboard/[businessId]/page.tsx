import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Eye, Phone, Star } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { MERCHANT_NAV } from '@/lib/nav'
import { BusinessForm } from '@/components/dashboard/business-form'
import { SubmitForReview } from '@/components/dashboard/submit-for-review'
import { MenuEditor } from '@/components/dashboard/menu-editor'
import { OfferManager } from '@/components/dashboard/offer-manager'
import { ReviewReply } from '@/components/dashboard/review-reply'
import { updateBusiness, submitBusiness } from '@/app/actions/business'
import { requireMerchant } from '@/lib/session'
import { getOwnedBusiness, getBusinessStats } from '@/lib/queries'
import { BUSINESS_STATUS_LABELS, SUB_STATUS_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

export default async function ManageBusinessPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const user = await requireMerchant()
  const { businessId } = await params
  const { created } = await searchParams
  const business = await getOwnedBusiness(businessId, user.id)
  if (!business) notFound()

  const status = BUSINESS_STATUS_LABELS[business.status]
  const canSubmit = business.status === 'DRAFT' || business.status === 'REJECTED'
  const boundUpdate = updateBusiness.bind(null, business.id)
  const boundSubmit = submitBusiness.bind(null, business.id)
  const stats = await getBusinessStats(business.id)

  return (
    <AppShell
      roleLabel="Espace commerçant"
      userName={user.name ?? user.email}
      homeHref="/dashboard"
      nav={MERCHANT_NAV}
      activeKey="etablissements"
    >
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta">
          <ArrowLeft className="size-4" /> Retour
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl">{business.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.tone}`}>{status.label}</span>
          {business.status === 'ACTIVE' && (
            <Link href={`/commerce/${business.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:underline">
              <ExternalLink className="size-3.5" /> Voir la fiche publique
            </Link>
          )}
        </div>

        {created && (
          <p className="mt-4 rounded-xl bg-olive/10 px-4 py-3 text-sm font-medium text-olive">
            Brouillon créé. Complétez la fiche puis envoyez-la à validation.
          </p>
        )}
        {business.status === 'PENDING' && (
          <p className="mt-4 rounded-xl bg-ochre/15 px-4 py-3 text-sm font-medium text-ochre">
            Fiche en cours de validation par l’équipe Blayes.
          </p>
        )}
        {business.status === 'REJECTED' && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            Fiche refusée. Corrigez les informations et renvoyez-la.
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
          <h2 className="mb-5 font-display text-2xl font-bold">Informations</h2>
          <BusinessForm
            action={boundUpdate}
            submitLabel="Enregistrer"
            values={{
              name: business.name,
              category: business.category,
              type: business.type,
              city: business.city,
              address: business.address,
              description: business.description,
              phone: business.phone ?? '',
              whatsapp: business.whatsapp ?? '',
              instagram: business.instagram ?? '',
            }}
          />
        </section>

        {canSubmit ? (
          <section className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5 sm:p-7">
            <h2 className="font-display text-2xl font-bold">Choisir une offre & envoyer à validation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Après validation par Blayes, votre fiche devient publique. 30 jours d’essai gratuit,
              sans engagement.
            </p>
            <div className="mt-5">
              <SubmitForReview action={boundSubmit} />
            </div>
          </section>
        ) : (
          business.subscription && (
            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Abonnement</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Row k="Offre" v={business.subscription.tier} />
                <Row k="Statut" v={SUB_STATUS_LABELS[business.subscription.status]} />
                <Row k="Prix" v={`${business.subscription.pricePerYear} DT / an`} />
                <Row
                  k="CGA acceptées le"
                  v={new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(business.subscription.acceptedTermsAt)}
                />
              </dl>
            </section>
          )
        )}

        {business.status === 'ACTIVE' && (
          <>
            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Statistiques (30 jours)</h2>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <StatBox icon={Eye} n={stats.views} label="vues de la fiche" />
                <StatBox icon={Phone} n={stats.contacts} label="clics contact" />
                <StatBox icon={Star} n={stats.favorites} label="mises en favori" />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Bons plans</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Une offre membres attire les clients Blayes et vous donne un trafic mesurable en
                boutique. Ils présentent un code au comptoir.
              </p>
              <div className="mt-5">
                <OfferManager businessId={business.id} offers={business.offers} />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Menu</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ce que verront les clients sur votre fiche.</p>
              <div className="mt-5">
                <MenuEditor businessId={business.id} sections={business.menuSections} />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Avis reçus</h2>
              {business.reviews.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Aucun avis publié pour l’instant.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {business.reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between text-sm">
                        <strong>{r.author.name ?? 'Client'}</strong>
                        <span className="flex items-center gap-1 text-ochre">
                          <Star className="size-3.5 fill-current" /> {r.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                      <ReviewReply reviewId={r.id} existing={r.ownerReply} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}

function StatBox({ icon: Icon, n, label }: { icon: typeof Eye; n: number; label: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-4">
      <Icon className="mx-auto size-4 text-terracotta" />
      <p className="mt-2 font-display text-2xl font-bold">{n}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  )
}
