import Link from 'next/link'
import { Cover } from '@/components/ui/cover'
import { ArrowRight, Heart, History, MapPin, Sparkles, Ticket, UserRound } from 'lucide-react'
import { AppShell, type NavItem } from '@/components/app/app-shell'
import { PageHead, EmptyState } from '@/components/app/ui'
import { MemberCard } from '@/components/client/member-card'
import { FavoriteToggleDb } from '@/components/business/favorite-toggle-db'
import { ClaimOffer } from '@/components/business/claim-offer'
import { OfferCard } from '@/components/offers/offer-card'
import { RegionPicker } from '@/components/region/region-picker'
import { RegionPrompt } from '@/components/region/region-prompt'
import { requireUser } from '@/lib/session'
import {
  getClientCounts,
  getClientDashboard,
  getClientRedemptions,
  listActiveBusinesses,
  listActiveOffers,
} from '@/lib/queries'
import { getPreferredRegion } from '@/lib/region-prefs'
import { governorateLabel } from '@/lib/regions'
import { CATEGORY_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

const TABS = ['bons-plans', 'mes-bons-plans', 'favoris', 'decouvrir', 'historique', 'profil'] as const

export default async function EspaceClientPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await requireUser(['CLIENT'])
  const { tab } = await searchParams
  const active = (TABS as readonly string[]).includes(tab ?? '') ? (tab as string) : 'bons-plans'
  const displayName = user.name ?? user.email.split('@')[0]

  const region = await getPreferredRegion()
  const { memberSince, counts } = await getClientCounts(user.id)

  const nav: NavItem[] = [
    { key: 'bons-plans', label: 'Bons plans', href: '/espace-client?tab=bons-plans', icon: Ticket, badge: counts.offers, section: 'Mes avantages' },
    { key: 'mes-bons-plans', label: 'Mes bons plans', href: '/espace-client?tab=mes-bons-plans', icon: Sparkles, badge: counts.redemptions, section: 'Mes avantages' },
    { key: 'favoris', label: 'Mes favoris', href: '/espace-client?tab=favoris', icon: Heart, badge: counts.favorites, section: 'Mes avantages' },
    { key: 'decouvrir', label: 'Autour de moi', href: '/espace-client?tab=decouvrir', icon: MapPin, section: 'Explorer' },
    { key: 'historique', label: 'Historique', href: '/espace-client?tab=historique', icon: History, section: 'Explorer' },
    { key: 'profil', label: 'Profil', href: '/espace-client?tab=profil', icon: UserRound, section: 'Compte' },
  ]

  return (
    <AppShell
      roleLabel="Espace membre"
      accent="olive"
      userName={displayName}
      homeHref="/"
      nav={nav}
      activeKey={active}
      headerSlot={
        <RegionPicker current={region} currentLabel={governorateLabel(region)} variant="compact" />
      }
      sidebarHeader={
        <MemberCard
          name={displayName}
          memberSince={memberSince}
          redemptions={counts.redemptions}
          favorites={counts.favorites}
        />
      }
    >
      {active === 'bons-plans' && <OffersTab userId={user.id} firstName={displayName} />}
      {active === 'mes-bons-plans' && <MyOffersTab userId={user.id} />}
      {active === 'favoris' && <FavorisTab userId={user.id} />}
      {active === 'decouvrir' && <DecouvrirTab userId={user.id} />}
      {active === 'historique' && <HistoriqueTab userId={user.id} />}
      {active === 'profil' && <ProfilTab userId={user.id} name={user.name} email={user.email} />}
    </AppShell>
  )
}

/* ---------- Onglets ---------- */

