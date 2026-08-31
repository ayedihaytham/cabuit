'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, ChevronDown, Flag, Menu, Search, ShieldCheck, Store, X } from 'lucide-react'
import { Logo } from '@/components/layout/logo'

type PendingBusiness = { id: string; name: string; category: string; city: string; date: string }
type ValidBusiness = { id: string; name: string; category: string; city: string; verified: boolean }
type Report = { id: string; name: string; reason: string; date: string }
type Section = 'pending' | 'valid' | 'reports'

const PENDING_SEED: PendingBusiness[] = [
  { id: 'p1', name: 'Dar El Hout', category: 'Restauration', city: 'La Marsa', date: '14 août 2026' },
  { id: 'p2', name: 'Café des Oliviers', category: 'Cafés & salons de thé', city: 'Ariana', date: '13 août 2026' },
  { id: 'p3', name: 'Le Comptoir de Carthage', category: 'Restauration', city: 'Carthage', date: '12 août 2026' },
]
const VALID_SEED: ValidBusiness[] = [
  { id: 'v1', name: 'Le Petit Souk', category: 'Restauration', city: 'La Marsa', verified: true },
  { id: 'v2', name: 'Café Panorama', category: 'Cafés & salons de thé', city: 'La Marsa', verified: false },
  { id: 'v3', name: 'Salon El Bahia', category: 'Cafés & salons de thé', city: 'Sidi Bou Saïd', verified: false },
]
const REPORTS: Report[] = [
  { id: 'r1', name: 'La Terrasse 21', reason: 'Informations trompeuses', date: '15 août 2026' },
  { id: 'r2', name: 'Maison Jasmin', reason: 'Photo non conforme', date: '14 août 2026' },
]

const NAV: { key: Section; label: string; icon: typeof Store }[] = [
  { key: 'pending', label: 'Commerces en attente', icon: Store },
  { key: 'valid', label: 'Commerces validés', icon: ShieldCheck },
  { key: 'reports', label: 'Signalements', icon: Flag },
]

const TITLES: Record<Section, string> = {
  pending: 'Commerces en attente',
  valid: 'Commerces validés',
  reports: 'Signalements',
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>('pending')
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(PENDING_SEED)
  const [valid, setValid] = useState(VALID_SEED)
  const [toast, setToast] = useState('')
  const [report, setReport] = useState<Report | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const term = query.toLowerCase()
  const filteredPending = useMemo(
    () =>
      pending.filter((item) =>
        `${item.name} ${item.category} ${item.city}`.toLowerCase().includes(term),
      ),
    [pending, term],
  )
  const filteredValid = useMemo(
    () =>
      valid.filter((item) =>
        `${item.name} ${item.category} ${item.city}`.toLowerCase().includes(term),
      ),
    [valid, term],
  )

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 2200)
  }
  const approve = (id: string) => {
    const item = pending.find((entry) => entry.id === id)
    if (!item) return
    setPending((items) => items.filter((entry) => entry.id !== id))
    setValid((items) => [...items, { ...item, verified: false }])
    notify(`${item.name} a été validé`)
  }
  const reject = (id: string) => {
    const item = pending.find((entry) => entry.id === id)
    setPending((items) => items.filter((entry) => entry.id !== id))
    notify(`${item?.name ?? 'Commerce'} a été rejeté`)
  }
  const toggleVerified = (id: string) => {
    setValid((items) =>
      items.map((entry) => (entry.id === id ? { ...entry, verified: !entry.verified } : entry)),
    )
    notify('Badge Vérifié mis à jour')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-card px-5 py-4 lg:hidden">
        <Logo />
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg border border-border p-2"
        >
          <Menu className="size-5" />
        </button>
      </header>

      <div className="flex min-h-screen">
        <aside
          className={`${mobileOpen ? 'block' : 'hidden'} absolute inset-x-0 top-[65px] z-10 border-b border-border bg-card p-5 lg:static lg:block lg:w-64 lg:border-b-0 lg:border-r`}
        >
          <Logo className="hidden lg:block" />
          <p className="mt-1 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
            Administration
          </p>
          <nav className="mt-8 flex flex-col gap-2" aria-label="Navigation administration">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSection(key)
                  setMobileOpen(false)
                }}
                className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  section === key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4" />
                  {label}
                </span>
                {key === 'pending' && (
                  <span className="rounded-full bg-ochre/20 px-2 py-0.5 text-xs">{pending.length}</span>
                )}
                {key === 'reports' && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                    {REPORTS.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <Link
            href="/admin/espaces-pub"
            className="mt-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            <CalendarDays className="size-4" /> Espaces sponsorisés
          </Link>
          <Link href="/" className="mt-10 block text-sm text-muted-foreground hover:text-foreground">
            ← Retour au site
          </Link>
        </aside>

        <main className="w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-12">
          <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-primary">Blayes admin / Modération</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {TITLES[section]}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Garde l’annuaire fiable, utile et accueillant.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                aria-label="Rechercher"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher…"
                className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {section === 'reports' ? (
            <section className="mt-7 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="divide-y divide-border">
                {REPORTS.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Motif : {item.reason} · {item.date}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReport(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      Examiner <ChevronDown className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="mt-7 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="divide-y divide-border">
                {(section === 'pending' ? filteredPending : filteredValid).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 p-5 md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category} · {item.city}
                      </p>
                    </div>
                    <span className="hidden text-sm text-muted-foreground md:block">{item.category}</span>
                    <span className="hidden text-sm text-muted-foreground md:block">{item.city}</span>
                    <span className="hidden text-sm md:block">
                      {section === 'pending' ? (
                        (item as PendingBusiness).date
                      ) : (item as ValidBusiness).verified ? (
                        <span className="text-primary">Vérifié</span>
                      ) : (
                        'Standard'
                      )}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {section === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => approve(item.id)}
                            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                          >
                            Valider
                          </button>
                          <button
                            type="button"
                            onClick={() => reject(item.id)}
                            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
                          >
                            Rejeter
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleVerified(item.id)}
                          className="rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary"
                        >
                          {(item as ValidBusiness).verified ? 'Retirer Vérifié' : 'Attribuer Vérifié'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-lg"
        >
          {toast}
        </div>
      )}

      {report && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-foreground/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Signalement</p>
                <h2 className="mt-1 text-xl font-bold">{report.name}</h2>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setReport(null)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-5 rounded-xl bg-muted p-4 text-sm">
              Motif signalé : <strong>{report.reason}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setReport(null)
                notify('Signalement marqué comme examiné')
              }}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Marquer comme examiné
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
