'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin } from 'lucide-react'
import type { Business } from '@/lib/types'

export function HomeSelection({ businesses }: { businesses: Business[] }) {
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<string[]>([])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return businesses
    return businesses.filter((business) =>
      [business.name, business.category, business.city].some((value) =>
        value.toLowerCase().includes(term),
      ),
    )
  }, [businesses, query])

  const toggleSaved = (slug: string) =>
    setSaved((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    )

  return (
    <>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filtrer la sélection…"
        aria-label="Filtrer la sélection"
        className="mt-8 w-full max-w-sm rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-terracotta/50"
      />

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((business) => {
          const isSaved = saved.includes(business.slug)
          return (
            <article
              key={business.slug}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_14px_36px_rgba(53,41,30,0.12)]"
            >
              <div className="relative aspect-[1.15] overflow-hidden">
                <Image
                  src={business.image}
                  alt={business.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {business.tag && (
                  <span className="absolute left-3 top-3 rounded-full bg-sand px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                    {business.tag}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleSaved(business.slug)}
                  aria-label={
                    isSaved ? `Retirer ${business.name} des favoris` : `Ajouter ${business.name} aux favoris`
                  }
                  className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground transition-colors hover:text-terracotta"
                >
                  <Heart className={`size-4 ${isSaved ? 'fill-terracotta text-terracotta' : ''}`} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/commerce/${business.slug}`}>
                      <h3 className="font-display text-lg font-bold text-foreground">{business.name}</h3>
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{business.category}</p>
                  </div>
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-olive" aria-label="Ouvert" />
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-terracotta" /> {business.city}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Aucune adresse ne correspond à ta recherche. Essaie une autre ville ou catégorie.
        </p>
      )}
    </>
  )
}
