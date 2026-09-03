import type { ReactNode } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/logo'
import { LogoutButton } from '@/components/auth/logout-button'
import { NotificationBell } from '@/components/app/notification-bell'

export type NavItem = {
  key: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  /** Intitulé de groupe : affiché avant le premier item qui le porte. */
  section?: string
}

type Accent = 'terracotta' | 'olive' | 'ink' | 'ochre'

type AppShellProps = {
  roleLabel: string
  userName: string
  homeHref: string
  nav: NavItem[]
  activeKey: string
  /** Couleur d'identité de l'espace. */
  accent?: Accent
  /** Encart au-dessus de la navigation (carte membre côté client). */
  sidebarHeader?: ReactNode
  /** Élément à droite de la barre supérieure (ex. sélecteur de zone). */
  headerSlot?: ReactNode
  children: ReactNode
}

const ACCENT: Record<Accent, { text: string; bar: string; tint: string; grad: string; chip: string }> = {
  terracotta: {
    text: 'text-terracotta',
    bar: 'bg-terracotta',
    tint: 'bg-terracotta/[0.08]',
    grad: 'from-terracotta to-ochre',
    chip: 'bg-terracotta/10 text-terracotta',
  },
  olive: {
    text: 'text-olive',
    bar: 'bg-olive',
    tint: 'bg-olive/[0.1]',
    grad: 'from-olive to-[#93a05a]',
    chip: 'bg-olive/10 text-olive',
  },
  ink: {
    text: 'text-foreground',
    bar: 'bg-foreground',
    tint: 'bg-foreground/[0.06]',
    grad: 'from-foreground to-[#5b4a3a]',
    chip: 'bg-foreground/10 text-foreground',
  },
  ochre: {
    text: 'text-ochre',
    bar: 'bg-ochre',
    tint: 'bg-ochre/[0.12]',
    grad: 'from-ochre to-terracotta',
    chip: 'bg-ochre/15 text-ochre',
  },
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'W'
  )
}

export function AppShell({
  roleLabel,
  userName,
  homeHref,
  nav,
  activeKey,
  accent = 'terracotta',
  sidebarHeader,
  headerSlot,
  children,
}: AppShellProps) {
  const a = ACCENT[accent]

  // Précalcule quel item ouvre une nouvelle section (pas de mutation pendant le render).
  const seen = new Set<string>()
  const items = nav.map((item) => {
    const newSection = item.section && !seen.has(item.section) ? item.section : undefined
    if (item.section) seen.add(item.section)
    return { item, newSection }
  })

  return (
    <div className="min-h-screen bg-[oklch(0.972_0.01_82)] text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-sand/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2.5">
            <Logo href={homeHref} tone="terracotta" className="text-xl" />
            <span className="sr-only">{roleLabel}</span>
          </div>
          <div className="flex items-center gap-2.5">
            {headerSlot}
            <NotificationBell />
            <span className={`grid size-9 place-items-center rounded-full bg-gradient-to-br ${a.grad} text-sm font-bold text-primary-foreground shadow-sm`}>
              {initials(userName)}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-10 lg:px-10 lg:py-9">
        <aside className="lg:w-[15.5rem] lg:shrink-0">
          {sidebarHeader && <div className="mb-4 lg:mb-5">{sidebarHeader}</div>}

          {!sidebarHeader && (
            <div className="mb-4 hidden items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 lg:flex">
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${a.grad} text-xs font-bold text-primary-foreground`}>
                {initials(userName)}
              </span>
              <p className="min-w-0 truncate text-sm font-bold">{userName}</p>
            </div>
          )}

          <nav className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:px-0 lg:pb-0">
            {items.map(({ item: { key, label, href, icon: Icon, badge }, newSection }) => {
              const isActive = key === activeKey
              return (
                <div key={key} className="contents">
                  {newSection && (
                    <p className="mt-4 hidden px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60 first:mt-0 lg:block">
                      {newSection}
                    </p>
                  )}
                  <Link
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                      isActive ? `${a.tint} ${a.text}` : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full lg:block ${
                        isActive ? a.bar : 'bg-transparent'
                      }`}
                    />
                    <Icon className={`size-[18px] shrink-0 ${isActive ? a.text : 'text-muted-foreground/70 group-hover:text-foreground'}`} />
                    <span className="flex-1 whitespace-nowrap">{label}</span>
                    {badge && badge > 0 ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                          isActive ? `${a.bar} text-primary-foreground` : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                </div>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
