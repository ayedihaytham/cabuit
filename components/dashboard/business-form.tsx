'use client'

import { useActionState } from 'react'
import { Check } from 'lucide-react'
import type { FormState } from '@/app/actions/business'
import { GOVERNORATES } from '@/lib/regions'

type Values = {
  name?: string
  category?: string
  type?: string
  region?: string
  city?: string
  address?: string
  description?: string
  phone?: string
  whatsapp?: string
  instagram?: string
}

type BusinessFormProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  values?: Values
  submitLabel: string
}

const CATEGORY_OPTIONS = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'CAFE', label: 'Café / Salon de thé' },
]

export function BusinessForm({ action, values = {}, submitLabel }: BusinessFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})
  const err = (field: string) => state.fieldErrors?.[field]?.[0]

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <Field label="Nom de l'établissement" name="name" defaultValue={values.name} error={err('name')} required className="sm:col-span-2" />

      <label className="field-label">
        Catégorie
        <select name="category" defaultValue={values.category ?? 'RESTAURANT'} className="field-input">
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <Field label="Type" name="type" placeholder="Cuisine tunisienne, Salon de thé…" defaultValue={values.type} error={err('type')} required />

      <label className="field-label">
        Gouvernorat <span className="text-terracotta">*</span>
        <select name="region" defaultValue={values.region ?? ''} className="field-input" required>
          <option value="" disabled>
            Choisir…
          </option>
          {GOVERNORATES.map((g) => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
        {err('region') && <span className="text-xs font-medium text-destructive">{err('region')}</span>}
      </label>

      <Field label="Ville / quartier" name="city" placeholder="La Marsa" defaultValue={values.city} error={err('city')} required />
      <Field label="Adresse" name="address" placeholder="12 rue des Jasmins" defaultValue={values.address} error={err('address')} required />

      <label className="field-label sm:col-span-2">
        Description
        <textarea name="description" defaultValue={values.description} className="field-input min-h-28 resize-y" required />
        {err('description') && <span className="text-xs font-medium text-destructive">{err('description')}</span>}
      </label>

      <Field label="Téléphone" name="phone" placeholder="+216 71 000 000" defaultValue={values.phone} error={err('phone')} />
      <Field label="WhatsApp" name="whatsapp" placeholder="21620000000" defaultValue={values.whatsapp} error={err('whatsapp')} />
      <Field label="Instagram" name="instagram" placeholder="@moncommerce" defaultValue={values.instagram} error={err('instagram')} className="sm:col-span-2" />

      {state.error && (
        <p className="sm:col-span-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{state.error}</p>
      )}
      {state.ok && (
        <p className="sm:col-span-2 inline-flex items-center gap-2 rounded-xl bg-olive/10 px-4 py-3 text-sm font-medium text-olive">
          <Check className="size-4" /> Modifications enregistrées.
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? 'Enregistrement…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  error,
  required,
  className,
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  error?: string
  required?: boolean
  className?: string
}) {
  return (
    <label className={`field-label ${className ?? ''}`}>
      {label} {required && <span className="text-terracotta">*</span>}
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} required={required} className="field-input" />
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </label>
  )
}
