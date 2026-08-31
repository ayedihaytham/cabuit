'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Menu, X } from 'lucide-react'
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
  className?: string
}

export function SiteHeader({
  variant = 'marketing',
  nav = MARKETING_NAV,
  cta = { label: 'Inscrire mon commerce', href: '/tarifs' },
  back = null,
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
    <header className={cn('border-b border-border bg-sand/85 backdrop-blur-sm', className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {nav.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-terracotta">
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-full p-2 text-foreground md:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {cta && (
          <Link
            href={cta.href}
            className="hidden rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            {cta.label}
          </Link>
        )}
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-border px-5 py-5 text-sm font-medium md:hidden">
          {nav.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {cta && (
            <Link href={cta.href} onClick={() => setMenuOpen(false)} className="font-semibold text-terracotta">
              {cta.label}
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
