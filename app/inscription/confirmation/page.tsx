import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { PLANS, TRIAL_DAYS } from '@/lib/data/plans'

export const metadata: Metadata = {
  title: 'Inscription confirmée',
}

const featuredPlan = PLANS.find((plan) => plan.popular) ?? PLANS[0]

function getTrialEndDate() {
  const date = new Date()
  date.setDate(date.getDate() + TRIAL_DAYS)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default function ConfirmationPage() {
  const trialEndDate = getTrialEndDate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground sm:px-6">
      <section className="w-full max-w-xl rounded-[2rem] border border-border bg-card p-7 text-center shadow-sm sm:p-12">
        <Logo href="/" className="mx-auto mb-10 flex w-fit" />

        <div className="relative mx-auto flex size-20 items-center justify-center rounded-full bg-olive/10 text-olive">
          <span className="absolute inset-0 rounded-full border border-olive/20" aria-hidden />
          <Check className="size-10" strokeWidth={2.5} />
        </div>
        <p className="eyebrow mt-7">Inscription confirmée</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Bienvenue sur Blayes !
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground">
          Ton essai gratuit de {TRIAL_DAYS} jours a commencé. Profite pleinement de ta présence sur
          Blayes dès aujourd’hui.
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-2xl bg-secondary/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Fin de l’essai
            </p>
            <p className="mt-2 font-display text-xl font-semibold capitalize">{trialEndDate}</p>
          </div>
          <div className="rounded-2xl bg-olive p-4 text-primary-foreground">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground/70">
              Ton offre
            </p>
            <p className="mt-2 font-display text-xl font-semibold">{featuredPlan.name}</p>
            <p className="mt-1 text-sm text-primary-foreground/75">
              {featuredPlan.pricePerYear} DT / an après l’essai
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Accéder à mon dashboard
          </Link>
          <Link
            href="/restauration/le-petit-souk"
            className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold text-terracotta transition-colors hover:bg-secondary"
          >
            Voir ma fiche publique
          </Link>
        </div>
        <p className="mt-7 text-xs leading-5 text-muted-foreground">
          Tu peux gérer ton offre et tes informations à tout moment depuis ton dashboard.
        </p>
      </section>
    </main>
  )
}
