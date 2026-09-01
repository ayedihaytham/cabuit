'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { moderateBusiness } from '@/app/actions/admin'

type Action = 'approve' | 'reject' | 'suspend' | 'reactivate'

const STYLES: Record<Action, string> = {
  approve: 'bg-primary text-primary-foreground',
  reject: 'border border-border hover:bg-muted',
  suspend: 'border border-destructive/40 text-destructive hover:bg-destructive/10',
  reactivate: 'bg-primary text-primary-foreground',
}
const LABELS: Record<Action, string> = {
  approve: 'Valider',
  reject: 'Refuser',
  suspend: 'Suspendre',
  reactivate: 'Réactiver',
}

export function ModerationActions({
  businessId,
  actions,
}: {
  businessId: string
  actions: Action[]
}) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const run = (action: Action) =>
    start(async () => {
      await moderateBusiness(businessId, action)
      router.refresh()
    })

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          disabled={pending}
          onClick={() => run(action)}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${STYLES[action]}`}
        >
          {LABELS[action]}
        </button>
      ))}
    </div>
  )
}
