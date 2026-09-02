'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { updateLocationHours } from '@/app/actions/location'
import { DAYS, defaultHours, type WeekHours } from '@/lib/hours'

export function LocationHoursForm({
  businessId,
  lat,
  lng,
  hours: initial,
}: {
  businessId: string
  lat: number | null
  lng: number | null
  hours: WeekHours | null
}) {
  const hours = initial ?? defaultHours()
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState('')
  const router = useRouter()

  return (
    <form
      action={(fd) =>
        start(async () => {
          const res = await updateLocationHours(businessId, fd)
          setMsg(res.error ?? 'Enregistré ✓')
          if (!res.error) router.refresh()
        })
      }
      className="flex flex-col gap-5"
    >
      <label className="field-label">
        Localisation
        <input
          name="mapUrl"
          placeholder={lat && lng ? `Actuel : ${lat}, ${lng} — coller un lien Google Maps pour changer` : 'Coller un lien Google Maps ou « 36.878, 10.325 »'}
          className="field-input"
        />
      </label>

      <div className="overflow-hidden rounded-xl border border-border">
        {DAYS.map(({ key, label }) => {
          const d = hours[key]
          return (
            <div key={key} className="flex flex-wrap items-center gap-3 border-b border-border p-3 last:border-0">
              <span className="w-20 text-sm font-semibold">{label}</span>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" name={`${key}_closed`} defaultChecked={d.closed} className="accent-terracotta" />
                Fermé
              </label>
              <input type="time" name={`${key}_open`} defaultValue={d.open} className="rounded-lg border border-border bg-background px-2 py-1 text-sm" />
              <span className="text-muted-foreground">→</span>
              <input type="time" name={`${key}_close`} defaultValue={d.close} className="rounded-lg border border-border bg-background px-2 py-1 text-sm" />
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {msg && (
          <span className="inline-flex items-center gap-1 text-sm text-olive">
            <Check className="size-4" /> {msg}
          </span>
        )}
      </div>
    </form>
  )
}
