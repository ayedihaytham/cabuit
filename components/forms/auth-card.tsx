import type { ReactNode } from 'react'
import { Logo } from '@/components/layout/logo'

type AuthCardProps = {
  badge: ReactNode
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

/** Gabarit commun des écrans de connexion / inscription. */
export function AuthCard({ badge, title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="min-h-screen bg-secondary px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <Logo href="/" className="mx-auto text-3xl" />

        <div className="mt-8 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center">
            {badge}
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>

        <div className="mt-6 space-y-3 text-center">{footer}</div>
      </div>
    </main>
  )
}
