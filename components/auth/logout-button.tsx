'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Spinner } from '@/components/app/spinner'

export function LogoutButton({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true)
        signOut({ callbackUrl })
      }}
      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:border-terracotta hover:text-terracotta disabled:opacity-60"
    >
      {pending ? <Spinner className="size-3.5" /> : <LogOut className="size-3.5" />}
      {pending ? 'Déconnexion…' : 'Déconnexion'}
    </button>
  )
}
