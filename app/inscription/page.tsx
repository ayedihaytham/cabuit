'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ImagePlus,
  Link2,
  MapPin,
  Phone,
  Store,
  Upload,
  Utensils,
  X,
} from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { TextField } from '@/components/forms/text-field'
import { SelectField } from '@/components/forms/select-field'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { PLANS, TRIAL_DAYS, formatYearlyPrice } from '@/lib/data/plans'

const STEPS = ['Infos générales', 'Description & contact', 'Photos', 'Récapitulatif']
const MAX_PHOTOS = 8
const featuredPlan = PLANS.find((plan) => plan.popular) ?? PLANS[0]

type FormState = {
  name: string
  category: string
  city: string
  address: string
  description: string
  phone: string
  whatsapp: string
  instagram: string
  facebook: string
}

const EMPTY_FORM: FormState = {
  name: '',
  category: '',
  city: '',
  address: '',
  description: '',
  phone: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
}

export default function InscriptionPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [photos, setPhotos] = useState<string[]>([])

  const progress = `${step + 1}/${STEPS.length}`
  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(form.name && form.category && form.city && form.address)
    if (step === 1) return Boolean(form.description && form.phone)
    return true
  }, [form, step])

  const updateField = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  function handlePhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS - photos.length)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => setPhotos((current) => [...current, String(reader.result)])
      reader.readAsDataURL(file)
    })
    event.target.value = ''
  }

  const next = () => {
    if (canContinue) setStep((current) => Math.min(STEPS.length - 1, current + 1))
  }
  const back = () => setStep((current) => Math.max(0, current - 1))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo />
          <span className="hidden text-sm text-muted-foreground sm:block">
            Déjà inscrit ?{' '}
            <Link href="/connexion" className="font-bold text-terracotta hover:underline">
              Accéder à mon espace
            </Link>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-9 max-w-2xl">
          <p className="eyebrow">Pour les commerçants locaux</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Faites découvrir votre adresse aux bonnes personnes.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Créez votre fiche en quelques minutes et rejoignez les restaurants et cafés qui font
            vibrer la Tunisie.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[250px_1fr] lg:items-start">
          <nav aria-label="Progression de l'inscription" className="lg:sticky lg:top-8">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <span className="eyebrow">Étape {progress}</span>
              <span className="text-sm text-muted-foreground">{STEPS[step]}</span>
            </div>
            <ol className="flex gap-2 lg:flex-col lg:gap-0">
              {STEPS.map((label, index) => {
                const active = index === step
                const done = index < step
                return (
                  <li key={label} className="flex flex-1 items-center gap-3 lg:flex-none lg:py-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
                        done
                          ? 'border-olive bg-olive text-primary-foreground'
                          : active
                            ? 'border-terracotta bg-terracotta text-primary-foreground'
                            : 'border-border bg-card text-muted-foreground'
                      }`}
                      aria-current={active ? 'step' : undefined}
                    >
                      {done ? <Check className="size-4" /> : index + 1}
                    </div>
                    <span
                      className={`hidden text-sm lg:block ${
                        active ? 'font-bold text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </nav>

          <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="eyebrow">Étape {progress}</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">{STEPS[step]}</h2>
              </div>
              <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground sm:block">
                Inscription gratuite
              </span>
            </div>

            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Nom du commerce"
                  required
                  value={form.name}
                  onChange={(value) => updateField('name', value)}
                  placeholder="Ex. Le Petit Souk"
                  icon={<Store className="size-4" />}
                />
                <SelectField
                  label="Catégorie"
                  required
                  value={form.category}
                  onChange={(value) => updateField('category', value)}
                  options={CATEGORIES}
                  placeholder="Choisir une catégorie"
                  icon={<Utensils className="size-4" />}
                />
                <SelectField
                  label="Ville"
                  required
                  value={form.city}
                  onChange={(value) => updateField('city', value)}
                  options={CITIES}
                  placeholder="Choisir une ville"
                  icon={<MapPin className="size-4" />}
                />
                <div className="sm:col-span-2">
                  <TextField
                    label="Adresse"
                    required
                    value={form.address}
                    onChange={(value) => updateField('address', value)}
                    placeholder="Ex. 12 rue des Jasmins, La Marsa"
                    icon={<MapPin className="size-4" />}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold" htmlFor="description">
                    Description courte <span className="text-terracotta">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    maxLength={240}
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="Présentez votre commerce en quelques mots…"
                    className="min-h-32 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {form.description.length}/240
                  </p>
                </div>
                <TextField
                  label="Téléphone"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(value) => updateField('phone', value)}
                  placeholder="+216 71 000 000"
                  icon={<Phone className="size-4" />}
                />
                <TextField
                  label="WhatsApp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={(value) => updateField('whatsapp', value)}
                  placeholder="+216 20 000 000"
                  icon={<span className="text-xs font-bold">WA</span>}
                />
                <TextField
                  label="Instagram"
                  value={form.instagram}
                  onChange={(value) => updateField('instagram', value)}
                  placeholder="@moncommerce"
                  icon={<Link2 className="size-4" />}
                />
                <TextField
                  label="Facebook"
                  value={form.facebook}
                  onChange={(value) => updateField('facebook', value)}
                  placeholder="facebook.com/moncommerce"
                  icon={<Link2 className="size-4" />}
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="rounded-2xl border border-dashed border-terracotta/40 bg-terracotta/5 p-7 text-center sm:p-10">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-card text-terracotta">
                    <Upload className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold">Ajoutez les photos de votre commerce</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Jusqu’à {MAX_PHOTOS} images · JPG, PNG · 10 Mo maximum par image
                  </p>
                  <label
                    htmlFor="photos"
                    className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
                  >
                    <ImagePlus className="size-4" /> Choisir des photos
                  </label>
                  <input
                    id="photos"
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    className="sr-only"
                    onChange={handlePhotos}
                  />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((photo, index) => (
                    <div
                      key={`${photo.slice(0, 24)}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
                    >
                      {/* Aperçu local (data URL) : next/image n'est pas adapté ici. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={`Photo ${index + 1} du commerce`} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((current) => current.filter((_, item) => item !== index))}
                        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Supprimer la photo ${index + 1}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-border bg-background text-muted-foreground"
                    >
                      <ImagePlus className="size-5" />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {photos.length}/{MAX_PHOTOS} photos ajoutées
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="rounded-2xl bg-secondary/60 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Votre fiche
                    </h3>
                    <dl className="grid gap-3">
                      {[
                        ['Nom du commerce', form.name],
                        ['Catégorie', form.category],
                        ['Ville', form.city],
                        ['Adresse', form.address],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 text-sm last:border-0 last:pb-0"
                        >
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="max-w-[60%] text-right font-bold">{value || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="mt-5 rounded-2xl border border-border p-5">
                    <h3 className="text-sm font-bold">Description</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {form.description || 'Aucune description renseignée.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary px-3 py-1">
                        {form.phone || 'Téléphone à renseigner'}
                      </span>
                      {form.whatsapp && <span className="rounded-full bg-secondary px-3 py-1">WhatsApp</span>}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-olive p-6 text-primary-foreground">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground/70">
                    Offre de lancement
                  </p>
                  <h3 className="mt-4 font-display text-3xl font-semibold">
                    {featuredPlan.pricePerYear} DT
                    <span className="font-sans text-sm font-normal text-primary-foreground/70"> / an</span>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-primary-foreground/80">
                    {TRIAL_DAYS} jours d’essai gratuit, sans engagement.
                  </p>
                  <ul className="mt-6 grid gap-3 text-sm">
                    {featuredPlan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="size-4" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-muted-foreground transition hover:bg-secondary disabled:invisible"
              >
                <ArrowLeft className="size-4" /> Précédent
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canContinue}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant <ArrowRight className="size-4" />
                </button>
              ) : (
                <Link
                  href="/inscription/confirmation"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5"
                >
                  Valider mon inscription <Check className="size-4" />
                </Link>
              )}
            </div>
          </section>
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="size-4 text-olive" /> Vos informations sont vérifiées avant mise en
          ligne. {formatYearlyPrice(featuredPlan)} après l’essai.
        </p>
      </div>
    </div>
  )
}
