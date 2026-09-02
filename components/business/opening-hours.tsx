import { Clock3 } from 'lucide-react'
import { DAYS, isOpenNow, type WeekHours } from '@/lib/hours'

export function OpeningHours({ hours }: { hours: WeekHours | null }) {
  if (!hours) return null
  const open = isOpenNow(hours)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Clock3 className="size-4 text-terracotta" />
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            open ? 'bg-olive/15 text-olive' : 'bg-secondary text-muted-foreground'
          }`}
        >
          {open ? 'Ouvert maintenant' : 'Fermé maintenant'}
        </span>
      </div>
      <dl className="grid gap-1.5 text-sm">
        {DAYS.map(({ key, label }) => {
          const d = hours[key]
          return (
            <div key={key} className="flex justify-between">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium">{d.closed ? 'Fermé' : `${d.open} – ${d.close}`}</dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
