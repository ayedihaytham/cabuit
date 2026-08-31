'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import type { Plan } from '@/lib/types'

const inputClass =
  'rounded-xl border border-input bg-background px-4 py-3 font-normal outline-none transition placeholder:text-muted-foreground/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20'

export function PaymentForm({ plan }: { plan: Plan }) {
  const [confirmed, setConfirmed] = useState(false)

  if (confirmed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
        <section className="w-full max-w-lg rounded-[1.75rem] border border-border bg-card p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-olive/10 text-olive">
            <CheckCircle2 className="size-8" />
          </div>
          <p className="eyebrow mt-6">Paiement confirmé</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">
            Tout est en ordre<span className="text-terracotta">.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Ton abonnement {plan.name} est activé pour un an. Tu peux maintenant accéder à ton espace
            commerçant.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-full bg-terracotta px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Accéder à mon dashboard
          </Link>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link
          href="/tarifs"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Retour
        </Link>
        <Logo href="/" className="text-terracotta" tone="terracotta" />
        <span className="w-16 sm:w-24" aria-hidden />
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 pb-12 pt-6 sm:px-8 sm:pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
        <section className="h-fit rounded-[1.5rem] border border-border bg-card p-6 sm:p-8 lg:sticky lg:top-6">
          <p className="eyebrow">Récapitulatif</p>
          <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight">
            Ton offre Blayes<span className="text-terracotta">.</span>
          </h1>
          <div className="mt-8 rounded-2xl bg-secondary/70 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Abonnement commerçant annuel</p>
              </div>
              <span className="rounded-full bg-terracotta px-3 py-1 text-xs font-bold text-primary-foreground">
                {plan.pricePerYear} DT
              </span>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durée</span>
                <span className="font-medium">Annuelle</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total après essai</span>
                <span className="font-semibold">{plan.pricePerYear} DT / an</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-olive/20 bg-olive/5 p-4 text-sm leading-5 text-olive">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" />
            <span>Aucun prélèvement pendant ton essai gratuit.</span>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <LockKeyhole className="size-5" />
            </div>
            <div>
              <p className="eyebrow">Paiement sécurisé</p>
              <h2 className="text-2xl font-semibold">Tes informations de paiement</h2>
            </div>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setConfirmed(true)
            }}
            className="flex flex-col gap-5"
          >
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Nom sur la carte
              <input required name="cardName" placeholder="Ex. Amira Ben Salem" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Numéro de carte
              <input
                required
                name="cardNumber"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                className={`${inputClass} tracking-wider`}
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Date d’expiration
                <input required name="expiry" placeholder="MM / AA" className={inputClass} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold">
                CVV
                <input required name="cvv" inputMode="numeric" maxLength={4} placeholder="123" className={inputClass} />
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="size-3.5 text-olive" /> Paiement sécurisé, tes données sont protégées.
            </div>
            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-terracotta px-5 py-4 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Confirmer le paiement — {plan.pricePerYear} DT / an
            </button>
            <p className="text-center text-xs leading-5 text-muted-foreground">
              En confirmant, tu acceptes les conditions générales de Blayes.
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
