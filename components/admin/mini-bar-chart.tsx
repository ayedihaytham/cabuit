/** Histogramme SVG minimal, sans dépendance. */
export function MiniBarChart({
  data,
  label,
  accent = 'var(--terracotta, #af4930)',
}: {
  data: { date: string; count: number }[]
  label: string
  accent?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((s, d) => s + d.count, 0)
  const w = 100 / data.length

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <p className="font-display text-xl font-bold">{total}</p>
      </div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="mt-3 h-20 w-full" role="img" aria-label={label}>
        {data.map((d, i) => {
          const h = (d.count / max) * 38
          return (
            <rect
              key={d.date}
              x={i * w + w * 0.15}
              y={40 - h}
              width={w * 0.7}
              height={Math.max(h, d.count > 0 ? 1 : 0)}
              rx={0.6}
              fill={accent}
              opacity={d.count === 0 ? 0.15 : 0.9}
            />
          )
        })}
      </svg>
      <p className="mt-1 text-[11px] text-muted-foreground/60">30 derniers jours</p>
    </div>
  )
}
