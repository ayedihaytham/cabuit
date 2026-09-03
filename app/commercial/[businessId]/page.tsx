import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Lock } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { COMMERCIAL_NAV } from '@/lib/nav'
import { BusinessForm } from '@/components/dashboard/business-form'
import { PhotoManager } from '@/components/dashboard/photo-manager'
import { OfferManager } from '@/components/dashboard/offer-manager'
import { MenuEditor } from '@/components/dashboard/menu-editor'
import { LocationHoursForm } from '@/components/dashboard/location-hours-form'
import { updateBusiness } from '@/app/actions/business'
import { requireCommercial } from '@/lib/session'
import { getCommercialBusiness } from '@/lib/queries'
import { BUSINESS_STATUS_LABELS, SUB_STATUS_LABELS } from '@/lib/status'
import { governorateLabel } from '@/lib/regions'
import type { WeekHours } from '@/lib/hours'

export const dynamic = 'force-dynamic'

const fmt = (d: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(d)

export default async function CommercialBusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {
  const user = await requireCommercial()
  const { businessId } = await params
  const b = await getCommercialBusiness(businessId, user.id)
  if (!b) notFound()

  const st = BUSINESS_STATUS_LABELS[b.status]
  const claimed = Boolean(b.claimedByOwnerAt)

  return (
    <AppShell
      roleLabel="Espace commercial"
      accent="ochre"
      userName={user.name ?? user.email}
      homeHref="/commercial"
      nav={COMMERCIAL_NAV}
      activeKey="overview"
    >
      <div className="mx-auto max-w-3xl">
        <Link href="/commercial" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-ochre">
          <ArrowLeft className="size-4" /> Mon portefeuille
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl">{b.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.tone}`}>{st.label}</span>
          {b.status === 'ACTIVE' && (
            <Link href={`/commerce/${b.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ochre hover:underline">
              <ExternalLink className="size-3.5" /> Fiche publique
            </Link>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérant : {b.owner.name} · {b.owner.email}
          {b.owner.phone ? ` · ${b.owner.phone}` : ''}
        </p>

        <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <Row k="Zone" v={governorateLabel(b.region) ?? b.city} />
            <Row k="Abonnement" v={b.subscription ? SUB_STATUS_LABELS[b.subscription.status] : '—'} />
            {b.subscription?.trialEndsAt && <Row k="Fin d’essai" v={fmt(b.subscription.trialEndsAt)} />}
            <Row k="Onboardée le" v={fmt(b.createdAt)} />
          </div>
        </div>

        {claimed ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-olive/30 bg-olive/[0.06] p-5">
            <Lock className="mt-0.5 size-5 shrink-0 text-olive" />
            <div>
              <p className="font-bold">Le gérant a repris la main le {fmt(b.claimedByOwnerAt!)}.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                La fiche est désormais gérée par son compte. Vous gardez la vue de suivi, mais
                l’édition se fait de son côté.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-6 rounded-xl bg-ochre/10 px-4 py-3 text-xs font-medium text-ochre">
              Vous pouvez éditer cette fiche jusqu’à ce que le gérant se connecte et « prenne la main ».
            </p>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="mb-5 font-display text-2xl font-bold">Informations</h2>
              <BusinessForm
                action={updateBusiness.bind(null, b.id)}
                submitLabel="Enregistrer"
                values={{
                  name: b.name,
                  category: b.category,
                  type: b.type,
                  region: b.region ?? '',
                  city: b.city,
                  address: b.address,
                  description: b.description,
                  phone: b.phone ?? '',
                  whatsapp: b.whatsapp ?? '',
                  instagram: b.instagram ?? '',
                }}
              />
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Photos</h2>
              <div className="mt-5">
                <PhotoManager
                  businessId={b.id}
                  photos={b.photos}
                  uploadEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
                />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Localisation & horaires</h2>
              <div className="mt-5">
                <LocationHoursForm
                  businessId={b.id}
                  lat={b.lat}
                  lng={b.lng}
                  hours={b.hours as WeekHours | null}
                />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-ochre/30 bg-ochre/[0.06] p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Bons plans</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lancez une première offre membres pour donner de la traction à la fiche.
              </p>
              <div className="mt-5">
                <OfferManager businessId={b.id} offers={b.offers} />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold">Menu</h2>
              <div className="mt-5">
                <MenuEditor businessId={b.id} sections={b.menuSections} />
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 pb-1.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  )
}
