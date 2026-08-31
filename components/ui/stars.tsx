import { Star } from 'lucide-react'

type StarsProps = {
  rating: number
  interactive?: boolean
  onChange?: (value: number) => void
  className?: string
}

/** Affiche 5 étoiles ; en mode `interactive`, chaque étoile est un bouton de notation. */
export function Stars({ rating, interactive = false, onChange, className }: StarsProps) {
  return (
    <div
      className={`flex items-center gap-1 ${className ?? ''}`}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={`${rating} étoiles`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating
        if (!interactive) {
          return (
            <Star
              key={star}
              className={`size-4 ${filled ? 'fill-ochre text-ochre' : 'text-foreground/15'}`}
            />
          )
        }
        return (
          <button
            type="button"
            key={star}
            onClick={() => onChange?.(star)}
            aria-label={`${star} étoiles`}
            aria-pressed={rating === star}
            className="transition-transform hover:scale-110"
          >
            <Star className={`size-6 ${filled ? 'fill-ochre text-ochre' : 'text-foreground/20'}`} />
          </button>
        )
      })}
    </div>
  )
}
