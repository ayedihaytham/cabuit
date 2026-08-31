'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, UserRound } from 'lucide-react'
import { AuthCard } from '@/components/forms/auth-card'
import { PasswordInput } from '@/components/forms/password-input'

export default function InscriptionClientPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <AuthCard
      badge={
        <span className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-olive">
          <UserRound className="size-3.5" /> Espace client
        </span>
      }
      title="Créer ton compte"
      subtitle="Découvre les commerces locaux que tu aimes et garde tes favoris à portée de main."
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/connexion-client" className="font-bold text-terracotta hover:underline">
              Se connecter
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Tu es commerçant ?{' '}
            <Link href="/connexion" className="font-semibold text-olive hover:underline">
              Accéder à l’espace pro
            </Link>
          </p>
        </>
      }
    >
      {submitted ? (
        <div className="mt-8 rounded-2xl bg-olive/10 p-5 text-center" role="status">
          <Check className="mx-auto size-8 text-olive" />
          <p className="mt-3 font-semibold">Compte créé avec succès</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-terracotta">
            Découvrir Blayes <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="field-label">
            Nom complet
            <input className="field-input" name="name" autoComplete="name" required placeholder="Ton nom" />
          </label>
          <label className="field-label">
            Email ou téléphone
            <input
              className="field-input"
              name="contact"
              autoComplete="email tel"
              required
              placeholder="toi@exemple.com"
            />
          </label>
          <label className="field-label">
            Mot de passe
            <PasswordInput
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="8 caractères minimum"
            />
          </label>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5"
          >
            Créer mon compte <ArrowRight className="size-4" />
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
        </form>
      )}
    </AuthCard>
  )
}
