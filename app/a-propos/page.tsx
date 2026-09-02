import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Compass, Heart, Store } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Winou aide les restaurants et cafés / salons de thé locaux à être plus proches de leurs clients.',
}

const steps = [
  {
    title: 'Le commerçant crée sa fiche',
    text: 'Il présente son univers, sa carte et ses bons plans.',
    icon: Store,
  },
  {
    title: 'Les clients découvrent son commerce',
    text: 'Ils trouvent les adresses qui leur ressemblent, près de chez eux.',
    icon: Compass,
  },
  {
    title: 'Le commerçant gagne en visibilité',
    text: 'Plus de découverte, plus de rencontres et une communauté fidèle.',
    icon: Heart,
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pt-24">
        <p className="eyebrow">À propos de Winou</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.98] tracking-tight sm:text-7xl">
          Les belles adresses commencent <span className="text-terracotta">près de chez toi.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
          Winou aide les restaurants et les cafés / salons de thé de Tunisie à être plus proches de
          leurs clients. Une vitrine simple, humaine et faite pour donner envie de pousser la porte.
        </p>
      </section>

      <section className="bg-olive px-5 py-16 text-primary-foreground sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary-foreground/60">
            Notre mission
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            Faire grandir le local, une rencontre à la fois.
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-7 text-primary-foreground/75">
            Nous croyons que les commerces de quartier méritent d’être trouvés aussi facilement que
            les grandes enseignes. Winou met leur savoir-faire au premier plan et rapproche les
            habitants de ce qui rend leur ville unique.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Comment ça marche</p>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl">
          Simple comme bonjour<span className="text-terracotta">.</span>
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ title, text, icon: Icon }, index) => (
            <article key={title} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                <Icon className="size-5" />
              </span>
              <p className="mt-8 text-sm font-bold text-ochre">0{index + 1}</p>
              <h3 className="mt-2 font-display text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>

        <Link
          href="/contact"
          className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:underline"
        >
          Nous contacter <ArrowRight className="size-4" />
        </Link>
      </section>

      <SiteFooter />
    </div>
  )
}
