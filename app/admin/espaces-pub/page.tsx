'use client'

import Link from 'next/link'
import { ArrowLeft, CalendarDays, ExternalLink } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import type { AdReservation } from '@/lib/types'

const RESERVATIONS: AdReservation[] = [
  {
    id: 'ad1',
    businessName: 'Le Petit Souk',
    businessSlug: 'le-petit-souk',
    category: 'Restauration',
    dates: '20–22 août 2026',
    days: 3,
    paid: 30,
    status: 'En cours',
  },
  {
    id: 'ad2',
    businessName: 'Café Panorama',
    businessSlug: 'cafe-panorama',
    category: 'Cafés & salons de thé',
    dates: '24 août 2026',
    days: 1,
    paid: 8,
    status: 'À venir',
  },
  {
    id: 'ad3',
    businessName: 'Salon El Bahia',
    businessSlug: 'salon-el-bahia',
    category: 'Cafés & salons de thé',
    dates: '5–7 août 2026',
    days: 3,
    paid: 30,
    status: 'Terminé',
  },
]

export default function AdminEspacesPubPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Administration
          </Link>
          <Logo />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-12">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Blayes admin / Espaces sponsorisés</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Réservations sponsorisées
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Vue dédiée des espaces diffusés sur la page d’accueil.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Revenu ce mois-ci</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">68 DT</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Aujourd’hui · 20 août</p>
            <p className="mt-2 font-display text-3xl font-bold">
              2<span className="text-lg text-muted-foreground">/3</span>
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Période</p>
            <select
              aria-label="Filtre de période"
              className="mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option>Aujourd’hui</option>
              <option>Cette semaine</option>
              <option>Ce mois</option>
            </select>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <CalendarDays className="size-5 text-primary" />
            <div>
              <h2 className="font-semibold">Réservations par commerce</h2>
              <p className="text-sm text-muted-foreground">
                Chaque ligne ouvre la fiche du commerce concerné.
              </p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {RESERVATIONS.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 p-5 md:grid md:grid-cols-[1.4fr_1fr_1.2fr_.5fr_.6fr_1fr_auto] md:items-center"
              >
                <Link href={`/commerce/${item.businessSlug}`} className="group">
                  <p className="font-semibold group-hover:text-primary">
                    {item.businessName} <ExternalLink className="ml-1 inline size-3.5" />
                  </p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </Link>
                <span className="text-sm text-muted-foreground">{item.dates}</span>
                <span className="text-sm">
                  {item.days} jour{item.days > 1 ? 's' : ''}
                </span>
                <span className="font-semibold">{item.paid} DT</span>
                <span className="text-sm font-semibold text-primary">{item.status}</span>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Modifier
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
