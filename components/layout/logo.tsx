import Link from 'next/link'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/utils'

type LogoProps = {
  href?: string
  className?: string
  /** Couleur du mot « Winou » ; le point reste terracotta. */
  tone?: 'ink' | 'terracotta'
}

export function Logo({ href = '/', className, tone = 'ink' }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${BRAND}, accueil`}
      className={cn(
        'font-display text-2xl font-bold tracking-tight',
        tone === 'ink' ? 'text-foreground' : 'text-terracotta',
        className,
      )}
    >
      {BRAND}
      <span className="text-terracotta">.</span>
    </Link>
  )
}
