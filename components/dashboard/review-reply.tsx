'use client'

import { useActionState } from 'react'
import { replyToReview, type ReviewState } from '@/app/actions/engagement'

export function ReviewReply({ reviewId, existing }: { reviewId: string; existing?: string | null }) {
  const bound = replyToReview.bind(null, reviewId)
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(bound, {})

  return (
    <form action={formAction} className="mt-3">
      <textarea
        name="reply"
        defaultValue={existing ?? ''}
        placeholder="Répondre publiquement…"
        className="min-h-16 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="mt-2 flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-foreground px-4 py-1.5 text-xs font-bold text-background disabled:opacity-60">
          {pending ? '…' : existing ? 'Modifier la réponse' : 'Répondre'}
        </button>
        {state.ok && <span className="text-xs text-olive">Réponse publiée.</span>}
        {state.error && <span className="text-xs text-destructive">{state.error}</span>}
      </div>
    </form>
  )
}
