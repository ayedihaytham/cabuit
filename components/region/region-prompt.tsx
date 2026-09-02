import { MapPin } from 'lucide-react'
import { RegionPicker } from '@/components/region/region-picker'

/** Encart affiché quand le visiteur n'a pas encore choisi de zone. */
export function RegionPrompt() {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-olive/25 bg-olive/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-olive/15 text-olive">
          <MapPin className="size-4" />
        </span>
        <div>
          <p className="text-sm font-bold">Où es-tu ?</p>
          <p className="text-xs text-muted-foreground">
            Choisis ton gouvernorat ou active ta position pour ne voir que les adresses et bons plans
            autour de toi.
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <RegionPicker current={null} currentLabel={null} />
      </div>
    </div>
  )
}
