'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { PasswordInput } from '@/components/forms/password-input'
import { requestReset, resetPassword, type ResetState } from '@/app/actions/password'

export function RequestResetForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(requestReset, {})

  if (state.ok) {
    return (
      <div className="mt-8 rounded-2xl bg-olive/10 p-5 text-center" role="status">
        <Check className="mx-auto size-8 text-olive" />
        <p className="mt-3 text-sm">
          Si un compte existe pour cet email, un lien de réinitialisation vient d’être envoyé.
        </p>
        <Link href="/connexion-client" className="mt-4 inline-flex text-sm font-bold text-terracotta">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="field-label">
        Email
        <input className="field-input" name="email" type="email" autoComplete="email" required placeholder="toi@exemple.com" />
      </label>
      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {pending ? 'Envoi…' : 'Envoyer le lien'} <ArrowRight className="size-4" />
      </button>
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, {})

  if (state.ok) {
    return (
      <div className="mt-8 rounded-2xl bg-olive/10 p-5 text-center" role="status">
        <Check className="mx-auto size-8 text-olive" />
        <p className="mt-3 font-semibold">Mot de passe modifié.</p>
        <Link href="/connexion" className="mt-4 inline-flex text-sm font-bold text-terracotta">
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="token" value={token} />
      <label className="field-label">
        Nouveau mot de passe
        <PasswordInput name="password" autoComplete="new-password" minLength={8} required placeholder="8 caractères minimum" />
      </label>
      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {pending ? 'Enregistrement…' : 'Réinitialiser'}
      </button>
    </form>
  )
}
