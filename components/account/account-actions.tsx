'use client'

import { useActionState, useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { deleteMyAccount, type DeleteState } from '@/app/actions/account'

export function AccountActions({ email }: { email: string }) {
  const [state, action, pending] = useActionState<DeleteState, FormData>(deleteMyAccount, {})
  const [armed, setArmed] = useState(false)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-xl font-bold">Mes données</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Téléchargez l’ensemble des données personnelles associées à votre compte (format JSON).
        </p>
        <a
          href="/api/me/export"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
        >
          <Download className="size-4" /> Exporter mes données
        </a>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/[0.04] p-5">
        <h2 className="font-display text-xl font-bold text-destructive">Supprimer mon compte</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Action définitive : vos favoris, avis, codes de bons plans et notifications sont effacés.
        </p>

        {!armed ? (
          <button
            type="button"
            onClick={() => setArmed(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/15"
          >
            <Trash2 className="size-4" /> Je veux supprimer mon compte
          </button>
        ) : (
          <form action={action} className="mt-4 space-y-3">
            <label className="block text-sm font-medium">
              Tapez votre email <span className="font-mono">{email}</span> pour confirmer
              <input
                name="confirm"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            {state.error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {state.error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-destructive px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {pending ? 'Suppression…' : 'Confirmer la suppression'}
              </button>
              <button
                type="button"
                onClick={() => setArmed(false)}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