async function OffersTab({ userId, firstName }: { userId: string; firstName: string }) {
  const region = await getPreferredRegion()
  const regionLabel = governorateLabel(region)
  const [offers, redemptions] = await Promise.all([
    listActiveOffers(undefined, region ?? undefined),
    getClientRedemptions(userId),
  ])
  const codeByOffer = new Map(redemptions.map((r) => [r.offerId, r.code]))

  return (
    <>
      <PageHead
        eyebrow={`Bonjour ${firstName}`}
        title={regionLabel ? `Les bons plans à ${regionLabel}.` : 'Les bons plans du moment.'}
        subtitle="Récupère le bon plan, présente ton code au comptoir. Réservé aux membres Winou."
      />
      {!region && <RegionPrompt />}
      {offers.length === 0 ? (
        <EmptyState
          icon={Ticket}
          text={
            regionLabel
              ? `Aucun bon plan à ${regionLabel} pour l’instant. Choisis « Toute la Tunisie » pour voir tout.`
              : 'Aucun bon plan actif pour l’instant. Reviens vite, les commerces en publient chaque semaine.'
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      <PageHead eyebrow="Tes codes" title="Mes bons plans" subtitle="À présenter au comptoir de l’établissement." />
      {redemptions.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          text="Tu n’as pas encore récupéré de bon plan."
          cta={
            <Link
              href="/espace-client?tab=bons-plans"
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Voir les bons plans <ArrowRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {redemptions.map((r) => (
            <div
              key={r.id}
              className={`flex items-center justify-between gap-4 rounded-3xl border bg-card p-5 ${
                r.usedAt ? 'border-border opacity-60' : 'border-terracotta/25'
              }`}
            >
              <div className="min-w-0">
                <Link
                  href={`/commerce/${r.offer.business.slug}`}
                  className="font-display text-lg font-bold hover:text-terracotta"
                >
                  {r.offer.business.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {r.offer.title} ·{' '}
                  <span className="font-semibold text-terracotta">{r.offer.discountLabel}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="rounded-xl border border-dashed border-terracotta/40 bg-terracotta/[0.06] px-3 py-1.5 font-mono text-lg font-bold tracking-[0.24em] text-foreground">
                  {r.code}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {r.usedAt ? 'Utilisé' : 'À présenter'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

async function FavorisTab({ userId }: { userId: string }) {
  const { favorites } = await getClientDashboard(userId)
  return (
    <>
      <PageHead eyebrow="Tes adresses" title="Mes favoris" subtitle="Les lieux que tu gardes sous le coude." />
      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          text="Aucun favori pour l’instant."
          cta={
            <Link
              href="/espace-client?tab=decouvrir"
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Explorer les adresses <ArrowRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
  const region = await getPreferredRegion()
  const regionLabel = governorateLabel(region)
  const [businesses, { favorites }] = await Promise.all([
    listActiveBusinesses({ region: region ?? undefined }),
    getClientDashboard(userId),
  ])
  const favIds = new Set(favorites.map((f) => f.businessId))
  return (
    <>
      <PageHead
        eyebrow="À explorer"
        title={regionLabel ? `Autour de moi · ${regionLabel}` : 'Autour de moi'}
        subtitle={
          regionLabel
            ? `Restaurants et cafés validés à ${regionLabel}.`
            : 'Choisis ta zone pour voir les adresses près de toi.'
        }
      />
      {!region && <RegionPrompt />}
      {region && businesses.length === 0 && (
        <EmptyState icon={MapPin} text={`Aucune adresse à ${regionLabel} pour l’instant.`} />
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
      <PageHead eyebrow="Tes visites" title="Historique" subtitle="Les fiches que tu as consultées récemment." />
      {viewed.length === 0 ? (
        <EmptyState icon={History} text="Aucune fiche consultée pour l’instant." />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {viewed.map((v) => (
            <Link
              key={v.id}
              href={`/commerce/${v.business!.slug}`}
              className="flex items-center justify-between px-5 py-4 text-sm font-semibold transition hover:bg-secondary"
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

async function ProfilTab({ userId, name, email }: { userId: string; name: string | null; email: string }) {
  const { memberSince } = await getClientDashboard(userId)
  return (
    <>
      <PageHead eyebrow="Ton compte" title="Mon profil" />
      <div className="max-w-xl rounded-3xl border border-border bg-card p-6">
        <dl className="space-y-4 text-sm">
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
    </>
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
    <article className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(53,41,30,0.12)]">
      <div className="relative h-44 bg-secondary">
        <Cover src={image ?? '/images/restaurant.png'} alt={name} sizes="(max-width:640px) 100vw, 360px" className="transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute right-3 top-3">
          <FavoriteToggleDb businessId={businessId} businessName={name} initialFavorited={favorited} />
        </div>
        <Link href={`/commerce/${slug}`} className="absolute bottom-3 left-4 font-display text-lg font-bold text-white">
          {name}
        </Link>
      </div>
      <div className="flex items-center justify-between gap-2 p-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-terracotta" /> {meta}
        </p>
        <Link href={`/commerce/${slug}`} className="text-xs font-bold text-terracotta">
          Voir →
        </Link>
      </div>
    </article>
  )
}
