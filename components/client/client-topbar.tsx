import { Logo } from '@/components/layout/logo'
import { LogoutButton } from '@/components/auth/logout-button'

export function ClientTopbar({ name }: { name: string }) {
  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'B'

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-sand/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        <div className="flex items-center gap-3">
          <Logo href="/" tone="terracotta" className="text-xl" />
          <span className="hidden rounded-full bg-terracotta/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-terracotta sm:inline">
            Espace membre
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">{name}</span>
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-ochre text-sm font-bold text-primary-foreground shadow-sm">
            {initials}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
