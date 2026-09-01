import Link from 'next/link'
import type { ReactNode } from 'react'
import { Sparkles, Tag } from 'lucide-react'

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
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-terracotta/15 bg-card shadow-[0_2px_14px_rgba(53,41,30,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/35 hover:shadow-[0_18px_44px_rgba(175,73,48,0.16)]">
      {/* Bandeau ticket */}
      <div className="flex items-stretch">
        <div className="min-w-0 flex-1 p-5">
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

        {/* Souche du ticket */}
        <div className="relative flex w-24 shrink-0 flex-col items-center justify-center border-l border-dashed border-terracotta/40 bg-terracotta/[0.06] px-2 text-center">
          <span className="absolute -left-2 -top-2 size-4 rounded-full bg-background" />
          <span className="absolute -bottom-2 -left-2 size-4 rounded-full bg-background" />
          <span className="font-display text-lg font-extrabold leading-none text-terracotta">
            {discountLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
          {conditions && (
            <span className="inline-flex items-center gap-1">
              <Tag className="size-3" /> {conditions}
            </span>
          )}
          {validUntil && (
            <span>
              Jusqu’au {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(validUntil)}
            </span>
          )}
        </div>

        {action && <div className="mt-auto pt-1">{action}</div>}
      </div>

      <Sparkles className="pointer-events-none absolute -right-3 -top-3 size-16 rotate-12 text-terracotta/[0.06] transition-transform duration-500 group-hover:rotate-45" />
    </article>
  )
}
