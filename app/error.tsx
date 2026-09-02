'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCw, TriangleAlert } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center text-foreground">
      <div className="max-w-lg">
        <span className="mx-auto flex size-20 items-center justify-center rounded-[2rem] bg-destructive/15 text-destructive">
          <TriangleAlert className="size-10" />
        </span>
        <p className="mt-8 font-mono text-sm font-bold tracking-[.2em] text-terracotta">
          UNE ERREUR EST SURVENUE
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl">
          Quelque chose a coincé<span className="text-ochre">.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-base leading-7 text-muted-foreground">
          Le problème vient de chez nous, pas de vous. Réessayez dans un instant.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground/70">Réf. {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <RotateCw className="size-4" /> Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-bold hover:bg-secondary/60"
          >
            <ArrowLeft className="size-4" /> Accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
