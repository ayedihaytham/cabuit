'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

export function FavoriteToggle({ businessName }: { businessName: string }) {
  const [liked, setLiked] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setLiked((current) => !current)}
      aria-label={liked ? `Retirer ${businessName} des favoris` : `Ajouter ${businessName} aux favoris`}
      className={`flex size-10 items-center justify-center rounded-full border transition-colors ${
        liked
          ? 'border-terracotta bg-terracotta text-primary-foreground'
          : 'border-border text-muted-foreground hover:border-terracotta hover:text-terracotta'
      }`}
    >
      <Heart className="size-4" fill={liked ? 'currentColor' : 'none'} />
    </button>
  )
}
