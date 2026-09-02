import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { Stars } from '@/components/ui/stars'
import { ReviewForm } from '@/components/business/review-form'
import { getBusiness } from '@/lib/data/businesses'
import {
  PETIT_SOUK_RATING_DISTRIBUTION,
  PETIT_SOUK_REVIEWS,
} from '@/lib/data/petit-souk'

export const metadata: Metadata = {
  title: 'Avis clients · Le Petit Souk',
  description: 'Les expériences de la communauté Winou au Petit Souk, à La Marsa.',
}

export default function AvisPage() {
  const business = getBusiness('le-petit-souk')
  const average = business?.rating ?? 4.6
  const total = business?.reviewCount ?? 86

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-sand px-5 py-5 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/restauration/le-petit-souk"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta"
          >
            <ArrowLeft className="size-4" /> Le Petit Souk
          </Link>
          <Logo />
          <span className="hidden text-xs font-semibold text-muted-foreground sm:block">Avis clients</span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Le Petit Souk · La Marsa</p>
            <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
              Ce qu’en disent nos clients
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Une table généreuse qui se partage. Découvrez les expériences de la communauté Winou.
            </p>
          </div>
          <ReviewForm />
        </div>

        <div className="mt-10 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[12rem_1fr] sm:p-8">
          <div className="border-b border-border pb-5 sm:border-b-0 sm:border-r sm:pb-0">
            <p className="font-display text-6xl font-bold">{average.toLocaleString('fr-FR')}</p>
            <div className="mt-2">
              <Stars rating={Math.round(average)} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{total} avis au total</p>
          </div>
          <div className="flex flex-col gap-2 sm:pl-8">
            {PETIT_SOUK_RATING_DISTRIBUTION.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 text-muted-foreground">{item.stars}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-ochre" style={{ width: item.width }} />
                </div>
                <span className="w-7 text-right text-muted-foreground/70">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {PETIT_SOUK_REVIEWS.map((review) => (
            <article key={review.author} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-ochre/30 font-display font-bold text-foreground">
                    {review.author.slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="font-semibold">{review.author}</h2>
                    <p className="text-xs text-muted-foreground/70">{review.date}</p>
                  </div>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{review.text}</p>
              {review.reply && (
                <div className="mt-4 rounded-xl bg-secondary/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-olive">
                    Réponse du commerçant
                  </p>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">{review.reply}</p>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-terracotta hover:text-terracotta"
          >
            Voir plus d’avis <ChevronDown className="size-4" />
          </button>
        </div>
      </section>
    </div>
  )
}
