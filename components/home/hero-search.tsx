'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const SUGGESTIONS = ['Cafés à La Marsa', 'Cuisine tunisienne', 'Salon de thé']

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const goToSearch = (value: string) => {
    const trimmed = value.trim()
    router.push(trimmed ? `/recherche?q=${encodeURIComponent(trimmed)}` : '/recherche')
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          goToSearch(query)
        }}
        className="mt-9 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_12px_36px_rgba(53,41,30,0.1)] focus-within:border-terracotta/50"
      >
        <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Un resto, un café, une ville…"
          aria-label="Rechercher un commerce"
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-sand transition-colors hover:bg-olive"
        >
          Rechercher
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span>Populaire :</span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => goToSearch(suggestion)}
            className="underline decoration-border underline-offset-4 hover:text-terracotta"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
