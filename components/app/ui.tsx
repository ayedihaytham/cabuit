import type { ReactNode } from 'react'

export function PageHead({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  text,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>
  text: string
  cta?: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
        <Icon className="size-6" />
      </span>
      <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">{text}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-border bg-card p-5 sm:p-7 ${className}`}>{children}</section>
  )
}
