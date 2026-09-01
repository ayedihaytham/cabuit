import Link from 'next/link'
import { Tag } from 'lucide-react'
import type { ReactNode } from 'react'

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
    <article className="flex flex-col gap-3 rounded-2xl border border-terracotta/30 bg-terracotta/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          {businessName && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
          <h3 className="mt-0.5 font-display text-lg font-bold">{title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-terracotta px-3 py-1 text-sm font-bold text-primary-foreground">
          {discountLabel}
        </span>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">{description}</p>

      {conditions && (
        <p className="text-xs text-muted-foreground/80">
          <Tag className="mr-1 inline size-3" />
          {conditions}
        </p>
      )}
      {validUntil && (
        <p className="text-xs text-muted-foreground/80">
          Valable jusqu’au{' '}
          {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(validUntil)}
        </p>
      )}

      {action && <div className="pt-1">{action}</div>}
    </article>
  )
}
