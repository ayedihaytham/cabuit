import Link from 'next/link'
import Image from 'next/image'
import { Heart, History, LayoutGrid, Ticket, UserRound } from 'lucide-react'
import { AppHeader } from '@/components/dashboard/app-header'
import { FavoriteToggleDb } from '@/components/business/favorite-toggle-db'
import { ClaimOffer } from '@/components/business/claim-offer'
import { OfferCard } from '@/components/offers/offer-card'
import { requireUser } from '@/lib/session'
import {
  getClientDashboard,
  getClientRedemptions,
  listActiveBusinesses,
  listActiveOffers,
} from '@/lib/queries'
import { CATEGORY_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

const TABS = [
  { key: 'bons-plans', label: 'Bons plans', icon: Ticket },
  { key: 'mes-bons-plans', label: 'Mes bons plans', icon: Ticket },
  { key: 'favoris', label: 'Mes favoris', icon: Heart },
  { key: 'decouvrir', label: 'Découvrir', icon: LayoutGrid },
  { key: 'historique', label: 'Historique', icon: History },
  { key: 'profil', label: 'Profil', icon: UserRound },
] as const

export default async function EspaceClientPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await requireUser(['CLIENT'])
  const { tab } = await searchParams
  const active = TABS.find((t) => t.key === tab)?.key ?? 'bons-plans'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader label="Espace client" userName={user.name ?? user.email} homeHref="/" />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8 md:py-12">
        <aside className="md:w-56 md:shrink-0">
          <nav className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 md:flex-col">
            {TABS.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                href={`/espace-client?tab=${key}`}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active === key ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="size-4" /> {label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          {active === 'bons-plans' && <OffersTab userId={user.id} />}
          {active === 'mes-bons-plans' && <MyOffersTab userId={user.id} />}
          {active === 'favoris' && <FavorisTab userId={user.id} />}
          {active === 'decouvrir' && <DecouvrirTab userId={user.id} />}
          {active === 'historique' && <HistoriqueTab userId={user.id} />}
          {active === 'profil' && <ProfilTab userId={user.id} name={user.name} email={user.email} />}
        </section>
      </div>
    </div>
  )
}

/* ---------- Bons plans ---------- */

async function OffersTab({ userId }: { userId: string }) {
  const [offers, redemptions] = await Promise.all([
    listActiveOffers(),
    getClientRedemptions(userId),
  ])
  const codeByOffer = new Map(redemptions.map((r) => [r.offerId, r.code]))

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Bons plans du moment</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Récupère le bon plan, présente ton code au comptoir. Réservé aux membres.
      </p>
      {offers.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Aucun bon plan actif pour l’instant.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {offers.map((o) => (
            <OfferCard
              key={o.id}
              title={o.title}
              discountLabel={o.discountLabel}
              description={o.description}
              conditions={o.conditions}
              validUntil={o.validUntil}
              businessName={o.business.name}
              businessSlug={o.business.slug}
              businessCity={o.business.city}
              action={<ClaimOffer offerId={o.id} isClient initialCode={codeByOffer.get(o.id) ?? null} />}
            />
          ))}
        </div>
      )}
    </>
  )
}

async function MyOffersTab({ userId }: { userId: string }) {
  const redemptions = await getClientRedemptions(userId)
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Mes bons plans</h1>
      {redemptions.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Tu n’as pas encore récupéré de bon plan.{' '}
          <Link href="/espace-client?tab=bons-plans" className="font-semibold text-terracotta">
            Voir les bons plans
          </Link>
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {redemptions.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div>
                <Link href={`/commerce/${r.offer.business.slug}`} className="font-display text-lg font-bold hover:text-terracotta">
                  {r.offer.business.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {r.offer.title} · <span className="font-semibold text-terracotta">{r.offer.discountLabel}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-bold tracking-[0.25em]">{r.code}</p>
                <p className="text-xs text-muted-foreground">
                  {r.usedAt ? 'Utilisé' : 'À présenter au comptoir'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ---------- Favoris / Découvrir / Historique / Profil ---------- */

async function FavorisTab({ userId }: { userId: string }) {
  const { favorites } = await getClientDashboard(userId)
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Mes favoris</h1>
      {favorites.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Aucun favori.{' '}
          <Link href="/espace-client?tab=decouvrir" className="font-semibold text-terracotta">
            Explore les adresses
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {favorites.map((f) => (
            <PlaceCard
              key={f.id}
              businessId={f.businessId}
              slug={f.business.slug}
              name={f.business.name}
              meta={`${CATEGORY_LABELS[f.business.category]} · ${f.business.city}`}
              image={f.business.photos[0]?.url}
              favorited
            />
          ))}
        </div>
      )}
    </>
  )
}

async function DecouvrirTab({ userId }: { userId: string }) {
  const [businesses, { favorites }] = await Promise.all([
    listActiveBusinesses(),
    getClientDashboard(userId),
  ])
  const favIds = new Set(favorites.map((f) => f.businessId))
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Découvrir</h1>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((b) => (
          <PlaceCard
            key={b.id}
            businessId={b.id}
            slug={b.slug}
            name={b.name}
            meta={`${CATEGORY_LABELS[b.category]} · ${b.city}`}
            image={b.photos[0]?.url}
            favorited={favIds.has(b.id)}
          />
        ))}
      </div>
    </>
  )
}

async function HistoriqueTab({ userId }: { userId: string }) {
  const { viewed } = await getClientDashboard(userId)
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Historique</h1>
      {viewed.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Aucune fiche consultée pour l’instant.</p>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
          {viewed.map((v) => (
            <Link
              key={v.id}
              href={`/commerce/${v.business!.slug}`}
              className="flex items-center justify-between px-5 py-4 text-sm font-semibold hover:bg-secondary"
            >
              <span>{v.business!.name}</span>
              <span className="text-xs text-muted-foreground">
                {v.business!.city} ·{' '}
                {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(v.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

async function ProfilTab({
  userId,
  name,
  email,
}: {
  userId: string
  name: string | null
  email: string
}) {
  const { memberSince } = await getClientDashboard(userId)
  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-6">
      <h1 className="font-display text-3xl font-bold">Mon profil</h1>
      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Nom</dt>
          <dd className="font-semibold">{name ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-semibold">{email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Membre depuis</dt>
          <dd className="font-semibold">
            {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(memberSince)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function PlaceCard({
  businessId,
  slug,
  name,
  meta,
  image,
  favorited,
}: {
  businessId: string
  slug: string
  name: string
  meta: string
  image?: string
  favorited: boolean
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative h-40 bg-secondary">
        <Image
          src={image ?? '/images/restaurant.png'}
          alt={name}
          fill
          sizes="(max-width:640px) 100vw, 320px"
          className="object-cover"
        />
        <div className="absolute right-3 top-3">
          <FavoriteToggleDb businessId={businessId} businessName={name} initialFavorited={favorited} />
        </div>
      </div>
      <div className="p-4">
        <Link href={`/commerce/${slug}`} className="font-display text-lg font-bold hover:text-terracotta">
          {name}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
      </div>
    </article>
  )
}
