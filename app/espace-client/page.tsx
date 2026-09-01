import Link from 'next/link'
import Image from 'next/image'
import { Heart, History, LayoutGrid, UserRound } from 'lucide-react'
import { AppHeader } from '@/components/dashboard/app-header'
import { FavoriteToggleDb } from '@/components/business/favorite-toggle-db'
import { requireUser } from '@/lib/session'
import { getClientDashboard, listActiveBusinesses } from '@/lib/queries'
import { CATEGORY_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

const TABS = [
  { key: 'favoris', label: 'Mes favoris', icon: Heart },
  { key: 'decouvrir', label: 'Découvrir les offres', icon: LayoutGrid },
  { key: 'historique', label: 'Historique', icon: History },
  { key: 'profil', label: 'Mon profil', icon: UserRound },
] as const

export default async function EspaceClientPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await requireUser(['CLIENT'])
  const { tab } = await searchParams
  const active = TABS.find((t) => t.key === tab)?.key ?? 'favoris'

  const { favorites, viewed, recommended } = await getClientDashboard(user.id)
  const favIds = new Set(favorites.map((f) => f.businessId))
  const allActive = active === 'decouvrir' ? await listActiveBusinesses() : []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader label="Espace client" userName={user.name ?? user.email} homeHref="/" />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8 md:py-12">
        <aside className="md:w-56 md:shrink-0">
          <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 md:flex-col">
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
          {active === 'favoris' && (
            <>
              <h1 className="font-display text-3xl font-bold">Mes favoris</h1>
              {favorites.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Aucun favori.{' '}
                  <Link href="/espace-client?tab=decouvrir" className="font-semibold text-terracotta">
                    Explore les offres du moment
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {favorites.map((f) => (
                    <Card
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
          )}

          {active === 'decouvrir' && (
            <>
              <h1 className="font-display text-3xl font-bold">Les offres du moment</h1>
              <p className="mt-1 text-sm text-muted-foreground">Restaurants et cafés validés sur Blayes.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {allActive.map((b) => (
                  <Card
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
          )}

          {active === 'historique' && (
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

              {recommended.length > 0 && (
                <>
                  <h2 className="mt-10 font-display text-xl font-bold">Recommandé pour toi</h2>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    {recommended.map((b) => (
                      <Card
                        key={b.id}
                        businessId={b.id}
                        slug={b.slug}
                        name={b.name}
                        meta={`${CATEGORY_LABELS[b.category]} · ${b.city}`}
                        image={b.photos[0]?.url}
                        favorited={false}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {active === 'profil' && (
            <div className="max-w-xl rounded-2xl border border-border bg-card p-6">
              <h1 className="font-display text-3xl font-bold">Mon profil</h1>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Nom</dt>
                  <dd className="font-semibold">{user.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-semibold">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Membre depuis</dt>
                  <dd className="font-semibold">
                    {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(user.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Card({
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
        <Link href={`/commerce/${slug}`} className="mt-3 inline-flex text-sm font-semibold text-terracotta">
          Voir la fiche →
        </Link>
      </div>
    </article>
  )
}
