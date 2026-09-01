import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight, Coffee, MapPin, Sparkles, Utensils } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { HeroSearch } from '@/components/home/hero-search'
import { FavoriteButton } from '@/components/home/favorite-button'
import { SponsoredPlacement } from '@/components/sponsored-card'
import { OfferCard } from '@/components/offers/offer-card'
import { listActiveBusinesses, listActiveOffers } from '@/lib/queries'
import { toUiBusiness } from '@/lib/business-ui'

const categories = [
  {
    name: 'Restauration',
    href: '/restauration',
    icon: Utensils,
    color: 'bg-terracotta/12 text-terracotta',
  },
  {
    name: 'Cafés & salons de thé',
    href: '/recherche?category=Caf%C3%A9s%20%26%20salons%20de%20th%C3%A9',
    icon: Coffee,
    color: 'bg-olive/12 text-olive',
  },
]

export const revalidate = 300

export default async function HomePage() {
  const [rows, offers] = await Promise.all([listActiveBusinesses(), listActiveOffers(3)])
  const selection = rows.slice(0, 8).map(toUiBusiness)

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-16">
        <div className="max-w-2xl">
          <p className="mb-7 inline-flex items-center gap-2 rounded-full bg-olive/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-olive">
            <Sparkles className="size-3.5" /> Le guide local qui a du goût
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
            Trouve les meilleurs <span className="text-terracotta">bons plans</span> près de chez toi.
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            Blayes regroupe les restaurants et les cafés / salons de thé de Tunisie sur une seule
            plateforme. Des petits commerces, de grandes histoires, juste à côté.
          </p>
          <HeroSearch />
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:justify-self-end">
          <div className="absolute -left-5 top-10 z-10 hidden rounded-2xl bg-card px-4 py-3 shadow-lg sm:block">
            <p className="text-xs font-semibold text-foreground">Aujourd’hui à Tunis</p>
            <p className="mt-1 text-xs text-muted-foreground">24° · 128 adresses à découvrir</p>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-[2rem] rounded-bl-[5rem] bg-ochre/20">
            <Image
              src="/images/hero-market.png"
              alt="Rue commerçante animée à Tunis"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-2xl bg-foreground/85 px-4 py-3 text-sand backdrop-blur-sm">
              <div>
                <p className="text-xs text-sand/60">Le spot du moment</p>
                <p className="mt-0.5 text-sm font-semibold">Sidi Bou Saïd, côté local</p>
              </div>
              <ArrowRight className="size-5 text-ochre" />
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="bg-olive px-5 py-14 text-sand lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">À toi de choisir</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Qu’est-ce qui te tente ?
              </h2>
            </div>
            <Link
              href="#selection"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ochre hover:text-sand"
            >
              Tout explorer <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {categories.map(({ name, href, icon: Icon, color }) => (
              <Link
                key={name}
                href={href}
                className="group flex items-center gap-3 rounded-2xl bg-sand/10 p-4 transition-colors hover:bg-sand hover:text-foreground sm:p-5"
              >
                <span className={`flex size-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{name}</span>
                <ChevronRight className="ml-auto size-4 opacity-50 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section id="bons-plans" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Réservé aux membres</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Les bons plans du moment.
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Crée ton compte gratuit, récupère le bon plan et présente ton code au comptoir.
              </p>
            </div>
            <Link
              href="/inscription-client"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              En profiter <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {offers.map((o) => (
              <OfferCard
                key={o.id}
                title={o.title}
                discountLabel={o.discountLabel}
                description={o.description}
                businessName={o.business.name}
                businessSlug={o.business.slug}
                businessCity={o.business.city}
                action={
                  <Link href={`/commerce/${o.business.slug}`} className="text-sm font-semibold text-terracotta hover:underline">
                    Voir la fiche →
                  </Link>
                }
              />
            ))}
          </div>
        </section>
      )}

      <SponsoredPlacement />

      <section id="selection" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Sélection Blayes</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Les adresses à ne pas rater.
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-terracotta" /> Tunis & alentours
          </div>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {selection.map((business) => (
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
                <FavoriteButton businessName={business.name} />
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
          ))}
        </div>
      </section>

      <section
        id="inscrire"
        className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-terracotta px-6 py-10 text-primary-foreground sm:px-10 lg:mx-auto lg:max-w-7xl lg:py-12"
      >
        <div className="flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/60">
              Tu as une adresse à partager ?
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Fais partie de la carte.</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-primary-foreground/75">
              Rejoins les commerces qui donnent vie à nos quartiers grâce à un abonnement annuel.
            </p>
          </div>
          <Link
            href="/tarifs"
            className="rounded-full bg-sand px-6 py-3.5 text-sm font-bold text-terracotta transition-transform hover:-translate-y-0.5"
          >
            Inscrire mon commerce <ArrowRight className="ml-2 inline size-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
