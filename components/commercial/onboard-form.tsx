'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Check, Copy } from 'lucide-react'
import { onboardBusiness, type OnboardState } from '@/app/actions/commercial'
import { GOVERNORATES } from '@/lib/regions'

const TYPE_SUGGESTIONS = [
  'Cuisine tunisienne',
  'Cuisine méditerranéenne',
  'Cuisine internationale',
  'Poissons & fruits de mer',
  'Grillades',
  'Pizzeria',
  'Fast-food',
  'Street food',
  'Pâtisserie / Salon de thé',
  'Brunch',
  'Café',
  'Coffee shop',
  'Salon de thé',
  'Café-restaurant',
  'Rooftop',
]

export function OnboardForm() {
  const [state, formAction, pending] = useActionState<OnboardState, FormData>(onboardBusiness, {})
  const err = (f: string) => state.fieldErrors?.[f]?.[0]

  if (state.ok && state.credentials) {
    return <CredentialsReceipt email={state.credentials.email} password={state.credentials.password} businessId={state.businessId!} />
  }

  const hasErrors = Boolean(state.error || (state.fieldErrors && Object.keys(state.fieldErrors).length))

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {hasErrors && (
        <div className="sm:col-span-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {state.error ?? 'Certains champs sont incomplets — voir les messages en rouge.'}
        </div>
      )}

      <p className="sm:col-span-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
        Le gérant
      </p>
      <F label="Nom du gérant" name="ownerName" error={err('ownerName')} required />
      <F label="Email du gérant" name="ownerEmail" type="email" error={err('ownerEmail')} required />
      <F label="Téléphone du gérant" name="ownerPhone" error={err('ownerPhone')} className="sm:col-span-2" />

      <p className="sm:col-span-2 mt-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
        L’établissement
      </p>
      <F label="Nom de l’établissement" name="name" error={err('name')} required className="sm:col-span-2" />

      <label className="field-label">
        Catégorie
        <select name="category" defaultValue="RESTAURANT" className="field-input">
          <option value="RESTAURANT">Restaurant</option>
          <option value="CAFE">Café / Salon de thé</option>
        </select>
      </label>

      <label className="field-label">
        Type <span className="text-terracotta">*</span>
        <input name="type" list="type-suggestions" required placeholder="Choisir ou saisir…" className={`field-input ${err('type') ? 'border-destructive' : ''}`} />
        <datalist id="type-suggestions">
          {TYPE_SUGGESTIONS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        {err('type') && <span className="text-xs font-medium text-destructive">{err('type')}</span>}
      </label>

      <label className="field-label">
        Gouvernorat <span className="text-terracotta">*</span>
        <select name="region" defaultValue="" required className={`field-input ${err('region') ? 'border-destructive' : ''}`}>
          <option value="" disabled>
            Choisir…
          </option>
          {GOVERNORATES.map((g) => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
        {err('region') && <span className="text-xs font-medium text-destructive">{err('region')}</span>}
      </label>

      <F label="Ville / quartier" name="city" error={err('city')} required />
      <F label="Adresse" name="address" error={err('address')} required className="sm:col-span-2" />

      <label className="field-label sm:col-span-2">
        Description
        <textarea name="description" required className={`field-input min-h-24 resize-y ${err('description') ? 'border-destructive' : ''}`} />
        <span className="text-xs text-muted-foreground">20 caractères minimum.</span>
        {err('description') && <span className="text-xs font-medium text-destructive">{err('description')}</span>}
      </label>

      <F label="Téléphone établissement" name="phone" error={err('phone')} />
      <F label="WhatsApp" name="whatsapp" error={err('whatsapp')} />
      <F label="Instagram" name="instagram" error={err('instagram')} className="sm:col-span-2" />

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ochre px-6 py-3 text-sm font-bold text-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? 'Création…' : 'Créer le compte et mettre en ligne'}
        </button>
      </div>
    </form>
  )
}

function F({
  label,
  name,
  type = 'text',
  error,
  required,
  className,
}: {
  label: string
  name: string
  type?: string
  error?: string
  required?: boolean
  className?: string
}) {
  return (
    <label className={`field-label ${className ?? ''}`}>
      {label} {required && <span className="text-terracotta">*</span>}
      <input name={name} type={type} required={required} className={`field-input ${error ? 'border-destructive' : ''}`} />
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </label>
  )
}

function CredentialsReceipt({ email, password, businessId }: { email: string; password: string; businessId: string }) {
  const text = `Winou — accès à votre espace\nIdentifiant : ${email}\nMot de passe temporaire : ${password}\nConnexion : ${typeof window !== 'undefined' ? window.location.origin : ''}/connexion`
  return (
    <div className="rounded-2xl border border-olive/30 bg-olive/[0.06] p-6">
      <p className="inline-flex items-center gap-2 font-display text-xl font-bold text-olive">
        <Check className="size-5" /> Fiche créée et en ligne
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Remettez ces identifiants au gérant. Il devra choisir un nouveau mot de passe à sa première
        connexion. Un email lui a aussi été envoyé.
      </p>
      <dl className="mt-4 space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Identifiant</dt>
          <dd className="font-mono font-semibold">{email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Mot de passe temporaire</dt>
          <dd className="font-mono font-semibold">{password}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(text)}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
        >
          <Copy className="size-4" /> Copier les identifiants
        </button>
        <Link href={`/commercial/${businessId}`} className="rounded-full bg-ochre px-5 py-2 text-sm font-bold text-foreground">
          Gérer la fiche
        </Link>
        <Link href="/commercial/nouveau" className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary">
          Onboarder un autre lieu
        </Link>
      </div>
    </div>
  )
}
