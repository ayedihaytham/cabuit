'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HandMetal } from 'lucide-react'
import { claimBusiness } from '@/app/actions/commercial'

export function ClaimButton({ businessId }: { businessId: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-olive/30 bg-olive/[0.06] px-4 py-3 text-sm">
      <span className="font-medium">
        Cette fiche a été créée par l’équipe Winou. Prenez la main pour la gérer vous-même.
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await claimBusiness(businessId)
            if (res?.error) setError(res.error)
            else router.refresh()
          })
        }
        className="inline-flex items-center gap-2 rounded-full bg-olive px-4 py-2 text-xs font-bold text-sand disabled:opacity-60"
      >
        <HandMetal className="size-3.5" /> {pending ? '…' : 'Prendre la main'}
      </button>
      {error && <span className="w-full text-xs font-medium text-destructive">{error}</span>}
    </div>
  )
}
