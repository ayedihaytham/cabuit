'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { declareBankTransfer } from '@/app/actions/payment'

export function BankTransferForm({ subscriptionId }: { subscriptionId: string }) {
  const [pending, start] = useTransition()
  const [state, setState] = useState<{ error?: string; ok?: boolean }>({})
  const router = useRouter()

  if (state.ok) {
    return (
      <p className="inline-flex items-center gap-2 rounded-xl bg-olive/10 px-4 py-3 text-sm font-medium text-olive">
        <Check className="size-4" /> Virement déclaré. L’équipe Blayes le confirme sous 48 h.
      </p>
    )
  }

  return (
    <form
      action={(fd) =>
        start(async () => {
          const res = await declareBankTransfer(subscriptionId, fd)
          setState(res)
          if (res.ok) router.refresh()
        })
      }
      className="flex flex-wrap items-end gap-3"
    >
      <label className="field-label">
        Référence du virement
        <input name="reference" required placeholder="Ex. VIR-2026-0142" className="field-input" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {pending ? 'Envoi…' : 'J’ai fait le virement'}
      </button>
      {state.error && <p className="w-full text-sm font-medium text-destructive">{state.error}</p>}
    </form>
  )
}
