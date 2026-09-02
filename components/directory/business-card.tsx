import Link from 'next/link'
import { Check, MapPin, Star } from 'lucide-react'
import { Cover } from '@/components/ui/cover'
import type { Business } from '@/lib/types'

type BusinessCardProps = {
  business: Business
  showDescription?: boolean
  /** À activer uniquement pour les cartes au-dessus de la ligne de flottaison. */
  priority?: boolean
}

export function BusinessCard({ business, showDescription = false, priority = false }: BusinessCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_14px_36px_rgba(53,41,30,0.12)]">
      <Link href={`/commerce/${business.slug}`} className="block">
        <div className="relative aspect-[1.4] overflow-hidden">
          <Cover
            src={business.image}
            alt={business.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={priority}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          {business.verified && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-olive">
              <Check className="size-3" /> Vérifié
            </span>
          )}
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-terracotta">{business.type}</p>
          <h3 className="mt-2 font-display text-xl font-bold text-foreground">{business.name}</h3>

          {showDescription && (
            <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{business.description}</p>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-terracotta" /> {business.city}
          </div>

          <div className="mt-4 flex items-center gap-1 text-sm">
            <Star className="size-4 fill-ochre text-ochre" />
            <span className="font-bold">{business.rating.toLocaleString('fr-FR')}</span>
            <span className="text-xs text-muted-foreground">({business.reviewCount} avis)</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
