'use client'

import { useActionState } from 'react'
import { changeMyPassword, type ResetState } from '@/app/actions/password'

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(changeMyPassword, {})

  return (
    <form action={action} className="space-y-4">
      <label className="field-label">
        Nouveau mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          className="field-input"
        />
      </label>
      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {pending ? 'Enregistrement…' : 'Définir mon mot de passe'}
      </button>
    </form>
  )
}
