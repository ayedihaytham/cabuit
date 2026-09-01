'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toggleFavorite } from '@/app/actions/engagement'

export function FavoriteToggleDb({
  businessId,
  businessName,
  initialFavorited,
  variant = 'icon',
}: {
  businessId: string
  businessName: string
  initialFavorited: boolean
  variant?: 'icon' | 'button'
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [fav, setFav] = useOptimistic(initialFavorited)

  const run = () =>
    start(async () => {
      setFav(!fav)
      await toggleFavorite(businessId).catch(() => {})
      router.refresh()
    })

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
          fav ? 'bg-terracotta text-primary-foreground' : 'border border-border hover:border-terracotta hover:text-terracotta'
        }`}
      >
        <Heart className={`size-4 ${fav ? 'fill-current' : ''}`} />
        {fav ? 'Dans mes favoris' : 'Ajouter aux favoris'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      aria-label={fav ? `Retirer ${businessName} des favoris` : `Ajouter ${businessName} aux favoris`}
      className="flex size-10 items-center justify-center rounded-full border border-border bg-card/90 text-foreground transition hover:text-terracotta disabled:opacity-60"
    >
      <Heart className={`size-4 ${fav ? 'fill-terracotta text-terracotta' : ''}`} />
    </button>
  )
}
