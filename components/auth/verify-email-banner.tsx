'use client'

import { useState, useTransition } from 'react'
import { MailWarning } from 'lucide-react'
import { resendVerification } from '@/app/actions/verify-email'

export function VerifyEmailBanner() {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState('')

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-ochre/30 bg-ochre/[0.08] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="inline-flex items-center gap-2 font-medium text-ochre">
        <MailWarning className="size-4" />
        Confirmez votre adresse email pour débloquer toutes les fonctionnalités.
      </span>
      <div className="flex items-center gap-3">
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await resendVerification()
              setMsg(res.error ?? 'Lien envoyé — vérifiez votre boîte mail.')
            })
          }
          className="shrink-0 rounded-full bg-ochre px-4 py-2 text-xs font-bold text-foreground disabled:opacity-60"
        >
          {pending ? '…' : 'Renvoyer le lien'}
        </button>
      </div>
    </div>
  )
}
