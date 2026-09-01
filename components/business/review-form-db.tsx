'use client'

import { useActionState, useState } from 'react'
import { Check, Star } from 'lucide-react'
import { submitReview, type ReviewState } from '@/app/actions/engagement'

export function ReviewFormDb({
  businessId,
  existing,
}: {
  businessId: string
  existing?: { rating: number; text: string; status: string } | null
}) {
  const bound = submitReview.bind(null, businessId)
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(bound, {})
  const [rating, setRating] = useState(existing?.rating ?? 0)

  return (
    <form action={formAction} className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-bold">
        {existing ? 'Modifier mon avis' : 'Laisser un avis'}
      </h3>
      {existing?.status === 'PENDING' && (
        <p className="mt-1 text-xs text-ochre">Votre avis est en cours de modération.</p>
      )}

      <input type="hidden" name="rating" value={rating} />
      <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} étoiles`}
            aria-pressed={rating === n}
          >
            <Star className={`size-7 ${n <= rating ? 'fill-ochre text-ochre' : 'text-foreground/20'}`} />
          </button>
        ))}
      </div>

      <textarea
        name="text"
        defaultValue={existing?.text}
        required
        placeholder="Racontez votre expérience…"
        className="mt-3 min-h-24 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-terracotta"
      />

      {state.error && <p className="mt-2 text-sm font-medium text-destructive">{state.error}</p>}
      {state.ok && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-olive">
          <Check className="size-4" /> Avis envoyé, il sera visible après validation.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="mt-4 rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
      >
        {pending ? 'Envoi…' : 'Publier'}
      </button>
    </form>
  )
}
