'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Crown, ShieldCheck, Sparkles } from 'lucide-react'
import { PLANS } from '@/lib/data/plans'

const ICONS = [ShieldCheck, Sparkles, Crown]

export function PlanSelect() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <section className="mx-auto grid max-w-7xl items-stretch gap-5 px-5 pb-20 sm:px-8 lg:grid-cols-3 lg:gap-6">
      {PLANS.map((plan, index) => {
        const Icon = ICONS[index] ?? ShieldCheck
        const isSelected = selected === plan.name

        return (
          <article
            key={plan.name}
            className={`relative flex flex-col rounded-[1.75rem] border p-6 transition sm:p-8 ${
              plan.popular
                ? 'border-terracotta bg-terracotta text-primary-foreground shadow-[0_22px_55px_-22px_rgba(168,78,48,0.65)] lg:-mt-5 lg:mb-5'
                : 'border-border bg-card hover:-translate-y-1 hover:shadow-lg'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ochre px-4 py-1.5 text-xs font-bold text-foreground shadow-sm">
                Le plus choisi
              </div>
            )}

            <div className="mb-8 flex items-start justify-between">
              <div
                className={`flex size-11 items-center justify-center rounded-2xl ${
                  plan.popular ? 'bg-primary-foreground/15' : 'bg-terracotta/10 text-terracotta'
                }`}
              >
                <Icon className="size-5" />
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  plan.popular
                    ? 'bg-primary-foreground/15 text-primary-foreground'
                    : 'bg-olive/10 text-olive'
                }`}
              >
                {plan.name}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl">{plan.pricePerYear}</span>
                <span className={`text-sm ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  DT / an
                </span>
              </div>
              <p
                className={`mt-3 min-h-12 text-sm leading-6 ${
                  plan.popular ? 'text-primary-foreground/75' : 'text-muted-foreground'
                }`}
              >
                {plan.description}
              </p>
            </div>

            <div className={`my-7 h-px ${plan.popular ? 'bg-primary-foreground/20' : 'bg-border'}`} />

            <ul className="flex flex-1 flex-col gap-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-5">
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                      plan.popular ? 'bg-primary-foreground/15' : 'bg-olive/10 text-olive'
                    }`}
                  >
                    <Check className="size-3" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setSelected(plan.name)}
              className={`mt-9 w-full rounded-full px-5 py-3.5 text-sm font-bold transition ${
                plan.popular
                  ? 'bg-primary-foreground text-terracotta hover:bg-primary-foreground/90'
                  : 'bg-foreground text-background hover:opacity-90'
              }`}
            >
              {isSelected ? 'Offre sélectionnée' : "Commencer l'essai gratuit"}
            </button>

            {isSelected && (
              <Link
                href={`/paiement?offre=${encodeURIComponent(plan.name)}`}
                className={`mt-3 block w-full rounded-full border px-5 py-3 text-center text-sm font-semibold transition ${
                  plan.popular
                    ? 'border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10'
                    : 'border-border text-foreground hover:bg-secondary'
                }`}
              >
                Continuer vers le paiement
              </Link>
            )}
          </article>
        )
      })}
    </section>
  )
}
