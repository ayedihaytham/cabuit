'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { PLANS, formatYearlyPrice } from '@/lib/data/plans'
import type { FormState } from '@/app/actions/business'

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
}

export function SubmitForReview({ action }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="grid gap-3 sm:grid-cols-3">
        {PLANS.map((plan, i) => (
          <label
            key={plan.name}
            className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border p-4 text-sm has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5"
          >
            <span className="flex items-center gap-2 font-bold">
              <input
                type="radio"
                name="tier"
                value={plan.name.toUpperCase()}
                defaultChecked={i === 1}
                className="accent-terracotta"
              />
              {plan.name}
            </span>
            <span className="text-muted-foreground">{formatYearlyPrice(plan)}</span>
          </label>
        ))}
      </fieldset>
      {state.fieldErrors?.tier && (
        <p className="text-xs font-medium text-destructive">{state.fieldErrors.tier[0]}</p>
      )}

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="acceptTerms" className="mt-1 size-4 accent-terracotta" />
        <span>
          J’accepte les{' '}
          <Link href="/#cgu" className="font-semibold text-terracotta underline">
            Conditions Générales d’Abonnement (v1)
          </Link>{' '}
          de Blayes. Mon acceptation est enregistrée avec la date et mon adresse IP.
        </span>
      </label>
      {state.fieldErrors?.acceptTerms && (
        <p className="text-xs font-medium text-destructive">{state.fieldErrors.acceptTerms[0]}</p>
      )}
      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        <ShieldCheck className="size-4" />
        {pending ? 'Envoi…' : 'Envoyer à validation'}
      </button>
    </form>
  )
}
