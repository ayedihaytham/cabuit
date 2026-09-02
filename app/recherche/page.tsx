import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { DirectoryBrowser } from '@/components/directory/directory-browser'
import { RegionPicker } from '@/components/region/region-picker'
import { listActiveBusinesses } from '@/lib/queries'
import { toUiBusiness } from '@/lib/business-ui'
import { db } from '@/lib/db'
import { CATEGORIES } from '@/lib/constants'
import { getPreferredRegion } from '@/lib/region-prefs'
import { governorateLabel } from '@/lib/regions'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Rechercher un commerce',
  description:
    'Restaurants et cafés / salons de thé sélectionnés dans les quartiers du Grand Tunis.',
}

type SearchParams = { [key: string]: string | string[] | undefined }

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const query = first(params.q)
  const categoryParam = first(params.category)
  const initialCategory = CATEGORIES.find((category) => category === categoryParam) as
    | Category
    | undefined

  const region = await getPreferredRegion()
  const regionLabel = governorateLabel(region)
  const rows = await listActiveBusinesses({ region: region ?? undefined })
  const businesses = rows.map(toUiBusiness)

  // Log léger de la recherche (argument de confiance côté commerçant).
  if (query.trim()) {
    db.event.create({ data: { type: 'SEARCH', query: query.trim() } }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader slot={<RegionPicker current={region} currentLabel={regionLabel} />} />

      <section className="bg-olive px-5 py-10 text-sand lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ochre">
            Le guide local · {regionLabel ?? 'toute la Tunisie'}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            Trouve ton prochain <span className="text-ochre">coup de cœur.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-sand/70">
            Restaurants et cafés / salons de thé
            {regionLabel ? ` à ${regionLabel}` : ' partout en Tunisie'}.
          </p>
        </div>
      </section>

      <DirectoryBrowser
        businesses={businesses}
        initialQuery={query}
        initialCategory={initialCategory}
        showDescription
      />

      <SiteFooter />
    </div>
  )
}
