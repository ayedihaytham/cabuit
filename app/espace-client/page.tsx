'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { Bell, Heart, History, LogOut, MapPin, Pencil, UserRound } from 'lucide-react'
import { Logo } from '@/components/layout/logo'

const TABS = [
  { id: 'favoris', label: 'Mes favoris', icon: Heart },
  { id: 'historique', label: 'Historique', icon: History },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'recommande', label: 'Recommandé pour toi', icon: MapPin },
  { id: 'profil', label: 'Mon profil', icon: UserRound },
] as const

type TabId = (typeof TABS)[number]['id']

const PLACES = [
  { slug: 'le-petit-souk', name: 'Le Petit Souk', category: 'Restauration', district: 'La Marsa', image: '/images/petit-souk-interior.png' },
  { slug: 'cafe-panorama', name: 'Café Panorama', category: 'Cafés & salons de thé', district: 'La Marsa', image: '/images/cafe.png' },
]

export default function EspaceClientPage() {
  const [active, setActive] = useState<TabId>('favoris')
  const [favorites, setFavorites] = useState(PLACES.map((place) => place.slug))
  const [unread, setUnread] = useState([true, true])
  const [preferences, setPreferences] = useState({ news: true, promos: true })

  const activeTab = TABS.find((tab) => tab.id === active)
  const removeFavorite = (slug: string) =>
    setFavorites((current) => current.filter((favorite) => favorite !== slug))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 px-5 py-5 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Logo className="text-terracotta" tone="terracotta" />
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Espace client
            </p>
            <p className="text-sm font-medium">Bonjour, Amira</p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:flex-row md:px-10 md:py-12">
        <aside className="md:w-64 md:shrink-0">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="mb-4 rounded-xl bg-terracotta/10 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">Ton espace</p>
              <p className="mt-1 font-display text-xl font-bold">Mes découvertes</p>
            </div>
            <nav className="flex gap-2 overflow-x-auto md:flex-col" aria-label="Navigation client">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActive(id)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                    active === id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-8">
            <p className="text-sm font-semibold text-terracotta">Espace personnel</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
              {activeTab?.label}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Retrouve ici les commerces que tu aimes et les nouveautés sélectionnées pour toi.
            </p>
          </div>

          {active === 'favoris' && (
            <div className="grid gap-5 sm:grid-cols-2">
              {PLACES.filter((place) => favorites.includes(place.slug)).map((place) => (
                <article
                  key={place.slug}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <div className="relative h-40 bg-secondary">
                    <Image src={place.image} alt={place.name} fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFavorite(place.slug)}
                      aria-label={`Retirer ${place.name} des favoris`}
                      className="absolute right-3 top-3 rounded-full bg-card p-2 text-terracotta shadow-sm"
                    >
                      <Heart className="size-4 fill-current" />
                    </button>
                  </div>
                  <div className="p-5">
                    <Link
                      href={`/commerce/${place.slug}`}
                      className="font-display text-xl font-bold hover:text-terracotta"
                    >
                      {place.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {place.category} · {place.district}
                    </p>
                    <Link
                      href={`/commerce/${place.slug}`}
                      className="mt-5 inline-flex text-sm font-semibold text-terracotta"
                    >
                      Voir la fiche →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {active === 'historique' && (
            <div className="space-y-6">
              {[
                ['Aujourd’hui', ['Le Petit Souk', 'Café Panorama']],
                ['Cette semaine', ['Salon El Bahia']],
                ['Plus ancien', ['Dar Zarrouk']],
              ].map(([group, names]) => (
                <div key={group as string}>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {group as string}
                  </h2>
                  <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                    {(names as string[]).map((name) => (
                      <div
                        key={name}
                        className="flex items-center justify-between px-5 py-4 text-sm font-semibold"
                      >
                        <span>{name}</span>
                        <span className="text-xs text-muted-foreground">Consulté</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-bold">Tes notifications</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reste au courant des nouveautés locales.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnread([])}
                    className="text-sm font-semibold text-terracotta"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
                <div className="mt-5 divide-y divide-border">
                  {['Le Petit Souk a ajouté un nouveau plat', 'Promo chez Café Panorama ce week-end'].map(
                    (message, index) => (
                      <button
                        key={message}
                        type="button"
                        onClick={() => setUnread((current) => current.filter((_, item) => item !== index))}
                        className="flex w-full items-start gap-3 py-4 text-left"
                      >
                        <span
                          className={`mt-1 size-2 shrink-0 rounded-full ${unread[index] ? 'bg-terracotta' : 'bg-border'}`}
                        />
                        <span className="text-sm">{message}</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-xl font-bold">Préférences</h2>
                {(
                  [
                    ['Nouveautés', 'news'],
                    ['Promotions', 'promos'],
                  ] as const
                ).map(([label, key]) => (
                  <label
                    key={key}
                    className="mt-4 flex items-center justify-between gap-4 text-sm font-semibold"
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={preferences[key]}
                      onChange={(event) =>
                        setPreferences((current) => ({ ...current, [key]: event.target.checked }))
                      }
                      className="size-4 accent-terracotta"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {active === 'recommande' && (
            <div className="grid gap-5 sm:grid-cols-2">
              {PLACES.map((place) => (
                <article key={place.slug} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-olive">
                    Parce que tu aimes Café Panorama
                  </p>
                  <Link
                    href={`/commerce/${place.slug}`}
                    className="mt-3 block font-display text-xl font-bold hover:text-terracotta"
                  >
                    {place.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {place.category} · {place.district}
                  </p>
                  <Link
                    href={`/commerce/${place.slug}`}
                    className="mt-5 inline-flex text-sm font-semibold text-terracotta"
                  >
                    Découvrir →
                  </Link>
                </article>
              ))}
            </div>
          )}

          {active === 'profil' && (
            <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Compte personnel
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold">Amira Ben Salem</h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  <Pencil className="size-4" /> Modifier
                </button>
              </div>
              <dl className="mt-8 space-y-5 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1 font-semibold">amira@blayes.tn</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Téléphone</dt>
                  <dd className="mt-1 font-semibold">+216 71 742 890</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/connexion-client' })}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background"
              >
                <LogOut className="size-4" /> Se déconnecter
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
