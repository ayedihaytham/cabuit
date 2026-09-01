'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function LogoutButton({ callbackUrl = '/' }: { callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl })}
      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:border-terracotta hover:text-terracotta"
    >
      <LogOut className="size-3.5" /> Déconnexion
    </button>
  )
}
