import Link from 'next/link'
import { Logo } from '@/components/layout/logo'
import { LogoutButton } from '@/components/auth/logout-button'

type AppHeaderProps = {
  label: string
  userName: string
  homeHref: string
  backHref?: { href: string; label: string }
}

export function AppHeader({ label, userName, homeHref, backHref }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card/90 px-4 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo href={homeHref} className="text-terracotta" tone="terracotta" />
          <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground sm:inline">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {backHref && (
            <Link href={backHref.href} className="hidden font-medium text-muted-foreground hover:text-foreground sm:inline">
              {backHref.label}
            </Link>
          )}
          <span className="hidden text-muted-foreground md:inline">{userName}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
