import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center text-foreground">
      <div className="max-w-lg">
        <span className="mx-auto flex size-20 items-center justify-center rounded-[2rem] bg-ochre/20 text-terracotta">
          <Compass className="size-10" />
        </span>
        <p className="mt-8 font-mono text-sm font-bold tracking-[.2em] text-terracotta">ERREUR 404</p>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">
          Page introuvable<span className="text-ochre">.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-base leading-7 text-muted-foreground">
          Cette page n’existe pas ou plus. Mais il reste plein de belles adresses à découvrir.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <ArrowLeft className="size-4" /> Retour à l’accueil
        </Link>
      </div>
    </main>
  )
}
