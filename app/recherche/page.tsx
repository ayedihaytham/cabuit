import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { DirectoryFilters } from '@/components/directory/directory-filters'
import { BusinessCard } from '@/components/directory/business-card'
import { Pager } from '@/components/directory/pager'
import { RegionPicker } from '@/components/region/region-picker'
import { searchBusinesses, type BusinessSort } from '@/lib/queries'
import { toUiBusiness } from '@/lib/business-ui'
import { db } from '@/lib/db'
import { getPreferredRegion } from '@/lib/region-prefs'
import { governorateLabel } from '@/lib/regions'
import type { Category } from '@prisma/client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Rechercher un commerce',
  description: 'Restaurants et cafés / salons de thé sélectionnés partout en Tunisie.',
}

type SP = Record<string, string | undefined>
const SORTS: BusinessSort[] = ['pertinence', 'note', 'nouveaute', 'nom']

export default async function RecherchePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const prefRegion = await getPreferredRegion()

  const category = sp.category === 'RESTAURANT' || sp.category === 'CAFE' ? (sp.category as Category) : undefined
  const region = sp.region || prefRegion || undefined
  const sort = (SORTS.includes(sp.tri as BusinessSort) ? sp.tri : 'pertinence') as BusinessSort
  const page = Number(sp.page) || 1

  const { rows, total, pageCount } = await searchBusinesses({
    query: sp.q,
    category,
    region,
    city: sp.ville || undefined,
    verifiedOnly: sp.verifie === '1',
    sort,
    page,
  })

  if (sp.q?.trim()) {
    db.event.create({ data: { type: 'SEARCH', query: sp.q.trim() } }).catch(() => {})
  }

  const businesses = rows.map(toUiBusiness)
  const regionLabel = governorateLabel(region)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader slot={<RegionPicker current={prefRegion} currentLabel={governorateLabel(prefRegion)} />} />

      <section className="bg-olive px-5 py-10 text-sand lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ochre">
            Le guide local · {regionLabel ?? 'toute la Tunisie'}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            Trouve ton prochain <span className="text-ochre">coup de cœur.</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <DirectoryFilters />

        <p className="mb-6 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{total}</span> commerce{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
        </p>

        {businesses.length > 0 ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {businesses.map((b) => (
                <BusinessCard key={b.slug} business={b} showDescription />
              ))}
            </div>
            <Pager
              page={page}
              pageCount={pageCount}
              basePath="/recherche"
              params={{
                q: sp.q,
                category: sp.category,
                region: sp.region,
                ville: sp.ville,
                verifie: sp.verifie,
                tri: sp.tri,
              }}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold">Aucun commerce trouvé</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Élargis ta recherche ou retire un filtre.
            </p>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}
