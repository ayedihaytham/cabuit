import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, MapPin, Megaphone, Star } from 'lucide-react'
import { getBusiness } from '@/lib/data/businesses'

/** Commerce mis en avant du jour (démo). */
const SPONSORED_SLUG = 'le-petit-souk'
const HAS_ACTIVE_RESERVATION = true

export function SponsoredCard({ compact = false }: { compact?: boolean }) {
  const business = getBusiness(SPONSORED_SLUG)
  if (!business) return null

  return (
    <Link
      href={`/commerce/${business.slug}`}
      aria-label={`Voir la fiche de ${business.name}, espace sponsorisé`}
      className={`group block overflow-hidden rounded-2xl border border-terracotta/45 bg-card shadow-[0_14px_36px_rgba(175,73,48,0.14)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(175,73,48,0.22)] ${compact ? 'max-w-md' : ''}`}
    >
      <div className={`relative ${compact ? 'h-36' : 'h-48 sm:h-56'}`}>
        <Image
          src={business.image}
          alt={business.name}
          fill
          sizes="(max-width: 768px) 100vw, 28rem"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-terracotta px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
          <Megaphone className="size-3" /> Sponsorisé
        </span>
        <span className="absolute bottom-3 left-4 font-display text-xl text-white">{business.name}</span>
        <ArrowUpRight className="absolute bottom-3 right-4 size-5 text-ochre" />
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{business.description.split('.')[0]}.</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-terracotta" /> {business.city} · {business.category}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ochre">
          <Star className="size-3.5 fill-current" /> {business.rating.toLocaleString('fr-FR')}
        </span>
      </div>
    </Link>
  )
}

export function SponsoredPlacement() {
  if (!HAS_ACTIVE_RESERVATION) return <SponsoredFallback />

  return (
    <section id="sponsorise" className="bg-terracotta/[0.08] px-5 py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Visibilité transparente</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Nos coups de cœur du jour.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Un espace réservé par un commerce local. Le badge Sponsorisé te permet de le reconnaître
              au premier coup d’œil.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-terracotta/25 bg-background px-3 py-2 text-xs font-semibold text-terracotta">
            <Megaphone className="size-3.5" /> 1 espace actif aujourd’hui
          </span>
        </div>
        <div className="mt-8">
          <SponsoredCard compact />
        </div>
      </div>
    </section>
  )
}

export function SponsoredFallback() {
  return (
    <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      Aucun espace sponsorisé réservé aujourd’hui. Découvre les bonnes adresses sélectionnées par Blayes.
    </p>
  )
}

export default SponsoredCard
