import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Utensils } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { DirectoryBrowser } from '@/components/directory/directory-browser'
import { listActiveBusinesses } from '@/lib/queries'
import { toUiBusiness } from '@/lib/business-ui'

export const metadata: Metadata = {
  title: 'Restauration',
  description:
    'Les restaurants tunisiens sélectionnés par Blayes pour leur goût, leur accueil et ce petit quelque chose qui donne envie de revenir.',
}

export const revalidate = 300

export default async function RestaurationPage() {
  const rows = await listActiveBusinesses({ category: 'RESTAURANT' })
  const businesses = rows.map(toUiBusiness)
  const count = businesses.length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-border bg-olive px-5 py-10 text-sand lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <Link
                href="/#categories"
                className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sand/65 hover:text-ochre"
              >
                <ArrowLeft className="size-3.5" /> Explorer toutes les catégories
              </Link>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ochre">
                Catégorie · {count} adresses
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Les tables qui font <span className="text-ochre">du bien.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-sand/70 sm:text-base">
                Des restaurants tunisiens sélectionnés pour leur goût, leur accueil et ce petit
                quelque chose qui donne envie de revenir.
              </p>
            </div>
            <div className="hidden size-24 items-center justify-center rounded-full border border-ochre/40 text-ochre lg:flex">
              <Utensils className="size-9" />
            </div>
          </div>
        </div>
      </section>

      <DirectoryBrowser businesses={businesses} lockedCategory="Restauration" showDescription />

      <SiteFooter />
    </div>
  )
}
