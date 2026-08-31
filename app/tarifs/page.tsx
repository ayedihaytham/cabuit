import type { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PlanSelect } from '@/components/pricing/plan-select'
import { TRIAL_DAYS } from '@/lib/data/plans'

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    'Des formules d’abonnement annuel pour mettre votre restaurant ou café en lumière auprès des clients qui cherchent près de chez eux.',
}

const faqs = [
  [
    "Puis-je changer d'offre ?",
    'Oui, vous pouvez changer de formule à tout moment depuis votre espace commerçant. La nouvelle offre est appliquée à votre prochain renouvellement annuel.',
  ],
  [
    "Comment fonctionne l'essai gratuit ?",
    `Chaque offre commence par un essai gratuit de ${TRIAL_DAYS} jours, sans engagement. Vous profitez de toutes les fonctionnalités de votre formule dès votre inscription.`,
  ],
  [
    "Puis-je annuler à tout moment ?",
    "Oui. L'annulation se fait en quelques clics et votre fiche reste active jusqu'à la fin de la période déjà réglée.",
  ],
  [
    'Le paiement est-il annuel ?',
    "Oui, l'abonnement Blayes se règle une fois par an. Les tarifs affichés sont les tarifs annuels, tous les services décrits inclus.",
  ],
]

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-10 text-center sm:px-8 sm:pt-16">
        <p className="eyebrow">Des formules pensées pour grandir</p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-5xl leading-[0.98] tracking-tight text-foreground sm:text-7xl">
          Choisis ton offre<span className="text-terracotta">.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          Toutes les offres incluent{' '}
          <strong className="font-semibold text-foreground">{TRIAL_DAYS} jours d’essai gratuit</strong>,
          sans engagement. Mets ton commerce en lumière auprès de ceux qui cherchent près de chez eux.
        </p>
      </section>

      <PlanSelect />

      <section className="border-t border-border bg-card/50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-9 text-center">
            <p className="eyebrow">Une question ?</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">
              Tout est clair<span className="text-terracotta">.</span>
            </h2>
          </div>
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-1">
                <summary className="flex cursor-pointer items-center justify-between gap-5 py-5 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{question}</span>
                  <ChevronDown className="size-5 shrink-0 text-terracotta transition-transform group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pb-5 pr-8 text-sm leading-6 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
