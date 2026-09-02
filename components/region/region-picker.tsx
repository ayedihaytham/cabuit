'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, LocateFixed, MapPin } from 'lucide-react'
import { GOVERNORATES } from '@/lib/regions'
import { setRegion } from '@/app/actions/region'

export function RegionPicker({
  current,
  currentLabel,
  variant = 'bar',
}: {
  current: string | null
  currentLabel: string | null
  variant?: 'bar' | 'compact'
}) {
  const [open, setOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const choose = (key: string | null) => {
    setError('')
    setOpen(false)
    start(async () => {
      await setRegion(key)
      router.refresh()
    })
  }

  const useMyLocation = () => {
    setError('')
    if (!('geolocation' in navigator)) {
      setError('Géolocalisation indisponible sur cet appareil.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`/api/geo?lat=${latitude}&lng=${longitude}`)
          const data = await res.json()
          if (data.region) choose(data.region)
          else setError('Zone introuvable, choisissez manuellement.')
        } catch {
          setError('Impossible de déterminer votre zone.')
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
        setError('Accès à la position refusé.')
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    )
  }

  const busy = pending || locating
  const trigger =
    variant === 'compact'
      ? 'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold'
      : 'inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm'

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className={trigger} disabled={busy}>
        <MapPin className="size-4 text-terracotta" />
        <span>{busy ? '…' : (currentLabel ?? 'Toute la Tunisie')}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <button
            type="button"
            onClick={useMyLocation}
            className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold text-terracotta hover:bg-secondary/60"
          >
            <LocateFixed className="size-4" /> Près de moi
          </button>
          <div className="max-h-72 overflow-y-auto py-1">
            <Row label="Toute la Tunisie" active={!current} onClick={() => choose(null)} />
            {GOVERNORATES.map((g) => (
              <Row key={g.key} label={g.label} active={current === g.key} onClick={() => choose(g.key)} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="absolute right-0 mt-1 w-64 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function Row({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-secondary/60 ${
        active ? 'font-bold text-terracotta' : ''
      }`}
    >
      {label}
      {active && <Check className="size-4" />}
    </button>
  )
}
