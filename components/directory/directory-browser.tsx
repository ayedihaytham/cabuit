'use client'

import { useMemo, useState } from 'react'
import { Filter, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import { BusinessCard } from '@/components/directory/business-card'
import { CATEGORIES, CITIES, SORT_OPTIONS } from '@/lib/constants'
import type { Business, Category } from '@/lib/types'

type DirectoryBrowserProps = {
  /** Établissements à parcourir (déjà chargés depuis la base). */
  businesses: Business[]
  /** Restreint la recherche à une catégorie et masque le filtre catégorie. */
  lockedCategory?: Category
  initialQuery?: string
  initialCategory?: Category
  showDescription?: boolean
}

const ALL_CATEGORIES = 'Toutes les catégories'
const ALL_CITIES = 'Toutes les zones'

export function DirectoryBrowser({
  businesses,
  lockedCategory,
  initialQuery = '',
  initialCategory,
  showDescription = false,
}: DirectoryBrowserProps) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<string>(initialCategory ?? ALL_CATEGORIES)
  const [city, setCity] = useState<string>(ALL_CITIES)
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>('Pertinence')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    const activeCategory = lockedCategory ?? (category === ALL_CATEGORIES ? null : category)

    const filtered = businesses.filter((b) => {
      const matchesTerm =
        !term ||
        [b.name, b.category, b.type, b.city].some((v) => v.toLowerCase().includes(term))
      const matchesCategory = !activeCategory || b.category === activeCategory
      const matchesCity = city === ALL_CITIES || b.city === city
      const matchesVerified = !verifiedOnly || b.verified
      return matchesTerm && matchesCategory && matchesCity && matchesVerified
    })

    if (sort === 'Note') return [...filtered].sort((a, b) => b.rating - a.rating)
    if (sort === 'Nouveauté') return [...filtered].reverse()
    if (sort === 'Proximité') return [...filtered].sort((a, b) => a.city.localeCompare(b.city))
    return filtered
  }, [businesses, query, category, city, verifiedOnly, sort, lockedCategory])

  const resetFilters = () => {
    setQuery('')
    setCategory(ALL_CATEGORIES)
    setCity(ALL_CITIES)
    setSort('Pertinence')
    setVerifiedOnly(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold lg:hidden"
      >
        <Filter className="size-4 text-terracotta" /> Filtres avancés
      </button>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside
          className={`${filtersOpen ? 'block' : 'hidden'} h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-5 lg:block`}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Affiner</h2>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-terracotta hover:underline"
            >
              Réinitialiser
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-5">
            {!lockedCategory && (
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Catégorie
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-3 text-sm font-normal outline-none focus:border-terracotta"
                >
                  <option>{ALL_CATEGORIES}</option>
                  {CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Zone
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-3 text-sm font-normal outline-none focus:border-terracotta"
              >
                <option>{ALL_CITIES}</option>
                {CITIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-xl bg-olive/10 p-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="size-4 accent-terracotta"
              />
              Vérifié uniquement
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="size-4 text-olive" /> Trier par
              </span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as (typeof SORT_OPTIONS)[number])}
                className="rounded-xl border border-border bg-background px-3 py-3 text-sm font-normal outline-none focus:border-terracotta"
              >
                {SORT_OPTIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
        </aside>

        <section>
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 focus-within:border-terracotta/50">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un commerce, une catégorie…"
              aria-label="Rechercher un commerce"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche">
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="mb-6 flex items-end justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{results.length}</span> commerce
              {results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
            </p>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <MapPin className="size-3.5 text-terracotta" /> Grand Tunis
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((business) => (
                <BusinessCard key={business.slug} business={business} showDescription={showDescription} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <Search className="mx-auto size-8 text-terracotta" />
              <h2 className="mt-4 font-display text-2xl font-bold">Aucun commerce trouvé</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Essaie d’élargir ta recherche ou retire un filtre pour découvrir plus d’adresses.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Voir tous les commerces
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
