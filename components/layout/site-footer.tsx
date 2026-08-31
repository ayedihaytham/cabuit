import Link from 'next/link'
import { Logo } from '@/components/layout/logo'
import { BRAND, FOOTER_LINKS, TAGLINE } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-border bg-sand px-5 py-9 lg:px-8', className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo className="text-xl" />
          <p className="mt-2 text-xs text-muted-foreground">{TAGLINE}.</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-muted-foreground">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-terracotta">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground/80">
          © 2026 {BRAND}, fait avec amour en Tunisie.
        </p>
      </div>
    </footer>
  )
}
