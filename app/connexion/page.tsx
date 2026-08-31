'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Store } from 'lucide-react'
import { AuthCard } from '@/components/forms/auth-card'
import { PasswordInput } from '@/components/forms/password-input'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function ConnexionPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <AuthCard
      badge={
        <span className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
          <Store className="size-3.5" /> Espace commerçant
        </span>
      }
      title="Ravi de vous revoir."
      subtitle="Connectez-vous pour gérer votre fiche et développer votre visibilité."
      footer={
        <p className="text-sm text-muted-foreground">
          Pas encore inscrit ?{' '}
          <Link href="/inscription" className="font-bold text-terracotta hover:underline">
            Créer ma fiche commerce
          </Link>
        </p>
      }
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="field-label">
          Email ou téléphone
          <input
            className="field-input"
            name="identifier"
            autoComplete="username"
            required
            placeholder="bonjour@commerce.tn"
          />
        </label>
        <label className="field-label">
          Mot de passe
          <PasswordInput autoComplete="current-password" required placeholder="Votre mot de passe" />
        </label>
        <div className="text-right">
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Mot%20de%20passe%20oublié`}
            className="text-sm font-semibold text-terracotta hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5"
        >
          {submitted ? 'Demande envoyée' : 'Se connecter'}
          {!submitted && <ArrowRight className="size-4" />}
        </button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          className="w-full rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-secondary"
        >
          Continuer avec Google
        </button>
        {submitted && (
          <p className="text-center text-sm text-olive" role="status">
            Mode démo : votre demande de connexion a bien été prise en compte.
          </p>
        )}
      </form>
    </AuthCard>
  )
}
