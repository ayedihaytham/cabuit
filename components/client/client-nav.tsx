import Link from 'next/link'
import { Heart, History, LayoutGrid, Sparkles, Ticket, UserRound } from 'lucide-react'

type Counts = { offers: number; redemptions: number; favorites: number }

type NavItem = {
  key: string
  label: string
  icon: typeof Ticket
  badge?: (c: Counts) => number
}

const ITEMS: NavItem[] = [
  { key: 'bons-plans', label: 'Bons plans', icon: Ticket, badge: (c) => c.offers },
  { key: 'mes-bons-plans', label: 'Mes bons plans', icon: Sparkles, badge: (c) => c.redemptions },
  { key: 'favoris', label: 'Mes favoris', icon: Heart, badge: (c) => c.favorites },
  { key: 'decouvrir', label: 'Découvrir', icon: LayoutGrid },
  { key: 'historique', label: 'Historique', icon: History },
  { key: 'profil', label: 'Profil', icon: UserRound },
]

export function ClientNav({
  active,
  name,
  memberSince,
  counts,
}: {
  active: string
  name: string
  memberSince: Date
  counts: Counts
}) {
  return (
    <aside className="md:w-64 md:shrink-0">
      {/* Carte membre */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-olive to-[oklch(0.36_0.06_150)] p-5 text-primary-foreground shadow-[0_14px_40px_rgba(53,41,30,0.18)]">
        <Ticket className="pointer-events-none absolute -right-4 -top-4 size-24 rotate-12 text-primary-foreground/10" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
          Carte membre
        </p>
        <p className="mt-2 font-display text-2xl font-bold leading-tight">{name}</p>
        <p className="mt-1 text-xs text-primary-foreground/70">
          Membre depuis {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(memberSince)}
        </p>
        <div className="mt-4 flex gap-4 border-t border-primary-foreground/15 pt-3 text-center text-xs">
          <div>
            <p className="font-display text-lg font-bold">{counts.redemptions}</p>
            <p className="text-primary-foreground/60">bons plans</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold">{counts.favorites}</p>
            <p className="text-primary-foreground/60">favoris</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto md:mt-5 md:flex-col md:gap-1.5">
        {ITEMS.map(({ key, label, icon: Icon, badge }) => {
          const count = badge?.(counts) ?? 0
          const isActive = active === key
          return (
            <Link
              key={key}
              href={`/espace-client?tab=${key}`}
              className={`group flex shrink-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-terracotta text-primary-foreground shadow-[0_8px_20px_rgba(175,73,48,0.28)]'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                  isActive ? 'bg-primary-foreground/15' : 'bg-secondary group-hover:bg-terracotta/10 group-hover:text-terracotta'
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    isActive ? 'bg-primary-foreground/20' : 'bg-terracotta/12 text-terracotta'
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
