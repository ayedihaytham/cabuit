import type { ReactNode } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/logo'
import { LogoutButton } from '@/components/auth/logout-button'

export type NavItem = {
  key: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

type AppShellProps = {
  roleLabel: string
  userName: string
  homeHref: string
  nav: NavItem[]
  activeKey: string
  /** Encart au-dessus de la navigation (carte membre côté client). */
  sidebarHeader?: ReactNode
  children: ReactNode
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'B'
  )
}

export function AppShell({
  roleLabel,
  userName,
  homeHref,
  nav,
  activeKey,
  sidebarHeader,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[oklch(0.968_0.013_82)] text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-sand/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Logo href={homeHref} tone="terracotta" className="text-xl" />
            <span className="hidden rounded-full bg-terracotta/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-terracotta sm:inline">
              {roleLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-muted-foreground md:inline">{userName}</span>
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-ochre text-sm font-bold text-primary-foreground shadow-sm">
              {initials(userName)}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-10 lg:px-10 lg:py-10">
        <aside className="lg:w-64 lg:shrink-0">
          {sidebarHeader}
          <nav className={`no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-1.5 ${sidebarHeader ? 'mt-4 lg:mt-5' : ''}`}>
            {nav.map(({ key, label, href, icon: Icon, badge }) => {
              const isActive = key === activeKey
              return (
                <Link
                  key={key}
                  href={href}
                  className={`group flex shrink-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-terracotta text-primary-foreground shadow-[0_8px_20px_rgba(175,73,48,0.28)]'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-foreground/15'
                        : 'bg-secondary group-hover:bg-terracotta/10 group-hover:text-terracotta'
                    }`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1 whitespace-nowrap">{label}</span>
                  {badge && badge > 0 ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                        isActive ? 'bg-primary-foreground/20' : 'bg-terracotta/[0.12] text-terracotta'
                      }`}
                    >
                      {badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
