'use client'

import { useActionState } from 'react'
import { ArrowRight } from 'lucide-react'
import { PasswordInput } from '@/components/forms/password-input'
import type { SignupState } from '@/app/actions/auth'

type SignupFormProps = {
  action: (prev: SignupState, formData: FormData) => Promise<SignupState>
  cta: string
}

export function SignupForm({ action, cta }: SignupFormProps) {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(action, {})
  const err = (f: string) => state.fieldErrors?.[f]?.[0]

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="field-label">
        Nom complet
        <input className="field-input" name="name" autoComplete="name" required placeholder="Ton nom" />
        {err('name') && <span className="text-xs font-medium text-destructive">{err('name')}</span>}
      </label>

      <label className="field-label">
        Email
        <input className="field-input" name="email" type="email" autoComplete="email" required placeholder="toi@exemple.com" />
        {err('email') && <span className="text-xs font-medium text-destructive">{err('email')}</span>}
      </label>

      <label className="field-label">
        Mot de passe
        <PasswordInput name="password" autoComplete="new-password" required placeholder="8 caractères minimum" minLength={8} />
        {err('password') && <span className="text-xs font-medium text-destructive">{err('password')}</span>}
      </label>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? 'Création…' : cta}
        {!pending && <ArrowRight className="size-4" />}
      </button>
    </form>
  )
}
