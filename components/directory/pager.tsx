import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Pagination par liens (préserve les autres paramètres d'URL). */
export function Pager({
  page,
  pageCount,
  params,
  basePath,
}: {
  page: number
  pageCount: number
  params: Record<string, string | undefined>
  basePath: string
}) {
  if (pageCount <= 1) return null

  const href = (p: number) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
    if (p > 1) q.set('page', String(p))
    else q.delete('page')
    const s = q.toString()
    return s ? `${basePath}?${s}` : basePath
  }

  const nums: number[] = []
  const from = Math.max(1, page - 2)
  const to = Math.min(pageCount, from + 4)
  for (let i = from; i <= to; i++) nums.push(i)

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <PagerLink href={href(page - 1)} disabled={page <= 1} aria-label="Page précédente">
        <ChevronLeft className="size-4" />
      </PagerLink>
      {from > 1 && <span className="px-1 text-sm text-muted-foreground">…</span>}
      {nums.map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`grid size-9 place-items-center rounded-lg text-sm font-semibold ${
            n === page ? 'bg-terracotta text-primary-foreground' : 'border border-border hover:bg-secondary'
          }`}
        >
          {n}
        </Link>
      ))}
      {to < pageCount && <span className="px-1 text-sm text-muted-foreground">…</span>}
      <PagerLink href={href(page + 1)} disabled={page >= pageCount} aria-label="Page suivante">
        <ChevronRight className="size-4" />
      </PagerLink>
    </nav>
  )
}

function PagerLink({
  href,
  disabled,
  children,
  ...rest
}: {
  href: string
  disabled: boolean
  children: React.ReactNode
} & React.ComponentProps<typeof Link>) {
  if (disabled) {
    return (
      <span className="grid size-9 cursor-not-allowed place-items-center rounded-lg border border-border text-muted-foreground/40">
        {children}
      </span>
    )
  }
  return (
    <Link href={href} {...rest} className="grid size-9 place-items-center rounded-lg border border-border hover:bg-secondary">
      {children}
    </Link>
  )
}
