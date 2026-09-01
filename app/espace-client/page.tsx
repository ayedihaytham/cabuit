import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, History, MapPin, Sparkles, Ticket } from 'lucide-react'
import { ClientTopbar } from '@/components/client/client-topbar'
import { ClientNav } from '@/components/client/client-nav'
import { FavoriteToggleDb } from '@/components/business/favorite-toggle-db'
import { ClaimOffer } from '@/components/business/claim-offer'
import { OfferCard } from '@/components/offers/offer-card'
import { requireUser } from '@/lib/session'
import {
  getClientCounts,
  getClientDashboard,
  getClientRedemptions,
  listActiveBusinesses,
  listActiveOffers,
} from '@/lib/queries'
import { CATEGORY_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

const TAB_KEYS = ['bons-plans', 'mes-bons-plans', 'favoris', 'decouvrir', 'historique', 'profil'] as const

export default async function EspaceClientPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await requireUser(['CLIENT'])
  const { tab } = await searchParams
  const active = (TAB_KEYS as readonly string[]).includes(tab ?? '') ? (tab as string) : 'bons-plans'
  const displayName = user.name ?? user.email.split('@')[0]

  const { memberSince, counts } = await getClientCounts(user.id)

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.014_82)] text-foreground">
      <ClientTopbar name={displayName} />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:flex-row md:px-8 md:py-10">
        <ClientNav active={active} name={displayName} memberSince={memberSince} counts={counts} />

        <section className="min-w-0 flex-1">
          {active === 'bons-plans' && <OffersTab userId={user.id} firstName={displayName} />}
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

/* ---------- Hero + empty state ---------- */

function Hero({ eyebrow, title, subtitle }: { eyebrow: string; title: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-7">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

function Empty({ icon: Icon, text, cta }: { icon: typeof Ticket; text: string; cta?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
        <Icon className="size-6" />
      </span>
      <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">{text}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  )
}

/* ---------- Bons plans ---------- */

async function OffersTab({ userId, firstName }: { userId: string; firstName: string }) {
  const [offers, redemptions] = await Promise.all([listActiveOffers(), getClientRedemptions(userId)])
  const codeByOffer = new Map(redemptions.map((r) => [r.offerId, r.code]))

  return (
    <>
      <Hero
        eyebrow={`Bonjour ${firstName}`}
        title={<>Les bons plans du moment.</>}
        subtitle="Récupère le bon plan, présente ton code au comptoir. Réservé aux membres Blayes."
      />
      {offers.length === 0 ? (
        <Empty icon={Ticket} text="Aucun bon plan actif pour l’instant. Reviens vite, les commerces en publient chaque semaine." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
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
      <Hero eyebrow="Tes codes" title="Mes bons plans" subtitle="À présenter au comptoir de l’établissement." />
      {redemptions.length === 0 ? (
        <Empty
          icon={Sparkles}
          text="Tu n’as pas encore récupéré de bon plan."
          cta={
            <Link href="/espace-client?tab=bons-plans" className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-primary-foreground">
              Voir les bons plans <ArrowRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {redemptions.map((r) => (
            <div
              key={r.id}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 ${
                r.usedAt ? 'border-border opacity-60' : 'border-terracotta/25'
              }`}
            >
              <div className="min-w-0">
                <Link href={`/commerce/${r.offer.business.slug}`} className="font-display text-lg font-bold hover:text-terracotta">
                  {r.offer.business.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {r.offer.title} · <span className="font-semibold text-terracotta">{r.offer.discountLabel}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="rounded-xl border border-dashed border-terracotta/40 bg-terracotta/[0.06] px-3 py-1.5 font-mono text-xl font-bold tracking-[0.28em] text-foreground">
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

/* ---------- Favoris / Découvrir / Historique / Profil ---------- */

async function FavorisTab({ userId }: { userId: string }) {
  const { favorites } = await getClientDashboard(userId)
  return (
    <>
      <Hero eyebrow="Tes adresses" title="Mes favoris" subtitle="Les lieux que tu gardes sous le coude." />
      {favorites.length === 0 ? (
        <Empty
          icon={Heart}
          text="Aucun favori pour l’instant."
          cta={
            <Link href="/espace-client?tab=decouvrir" className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-primary-foreground">
              Explorer les adresses <ArrowRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
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
  const [businesses, { favorites }] = await Promise.all([listActiveBusinesses(), getClientDashboard(userId)])
  const favIds = new Set(favorites.map((f) => f.businessId))
  return (
    <>
      <Hero eyebrow="À explorer" title="Découvrir" subtitle="Tous les restaurants et cafés validés sur Blayes." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <Hero eyebrow="Tes visites" title="Historique" subtitle="Les fiches que tu as consultées récemment." />
      {viewed.length === 0 ? (
        <Empty icon={History} text="Aucune fiche consultée pour l’instant." />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {viewed.map((v) => (
            <Link
              key={v.id}
              href={`/commerce/${v.business!.slug}`}
              className="flex items-center justify-between px-5 py-4 text-sm font-semibold transition hover:bg-secondary"
            >
              <span>{v.business!.name}</span>
              <span className="text-xs text-muted-foreground">
                {v.business!.city} · {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(v.createdAt)}
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
      <Hero eyebrow="Ton compte" title="Mon profil" />
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
        <Image
          src={image ?? '/images/restaurant.png'}
          alt={name}
          fill
          sizes="(max-width:640px) 100vw, 360px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute right-3 top-3">
          <FavoriteToggleDb businessId={businessId} businessName={name} initialFavorited={favorited} />
        </div>
        <Link
          href={`/commerce/${slug}`}
          className="absolute bottom-3 left-4 font-display text-lg font-bold text-white"
        >
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
