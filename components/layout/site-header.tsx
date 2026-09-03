'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Menu, UserRound, X } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { MARKETING_NAV } from '@/lib/constants'
import { cn } from '@/lib/utils'

type NavLink = { label: string; href: string }

type SiteHeaderProps = {
  /**
   * `marketing` : navigation complète + CTA (pages publiques).
   * `minimal` : logo centré + lien retour (auth, paiement, tunnel).
   */
  variant?: 'marketing' | 'minimal'
  nav?: NavLink[]
  cta?: NavLink | null
  back?: NavLink | null
  /** Élément optionnel affiché dans la barre (ex. sélecteur de zone). */
  slot?: ReactNode
  className?: string
}

export function SiteHeader({
  variant = 'marketing',
  nav = MARKETING_NAV,
  cta = { label: 'Inscrire mon commerce', href: '/tarifs' },
  back = null,
  slot = null,
  className,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  if (variant === 'minimal') {
    return (
      <header className={cn('border-b border-border bg-sand/90 backdrop-blur-sm', className)}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-8">
          {back ? (
            <Link
              href={back.href}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta"
            >
              <ArrowLeft className="size-4" /> {back.label}
            </Link>
          ) : (
            <span />
          )}
          <Logo />
          <span className="w-24" aria-hidden />
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-sand/90 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {nav.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-terracotta">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {slot && <div className="hidden sm:block">{slot}</div>}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full p-2 text-foreground md:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link
            href="/connexion-client"
            className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-terracotta hover:text-terracotta sm:inline-flex"
          >
            <UserRound className="size-4" /> Se connecter
          </Link>

          {cta && (
            <Link
              href={cta.href}
              className="hidden rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-border px-5 py-5 text-sm font-medium md:hidden">
          {slot}
          {nav.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="mt-1 flex flex-col gap-3 border-t border-border pt-4">
            <Link href="/connexion-client" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 font-semibold">
              <UserRound className="size-4" /> Se connecter
            </Link>
            {cta && (
              <Link href={cta.href} onClick={() => setMenuOpen(false)} className="font-semibold text-terracotta">
                {cta.label}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
