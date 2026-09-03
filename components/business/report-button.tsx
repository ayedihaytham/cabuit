'use client'

import { useActionState, useState } from 'react'
import { Flag } from 'lucide-react'
import { submitReport, type ReportState } from '@/app/actions/engagement'

const REASONS = ['Informations trompeuses', 'Photo non conforme', 'Établissement fermé', 'Contenu inapproprié', 'Autre']

export function ReportButton({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false)
  const bound = submitReport.bind(null, businessId)
  const [state, formAction, pending] = useActionState<ReportState, FormData>(bound, {})

  return (
    <div className="mt-8 text-xs text-muted-foreground">
      <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 hover:text-terracotta">
        <Flag className="size-3.5" /> Signaler cette fiche
      </button>

      {open && !state.ok && (
        <form action={formAction} className="mt-3 max-w-md space-y-3 rounded-xl border border-border bg-card p-4">
          <select name="reason" className="select-field w-full px-3 py-2 text-sm">
            {REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <textarea
            name="detail"
            placeholder="Détail (facultatif)"
            className="min-h-16 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <button type="submit" disabled={pending} className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background disabled:opacity-60">
            {pending ? 'Envoi…' : 'Envoyer le signalement'}
          </button>
        </form>
      )}
      {state.ok && <p className="mt-2 text-olive">Merci, le signalement a été transmis à l’équipe.</p>}
    </div>
  )
}
