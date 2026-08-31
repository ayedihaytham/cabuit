import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
  Utensils,
} from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { SiteFooter } from '@/components/layout/site-footer'
import { FavoriteToggle } from '@/components/business/favorite-toggle'
import { MenuAccordion } from '@/components/business/menu-accordion'
import { getBusiness, getBusinessesByCategory } from '@/lib/data/businesses'
import { PETIT_SOUK_GALLERY, PETIT_SOUK_MENU } from '@/lib/data/petit-souk'

const SLUG = 'le-petit-souk'

export function generateMetadata(): Metadata {
  const business = getBusiness(SLUG)
  return {
    title: business?.name ?? 'Fiche commerce',
    description: business?.description,
  }
}

export default function PetitSoukPage() {
  const business = getBusiness(SLUG)
  if (!business) notFound()

  const similar = getBusinessesByCategory('Restauration')
    .filter((item) => item.slug !== SLUG)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-sand/95 px-5 py-5 backdrop-blur-sm lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/restauration"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-terracotta"
          >
            <ArrowLeft className="size-4" /> Restauration
          </Link>
          <Logo />
          <div className="flex items-center gap-2">
            <FavoriteToggle businessName={business.name} />
            <button
              type="button"
              className="hidden size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-terracotta hover:text-terracotta sm:flex"
              aria-label="Partager"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-6 lg:px-8 lg:pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-foreground">
          <Image
            src="/images/petit-souk-interior.png"
            alt={`${business.name}, restaurant tunisien`}
            width={1600}
            height={720}
            priority
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="h-64 w-full object-cover opacity-85 sm:h-80 lg:h-[27rem]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-end gap-4 sm:bottom-8 sm:left-8">
            <div className="flex size-16 items-center justify-center rounded-2xl border-4 border-sand bg-terracotta font-display text-2xl font-bold text-primary-foreground shadow-lg sm:size-20 sm:text-3xl">
              PS
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-ochre">
                {business.type} · {business.city}
              </p>
              <h1 className="font-display text-3xl font-bold text-sand sm:text-5xl">{business.name}</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 lg:py-12">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {business.verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-olive px-3 py-1.5 text-xs font-bold text-sand">
                  <Check className="size-3.5" /> Vérifié
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-terracotta" /> {business.address}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-ochre text-ochre" /> {business.rating.toLocaleString('fr-FR')}{' '}
                <span className="text-muted-foreground/70">({business.reviewCount} avis)</span>
              </span>
            </div>

            <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground">{business.description}</p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-3.5 text-olive" /> Ouvert aujourd’hui · 12:00–23:00
              </span>
              <span className="inline-flex items-center gap-2">
                <Utensils className="size-3.5 text-olive" /> Sur place · À emporter
              </span>
            </div>

            <div className="mt-10">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="eyebrow">Un aperçu de la maison</p>
                  <h2 className="mt-2 font-display text-3xl font-bold">Dans les coulisses</h2>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {PETIT_SOUK_GALLERY.length} photos
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PETIT_SOUK_GALLERY.map((image, index) => (
                  <div
                    key={image.src}
                    className={`relative aspect-square overflow-hidden rounded-xl ${
                      index === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-12 border-t border-border pt-10">
              <p className="eyebrow">À la carte</p>
              <div className="mt-2 flex items-end justify-between">
                <h2 className="font-display text-3xl font-bold">Le menu</h2>
                <span className="text-xs text-muted-foreground">Prix en dinars</span>
              </div>
              <MenuAccordion sections={PETIT_SOUK_MENU} />
            </section>

            <div className="mt-10">
              <Link
                href={`/restauration/${SLUG}/avis`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:underline"
              >
                Voir tous les avis <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_34px_rgba(53,41,30,0.08)]">
              <p className="eyebrow">Envie d’une table ?</p>
              <h2 className="mt-2 font-display text-2xl font-bold">On se retrouve au Souk.</h2>
              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 rounded-xl bg-foreground px-4 py-3.5 text-sm font-semibold text-sand transition-colors hover:bg-terracotta"
                >
                  <Phone className="size-4" /> Appeler le restaurant
                </a>
                <a
                  href={`https://wa.me/${business.whatsapp}`}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-sm font-semibold transition-colors hover:border-olive hover:text-olive"
                >
                  <MessageCircle className="size-4 text-olive" /> Écrire sur WhatsApp
                </a>
              </div>
              <div className="mt-5 flex items-center gap-4 border-t border-border pt-5 text-muted-foreground">
                <a href="https://instagram.com" className="text-sm font-bold hover:text-terracotta">
                  ig
                </a>
                <span className="text-xs">{business.instagram}</span>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative h-44 bg-secondary">
                <iframe
                  title={`Carte de localisation de ${business.name}`}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=10.315%2C36.875%2C10.335%2C36.89&layer=mapnik&marker=36.882%2C10.325"
                  className="size-full border-0 grayscale-[.15]"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-2 p-4 text-sm font-semibold">
                <MapPin className="size-4 text-terracotta" /> {business.city}
                <ArrowRight className="ml-auto size-4 text-muted-foreground/60" />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/45 px-5 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">À proximité</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Vous aimerez aussi</h2>
            </div>
            <Link
              href="/restauration"
              className="hidden items-center gap-2 text-sm font-semibold text-terracotta sm:flex"
            >
              Tout voir <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {similar.map((item) => (
              <Link
                key={item.slug}
                href={`/commerce/${item.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[1.6] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-terracotta">{item.type}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{item.name}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {item.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
