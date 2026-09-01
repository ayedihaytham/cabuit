'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, Ticket } from 'lucide-react'
import { claimOffer } from '@/app/actions/offers'

export function ClaimOffer({
  offerId,
  isClient,
  initialCode,
}: {
  offerId: string
  isClient: boolean
  initialCode?: string | null
}) {
  const [code, setCode] = useState<string | null>(initialCode ?? null)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  if (!isClient) {
    return (
      <Link
        href="/connexion-client"
        className="inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-2 text-sm font-bold text-primary-foreground"
      >
        <Ticket className="size-4" /> Connecte-toi pour en profiter
      </Link>
    )
  }

  if (code) {
    return (
      <div className="rounded-xl border border-olive/40 bg-olive/10 px-4 py-3 text-sm">
        <p className="flex items-center gap-1.5 font-semibold text-olive">
          <Check className="size-4" /> Bon plan récupéré
        </p>
        <p className="mt-1 text-muted-foreground">Présente ce code au comptoir :</p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em] text-foreground">{code}</p>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await claimOffer(offerId)
            if (res.error) setError(res.error)
            else if (res.code) setCode(res.code)
          })
        }
        className="inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-2 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        <Ticket className="size-4" /> {pending ? '…' : "J'en profite"}
      </button>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
