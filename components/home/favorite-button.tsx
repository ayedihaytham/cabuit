'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

export function FavoriteButton({ businessName }: { businessName: string }) {
  const [saved, setSaved] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setSaved((current) => !current)}
      aria-label={saved ? `Retirer ${businessName} des favoris` : `Ajouter ${businessName} aux favoris`}
      className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground transition-colors hover:text-terracotta"
    >
      <Heart className={`size-4 ${saved ? 'fill-terracotta text-terracotta' : ''}`} />
    </button>
  )
}
