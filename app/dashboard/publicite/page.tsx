'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { SponsoredCard } from '@/components/sponsored-card'

const DAYS = [
  { day: 'Lun', date: 14, muted: true }, { day: 'Mar', date: 15 }, { day: 'Mer', date: 16 }, { day: 'Jeu', date: 17 },
  { day: 'Ven', date: 18 }, { day: 'Sam', date: 19 }, { day: 'Dim', date: 20 }, { day: 'Lun', date: 21 },
  { day: 'Mar', date: 22 }, { day: 'Mer', date: 23 }, { day: 'Jeu', date: 24 }, { day: 'Ven', date: 25 },
  { day: 'Sam', date: 26 }, { day: 'Dim', date: 27 }, { day: 'Lun', date: 28 }, { day: 'Mar', date: 29 },
  { day: 'Mer', date: 30 }, { day: 'Jeu', date: 1, muted: true }, { day: 'Ven', date: 2, muted: true }, { day: 'Sam', date: 3, muted: true },
]

const PRICE_PER_DAY = 10
const PREMIUM_DISCOUNT = 0.2

export default function PublicitePage() {
  const [selected, setSelected] = useState<number[]>([15, 16, 17])
  const [monthOffset, setMonthOffset] = useState(0)
  const [reserved, setReserved] = useState(false)

  const total = useMemo(
    () => selected.length * PRICE_PER_DAY * (1 - PREMIUM_DISCOUNT),
    [selected.length],
  )
  const month = monthOffset === 0 ? 'Septembre 2026' : 'Octobre 2026'

  const toggleDate = (date: number, muted?: boolean) => {
    if (muted) return
    setSelected((current) =>
      current.includes(date) ? current.filter((item) => item !== date) : [...current, date],
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Retour au dashboard
          </Link>
          <Logo className="text-terracotta" tone="terracotta" />
          <span className="hidden rounded-full bg-olive/10 px-3 py-1.5 text-xs font-semibold text-olive sm:inline-flex">
            Le Petit Souk · Premium
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow">Visibilité sponsorisée</p>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Mets ta marque à l’honneur sur la page d’accueil
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Réserve un emplacement privilégié et touche les visiteurs qui cherchent leur prochaine
            bonne adresse.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-6">
            <section className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarDays className="size-5 text-terracotta" />
                    <h2 className="text-xl font-semibold">Choisis tes jours</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Ton espace sera affiché toute la journée.</p>
                </div>
                <div className="rounded-full bg-ochre/15 px-3 py-1.5 text-xs font-semibold text-ochre">
                  {selected.length} jours
                </div>
              </div>

              <div className="mb-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMonthOffset((offset) => Math.max(0, offset - 1))}
                  aria-label="Mois précédent"
                  className="rounded-full border border-border p-2 hover:bg-background"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="font-semibold">{month}</span>
                <button
                  type="button"
                  onClick={() => setMonthOffset((offset) => Math.min(1, offset + 1))}
                  aria-label="Mois suivant"
                  className="rounded-full border border-border p-2 hover:bg-background"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
                {DAYS.map((item, index) => {
                  const active = selected.includes(item.date) && !item.muted
                  return (
                    <button
                      type="button"
                      key={`${item.date}-${index}`}
                      onClick={() => toggleDate(item.date, item.muted)}
                      aria-pressed={active}
                      className={`min-h-16 rounded-xl border p-2 text-left transition ${
                        active
                          ? 'border-terracotta bg-terracotta text-primary-foreground shadow-sm'
                          : item.muted
                            ? 'border-transparent text-muted-foreground/35'
                            : 'border-border hover:border-terracotta/60 hover:bg-terracotta/5'
                      }`}
                    >
                      <span className="block text-[11px] font-medium opacity-75">{item.day}</span>
                      <span className="mt-1 block text-lg font-semibold">{item.date}</span>
                      {active && <Check className="mt-1 size-3" />}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Aperçu public</p>
                  <h2 className="text-xl font-semibold">Voici ce que les visiteurs verront</h2>
                </div>
                <Link
                  href="/restauration/le-petit-souk"
                  className="hidden items-center gap-1 text-sm font-semibold text-terracotta sm:flex"
                >
                  Voir ma fiche <ExternalLink className="size-3.5" />
                </Link>
              </div>
              <SponsoredCard compact />
            </section>
          </div>

          <aside className="h-fit xl:sticky xl:top-6">
            <section className="rounded-[1.5rem] border border-terracotta/30 bg-card p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="eyebrow">Ton récapitulatif</p>
                  <h2 className="text-xl font-semibold">Réserver mon espace</h2>
                </div>
              </div>
              <div className="flex flex-col gap-4 border-b border-border pb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix par jour</span>
                  <span className="font-semibold">{PRICE_PER_DAY} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jours sélectionnés</span>
                  <span className="font-semibold">{selected.length}</span>
                </div>
                <div className="flex justify-between text-olive">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-4" /> Réduction Premium
                  </span>
                  <span className="font-semibold">-20%</span>
                </div>
              </div>
              <div className="flex items-end justify-between py-5">
                <span className="text-sm text-muted-foreground">Total à régler</span>
                <span className="font-display text-4xl text-terracotta">
                  {total.toFixed(0)} <small className="font-sans text-base">DT</small>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReserved(true)}
                disabled={selected.length === 0 || reserved}
                className="w-full rounded-full bg-terracotta px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reserved ? 'Espace réservé' : 'Réserver cet espace'}
              </button>
              {reserved && (
                <p className="mt-3 text-center text-sm font-medium text-olive">
                  Ta demande est bien enregistrée. Nous revenons vers toi rapidement.
                </p>
              )}
              <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
                Ton espace redirige les visiteurs directement vers ta fiche commerce.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
