'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const KEY = 'winou.cookies'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let seen = true
    try {
      seen = Boolean(localStorage.getItem(KEY))
    } catch {
      /* stockage indisponible : on n'affiche rien */
    }
    if (seen) return
    const t = setTimeout(() => setShow(true), 0)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString())
    } catch {
      /* ignore */
    }
    setShow(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Winou utilise uniquement un cookie de session nécessaire à la connexion.{' '}
          <Link href="/confidentialite" className="font-semibold text-terracotta hover:underline">
            En savoir plus
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-full bg-terracotta px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          J’ai compris
        </button>
      </div>
    </div>
  )
}
