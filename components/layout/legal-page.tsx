import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_strong]:text-foreground">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export function legalMetadata(title: string): Metadata {
  return { title }
}
