'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pause, Play, Ticket, Trash2 } from 'lucide-react'
import {
  createOffer,
  toggleOffer,
  deleteOffer,
  markRedemptionUsed,
  type OfferState,
} from '@/app/actions/offers'

type Redemption = { id: string; code: string; usedAt: Date | null; user: { name: string | null } }
type Offer = {
  id: string
  title: string
  discountLabel: string
  description: string
  status: string
  redemptionCount: number
  maxRedemptions: number
  validUntil: Date | null
  redemptions: Redemption[]
}

export function OfferManager({ businessId, offers }: { businessId: string; offers: Offer[] }) {
  const create = createOffer.bind(null, businessId)
  const [state, formAction, creating] = useActionState<OfferState, FormData>(create, {})
  const [pending, start] = useTransition()
  const router = useRouter()
  const [validateMsg, setValidateMsg] = useState('')

  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn()
      router.refresh()
    })

  return (
    <div className="flex flex-col gap-6">
      {/* Valider un code présenté au comptoir */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const code = new FormData(e.currentTarget).get('code') as string
          start(async () => {
            const res = await markRedemptionUsed(code)
            setValidateMsg(res.error ?? 'Code validé ✓')
            router.refresh()
          })
        }}
        className="flex flex-wrap items-end gap-2 rounded-xl bg-secondary/50 p-3"
      >
        <label className="text-sm font-semibold">
          Valider un code client
          <input
            name="code"
            required
            placeholder="ABCXYZ"
            className="ml-2 w-28 rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm uppercase"
          />
        </label>
        <button type="submit" disabled={pending} className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-bold text-background">
          <Check className="size-4" />
        </button>
        {validateMsg && <span className="text-xs text-muted-foreground">{validateMsg}</span>}
      </form>

      {/* Liste des bons plans */}
      {offers.map((o) => (
        <div key={o.id} className="rounded-xl border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold">
                {o.title}{' '}
                <span className="rounded-full bg-terracotta px-2 py-0.5 text-xs text-primary-foreground">
                  {o.discountLabel}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <Ticket className="mr-1 inline size-3.5 text-terracotta" />
                {o.redemptionCount} récupéré{o.redemptionCount > 1 ? 's' : ''}
                {o.maxRedemptions > 0 ? ` / ${o.maxRedemptions}` : ''} ·{' '}
                {o.redemptions.filter((r) => r.usedAt).length} utilisé(s) au comptoir
                {' · '}
                <span className={o.status === 'ACTIVE' ? 'text-olive' : 'text-ochre'}>
                  {o.status === 'ACTIVE' ? 'actif' : 'en pause'}
                </span>
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => run(() => toggleOffer(o.id))}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"
                title={o.status === 'ACTIVE' ? 'Mettre en pause' : 'Réactiver'}
              >
                {o.status === 'ACTIVE' ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => run(() => deleteOffer(o.id))}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Créer un bon plan */}
      <form action={formAction} className="rounded-xl border border-dashed border-terracotta/40 bg-terracotta/5 p-4">
        <p className="font-display text-lg font-bold">Nouveau bon plan</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input name="title" required placeholder="Titre (ex. Happy hour thé)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
          <input name="discountLabel" required placeholder="Étiquette : -15% / 1 offert / 25 DT" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input name="validUntil" type="date" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <textarea name="description" required placeholder="Description du bon plan" className="min-h-16 rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
          <input name="conditions" placeholder="Conditions (facultatif)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input name="maxRedemptions" type="number" min={0} placeholder="Limite (0 = illimité)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
        {state.ok && <p className="mt-2 text-sm text-olive">Bon plan publié.</p>}
        <button
          type="submit"
          disabled={creating}
          className="mt-3 rounded-full bg-terracotta px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {creating ? 'Publication…' : 'Publier le bon plan'}
        </button>
      </form>
    </div>
  )
}
