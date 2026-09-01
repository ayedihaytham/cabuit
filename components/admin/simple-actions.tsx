'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { moderateReview, resolveReport } from '@/app/actions/engagement'

export function ReviewModeration({ reviewId }: { reviewId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const run = (action: 'publish' | 'reject') =>
    start(async () => {
      await moderateReview(reviewId, action)
      router.refresh()
    })
  return (
    <div className="flex gap-2">
      <button type="button" disabled={pending} onClick={() => run('publish')} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        Publier
      </button>
      <button type="button" disabled={pending} onClick={() => run('reject')} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">
        Rejeter
      </button>
    </div>
  )
}

export function ReportActions({ reportId }: { reportId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const run = (action: 'RESOLVED' | 'DISMISSED') =>
    start(async () => {
      await resolveReport(reportId, action)
      router.refresh()
    })
  return (
    <div className="flex gap-2">
      <button type="button" disabled={pending} onClick={() => run('RESOLVED')} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        Traité
      </button>
      <button type="button" disabled={pending} onClick={() => run('DISMISSED')} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">
        Ignorer
      </button>
    </div>
  )
}
