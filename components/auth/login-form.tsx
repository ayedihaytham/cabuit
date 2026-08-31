'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowRight } from 'lucide-react'
import { PasswordInput } from '@/components/forms/password-input'
import { CONTACT_EMAIL } from '@/lib/constants'

type LoginFormProps = {
  /** `pro` = commerçant / admin -> /dashboard ; `client` -> /espace-client */
  variant: 'pro' | 'client'
  googleEnabled?: boolean
}

export function LoginForm({ variant, googleEnabled = false }: LoginFormProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const fallback = variant === 'pro' ? '/dashboard' : '/espace-client'
  const next = params.get('next') || fallback

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

    setPending(false)

    if (!result || result.error) {
      setError('Email ou mot de passe incorrect.')
      return
    }
    router.push(next)
    router.refresh()
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
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Mot%20de%20passe%20oublié`}
          className="text-sm font-semibold text-terracotta hover:underline"
        >
          Mot de passe oublié ?
        </a>
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
            onClick={() => signIn('google', { redirectTo: next })}
            className="w-full rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-secondary"
          >
            Continuer avec Google
          </button>
        </>
      )}
    </form>
  )
}
