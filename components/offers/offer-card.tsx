import Link from 'next/link'
import type { ReactNode } from 'react'
import { Tag } from 'lucide-react'

type OfferCardProps = {
  title: string
  discountLabel: string
  description: string
  conditions?: string | null
  validUntil?: Date | null
  businessName?: string
  businessSlug?: string
  businessCity?: string
  action?: ReactNode
}

export function OfferCard({
  title,
  discountLabel,
  description,
  conditions,
  validUntil,
  businessName,
  businessSlug,
  businessCity,
  action,
}: OfferCardProps) {
  return (
    <article className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[0_2px_14px_rgba(53,41,30,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/30 hover:shadow-[0_18px_44px_rgba(175,73,48,0.14)]">
      {/* Filet d'accent */}
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-terracotta via-ochre to-terracotta opacity-70" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {businessName && (
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {businessSlug ? (
                <Link href={`/commerce/${businessSlug}`} className="hover:text-terracotta">
                  {businessName}
                </Link>
              ) : (
                businessName
              )}
              {businessCity ? ` · ${businessCity}` : ''}
            </p>
          )}
          <h3 className="mt-1 font-display text-xl font-bold leading-tight text-foreground">{title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-terracotta px-3 py-1 font-display text-sm font-extrabold text-primary-foreground shadow-[0_6px_16px_rgba(175,73,48,0.28)]">
          {discountLabel}
        </span>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">{description}</p>

      {(conditions || validUntil) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
          {conditions && (
            <span className="inline-flex items-center gap-1">
              <Tag className="size-3" /> {conditions}
            </span>
          )}
          {validUntil && (
            <span>
              Jusqu’au{' '}
              {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(validUntil)}
            </span>
          )}
        </div>
      )}

      {action && <div className="mt-auto pt-1">{action}</div>}
    </article>
  )
}
