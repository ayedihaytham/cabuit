'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowRight } from 'lucide-react'
import { PasswordInput } from '@/components/forms/password-input'

type LoginFormProps = {
  /** `pro` = commerçant / admin ; `client` = client. La destination dépend du rôle du compte. */
  variant: 'pro' | 'client'
  googleEnabled?: boolean
}

export function LoginForm({ variant, googleEnabled = false }: LoginFormProps) {
  const params = useSearchParams()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const HOME_BY_ROLE: Record<string, string> = {
    ADMIN: '/admin',
    MERCHANT: '/dashboard',
    CLIENT: '/espace-client',
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)

    const data = new FormData(event.currentTarget)
    const result = await signIn('credentials', {
      email: String(data.get('email') ?? '').trim().toLowerCase(),
      password: String(data.get('password') ?? ''),
      redirect: false,
    })

    if (!result || result.error) {
      setPending(false)
      setError('Email ou mot de passe incorrect.')
      return
    }

    // Destination : ?next explicite, sinon l'accueil du rôle (1 seul chargement,
    // plus de rebond par /apres-connexion).
    let target = params.get('next')
    if (!target) {
      const session = await fetch('/api/auth/session').then((r) => r.json()).catch(() => null)
      target = HOME_BY_ROLE[session?.user?.role] ?? '/'
    }
    window.location.assign(target)
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <label className="field-label">
        Email
        <input
          className="field-input"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={variant === 'pro' ? 'bonjour@commerce.tn' : 'toi@exemple.com'}
        />
      </label>

      <label className="field-label">
        Mot de passe
        <PasswordInput autoComplete="current-password" required placeholder="Votre mot de passe" />
      </label>

      <div className="text-right">
        <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-terracotta hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
        {!pending && <ArrowRight className="size-4" />}
      </button>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={() => signIn('google', { redirectTo: params.get('next') ?? '/apres-connexion' })}
            className="w-full rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-secondary"
          >
            Continuer avec Google
          </button>
        </>
      )}
    </form>
  )
}
