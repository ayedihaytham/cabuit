'use client'

import Link from 'next/link'
import { CalendarDays, CheckCircle2, Clock3, ExternalLink, Megaphone } from 'lucide-react'
import { Logo } from '@/components/layout/logo'

const RESERVATIONS = [
  { id: 'ad1', dates: '20–22 août 2026', days: 3, status: 'En cours', remaining: 2, paid: 30 },
  { id: 'ad2', dates: '24 août 2026', days: 1, status: 'À venir', remaining: 6, paid: 8 },
]

export default function EspacePubPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            ← Retour au dashboard
          </Link>
          <Logo className="text-terracotta" tone="terracotta" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="eyebrow">Visibilité sponsorisée</p>
          <h1 className="font-display text-4xl text-foreground">Mon espace sponsorisé</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Retrouve ici tes réservations, leur état et le nombre de jours avant leur diffusion.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-terracotta/25 bg-terracotta/5 p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-terracotta/10 p-3 text-terracotta">
              <Megaphone className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Le Petit Souk</p>
              <p className="text-sm text-muted-foreground">La Marsa · Restauration</p>
            </div>
          </div>
          <Link
            href="/dashboard/publicite"
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Réserver un nouvel espace <ExternalLink className="size-4" />
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Mes réservations</h2>
          </div>
          <div className="divide-y divide-border">
            {RESERVATIONS.map((item) => {
              const running = item.status === 'En cours'
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 rounded-full p-2 ${running ? 'bg-olive/10 text-olive' : 'bg-ochre/15 text-ochre'}`}
                    >
                      {running ? <CheckCircle2 className="size-4" /> : <CalendarDays className="size-4" />}
                    </span>
                    <div>
                      <p className="font-semibold">Espace sponsorisé · {item.dates}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.days} jour{item.days > 1 ? 's' : ''} · {item.paid} DT payés
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <p className={`text-sm font-semibold ${running ? 'text-olive' : 'text-ochre'}`}>
                        {item.status}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="size-3" /> {item.remaining} jours restants
                      </p>
                    </div>
                    <Link
                      href="/dashboard/publicite"
                      className="rounded-full border border-border px-3 py-2 text-xs font-semibold hover:bg-background"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
