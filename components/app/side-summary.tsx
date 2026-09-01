export function SideSummary({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
