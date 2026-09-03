'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react'
import { GOVERNORATES } from '@/lib/regions'
import { ListboxSelect } from '@/components/ui/listbox-select'

const SORTS = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'note', label: 'Note' },
  { value: 'nouveaute', label: 'Nouveauté' },
  { value: 'nom', label: 'Nom (A→Z)' },
]

const CATEGORIES = [
  { value: '', label: 'Toutes catégories' },
  { value: 'RESTAURANT', label: 'Restaurants' },
  { value: 'CAFE', label: 'Cafés & salons de thé' },
]

const REGIONS = [
  { value: '', label: 'Tous gouvernorats' },
  ...GOVERNORATES.map((g) => ({ value: g.key, label: g.label })),
]

export function DirectoryFilters({ lockCategory = false }: { lockCategory?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState(params.get('q') ?? '')
  const first = useRef(true)

  // Debounce du champ texte -> URL
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const id = setTimeout(() => update('q', q || null), 350)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const reset = () => {
    setQ('')
    router.replace(pathname, { scroll: false })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold lg:hidden"
      >
        <Filter className="size-4 text-terracotta" /> Filtres
      </button>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 focus-within:border-terracotta/50">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un commerce, un plat, une ville…"
          aria-label="Rechercher"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="Effacer">
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className={`${open ? 'grid' : 'hidden'} gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid lg:grid-cols-4`}>
        {!lockCategory && (
          <ListboxSelect
            ariaLabel="Catégorie"
            value={params.get('category') ?? ''}
            options={CATEGORIES}
            onChange={(v) => update('category', v || null)}
          />
        )}
        <ListboxSelect
          ariaLabel="Gouvernorat"
          value={params.get('region') ?? ''}
          options={REGIONS}
          onChange={(v) => update('region', v || null)}
        />
        <ListboxSelect
          ariaLabel="Trier par"
          value={params.get('tri') ?? 'pertinence'}
          options={SORTS}
          onChange={(v) => update('tri', v === 'pertinence' ? null : v)}
        />
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2 lg:col-span-1">
          <input
            type="checkbox"
            checked={params.get('verifie') === '1'}
            onChange={(e) => update('verifie', e.target.checked ? '1' : null)}
            className="size-4 accent-terracotta"
          />
          <SlidersHorizontal className="size-4 text-olive" /> Vérifié
        </label>
        <button type="button" onClick={reset} className="text-left text-xs font-semibold text-terracotta hover:underline">
          Réinitialiser les filtres
        </button>
      </div>
    </>
  )
}
