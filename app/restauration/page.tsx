import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Utensils } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { DirectoryFilters } from '@/components/directory/directory-filters'
import { BusinessCard } from '@/components/directory/business-card'
import { Pager } from '@/components/directory/pager'
import { RegionPicker } from '@/components/region/region-picker'
import { searchBusinesses, type BusinessSort } from '@/lib/queries'
import { toUiBusiness } from '@/lib/business-ui'
import { getPreferredRegion } from '@/lib/region-prefs'
import { governorateLabel } from '@/lib/regions'

export const metadata: Metadata = {
  title: 'Restauration',
  description:
    'Les restaurants tunisiens sélectionnés par Winou pour leur goût, leur accueil et ce petit quelque chose qui donne envie de revenir.',
}

export const dynamic = 'force-dynamic'

type SP = Record<string, string | undefined>
const SORTS: BusinessSort[] = ['pertinence', 'note', 'nouveaute', 'nom']

export default async function RestaurationPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const prefRegion = await getPreferredRegion()
  const region = sp.region || prefRegion || undefined
  const sort = (SORTS.includes(sp.tri as BusinessSort) ? sp.tri : 'pertinence') as BusinessSort
  const page = Number(sp.page) || 1

  const { rows, total, pageCount } = await searchBusinesses({
    query: sp.q,
    category: 'RESTAURANT',
    region,
    verifiedOnly: sp.verifie === '1',
    sort,
    page,
  })
  const businesses = rows.map(toUiBusiness)
  const regionLabel = governorateLabel(region)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader slot={<RegionPicker current={prefRegion} currentLabel={governorateLabel(prefRegion)} />} />

      <section className="border-b border-border bg-olive px-5 py-10 text-sand lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/#categories"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sand/65 hover:text-ochre"
          >
            <ArrowLeft className="size-3.5" /> Explorer toutes les catégories
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ochre">
            {regionLabel ?? 'Toute la Tunisie'} · {total} adresse{total > 1 ? 's' : ''}
          </p>
          <h1 className="mt-3 flex items-center gap-3 font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Les tables qui font <span className="text-ochre">du bien.</span>
            <Utensils className="hidden size-8 text-ochre/60 lg:block" />
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <DirectoryFilters lockCategory />

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
              basePath="/restauration"
              params={{ q: sp.q, region: sp.region, ville: sp.ville, verifie: sp.verifie, tri: sp.tri }}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold">Aucun restaurant trouvé</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Élargis ta recherche ou change de zone.
            </p>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}
