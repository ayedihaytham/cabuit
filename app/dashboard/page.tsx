'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  ImagePlus,
  Megaphone,
  Menu,
  MessageCircle,
  Pencil,
  Save,
  Settings,
  Store,
  Upload,
} from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { PLANS, TRIAL_DAYS } from '@/lib/data/plans'

const featuredPlan = PLANS.find((plan) => plan.popular) ?? PLANS[0]

type NavItem = { label: string; icon: typeof Store; href?: string }

const NAV_ITEMS: NavItem[] = [
  { label: 'Ma fiche', icon: Store },
  { label: 'Mon menu', icon: BookOpen },
  { label: 'Statistiques', icon: BarChart3 },
  { label: 'Mon abonnement', icon: Settings },
  { label: 'Espace pub', icon: Megaphone, href: '/dashboard/espace-pub' },
]

const MENU_ITEMS = [
  { name: "Brik à l'œuf", category: 'Entrées', price: '7 DT', description: 'Feuilleté croustillant, œuf, thon et câpres.' },
  { name: 'Couscous du Souk', category: 'Plats', price: '24 DT', description: 'Couscous maison, légumes de saison et agneau confit.' },
  { name: 'Poulpe grillé', category: 'Plats', price: '32 DT', description: 'Poulpe tendre, harissa douce et citron confit.' },
  { name: "Crème à la fleur d'oranger", category: 'Desserts', price: '10 DT', description: 'Crème légère, pistaches et éclats de meringue.' },
]

const INITIAL_PHOTOS = [
  '/images/petit-souk-interior.png',
  '/images/petit-souk-dish.png',
  '/images/petit-souk-dessert.png',
  '/images/restaurant.png',
]

export default function DashboardPage() {
  const [active, setActive] = useState<string>('Ma fiche')
  const [mobileNav, setMobileNav] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 px-4 py-4 backdrop-blur sm:px-6 lg:hidden">
        <div className="flex items-center justify-between">
          <Logo className="text-terracotta" tone="terracotta" />
          <button
            type="button"
            onClick={() => setMobileNav((open) => !open)}
            aria-label="Ouvrir le menu"
            className="rounded-full border border-border p-2"
          >
            <Menu className="size-5" />
          </button>
        </div>
        {mobileNav && (
          <nav className="mt-4 flex flex-col gap-1 border-t border-border pt-3">
            {NAV_ITEMS.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActive(item.label)
                    setMobileNav(false)
                  }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${
                    active === item.label ? 'bg-terracotta text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              ),
            )}
          </nav>
        )}
      </header>

      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card p-6 lg:flex lg:flex-col">
          <Logo className="mb-12 text-3xl text-terracotta" tone="terracotta" />
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-background p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-olive text-sm font-semibold text-primary-foreground">
              PS
            </div>
            <div>
              <p className="text-sm font-semibold">Le Petit Souk</p>
              <p className="text-xs text-muted-foreground">La Marsa, Tunisie</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActive(item.label)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active === item.label
                      ? 'bg-terracotta text-primary-foreground'
                      : 'text-muted-foreground hover:bg-background hover:text-foreground'
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              ),
            )}
          </nav>
          <div className="mt-auto flex flex-col gap-4">
            <Link
              href="/restauration/le-petit-souk"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-terracotta"
            >
              <ExternalLink className="size-4" /> Voir ma fiche publique
            </Link>
            <div className="flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <Bell className="size-4" /> Notifications
              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-terracotta text-[10px] text-primary-foreground">
                2
              </span>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-6xl">
            {active === 'Ma fiche' && <FicheTab />}
            {active === 'Mon menu' && <MenuTab />}
            {active === 'Statistiques' && <StatsTab />}
            {active === 'Mon abonnement' && <AbonnementTab />}
          </div>
        </main>
      </div>
    </div>
  )
}

function FicheTab() {
  const [saved, setSaved] = useState(false)
  const [photos, setPhotos] = useState<string[]>(INITIAL_PHOTOS)

  const addPhoto = () => {
    if (photos.length < 8) setPhotos((current) => [...current, '/images/cafe.png'])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Votre présence sur Blayes</p>
          <h1 className="font-display text-4xl text-foreground">Ma fiche</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gardez vos informations à jour pour être mieux trouvé.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Save className="size-4" /> {saved ? 'Modifications enregistrées' : 'Enregistrer'}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label sm:col-span-2">
              Nom du commerce
              <input className="field-input" defaultValue="Le Petit Souk" />
            </label>
            <label className="field-label">
              Catégorie
              <select className="field-input" defaultValue={CATEGORIES[0]}>
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Ville
              <select className="field-input" defaultValue="La Marsa">
                {CITIES.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
            <label className="field-label sm:col-span-2">
              Adresse
              <input className="field-input" defaultValue="12, rue des Jasmins, La Marsa" />
            </label>
            <label className="field-label sm:col-span-2">
              Description
              <textarea
                className="field-input min-h-28 resize-y"
                defaultValue="Une table de quartier généreuse et créative, où les recettes tunisiennes rencontrent les envies du moment."
              />
            </label>
            <label className="field-label">
              Téléphone
              <input className="field-input" defaultValue="+216 71 742 890" />
            </label>
            <label className="field-label">
              WhatsApp
              <input className="field-input" defaultValue="+216 98 456 789" />
            </label>
            <label className="field-label">
              Instagram
              <input className="field-input" defaultValue="@lepetitsouk.tn" />
            </label>
            <label className="field-label">
              Facebook
              <input className="field-input" defaultValue="Le Petit Souk" />
            </label>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Photos</h2>
              <p className="text-sm text-muted-foreground">{photos.length}/8 images</p>
            </div>
            <button
              type="button"
              onClick={addPhoto}
              disabled={photos.length >= 8}
              className="rounded-full border border-border p-2 text-terracotta disabled:opacity-40"
              aria-label="Ajouter une photo"
            >
              <ImagePlus className="size-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div key={`${photo}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl">
                <Image src={photo} alt={`Photo ${index + 1} du Petit Souk`} fill sizes="160px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((current) => current.filter((_, item) => item !== index))}
                  className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1.5 text-background opacity-0 transition group-hover:opacity-100"
                  aria-label="Supprimer la photo"
                >
                  <Upload className="size-3 rotate-180" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPhoto}
            disabled={photos.length >= 8}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-terracotta/50 px-3 py-4 text-sm font-medium text-terracotta transition hover:bg-terracotta/5 disabled:opacity-40"
          >
            <Upload className="size-4" /> Ajouter une photo
          </button>
        </section>
      </div>
    </div>
  )
}

function MenuTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Votre carte</p>
        <h1 className="font-display text-4xl text-foreground">Mon menu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Présentez vos incontournables aux visiteurs de Blayes.
        </p>
      </div>
      <section className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Plats publiés</h2>
          <button
            type="button"
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            + Ajouter un plat
          </button>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {MENU_ITEMS.map((item) => (
            <div key={item.name} className="flex items-start justify-between gap-4 py-5 first:pt-0 last:pb-0">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className="rounded-full bg-ochre/15 px-2 py-0.5 text-xs text-ochre">{item.category}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <strong className="whitespace-nowrap text-terracotta">{item.price}</strong>
                <button
                  type="button"
                  aria-label={`Modifier ${item.name}`}
                  className="rounded-full border border-border p-2"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatsTab() {
  const bars = [35, 48, 40, 62, 55, 75, 68, 82, 70, 88, 78, 96]
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Du 1 au 31 août 2026</p>
        <h1 className="font-display text-4xl text-foreground">Statistiques</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Suivez la visibilité de votre commerce sur Blayes.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-border bg-card p-6">
          <div className="mb-10 flex items-center justify-between">
            <span className="rounded-xl bg-terracotta/10 p-3 text-terracotta">
              <Store className="size-5" />
            </span>
            <span className="text-sm font-semibold text-olive">+18,4%</span>
          </div>
          <p className="text-4xl font-semibold">1 284</p>
          <p className="mt-1 text-sm text-muted-foreground">Vues du profil ce mois-ci</p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-card p-6">
          <div className="mb-10 flex items-center justify-between">
            <span className="rounded-xl bg-olive/10 p-3 text-olive">
              <MessageCircle className="size-5" />
            </span>
            <span className="text-sm font-semibold text-olive">+9,2%</span>
          </div>
          <p className="text-4xl font-semibold">347</p>
          <p className="mt-1 text-sm text-muted-foreground">Clics sur le bouton contact</p>
        </div>
      </div>
      <section className="rounded-[1.5rem] border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">Activité récente</h2>
        <div className="flex h-48 items-end gap-2">
          {bars.map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-lg bg-terracotta/75" style={{ height: `${height}%` }} />
              <span className="text-[10px] text-muted-foreground">{index + 1}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function AbonnementTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Votre formule Blayes</p>
        <h1 className="font-display text-4xl text-foreground">Mon abonnement</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tout ce qu’il faut pour faire grandir votre commerce.
        </p>
      </div>
      <section className="max-w-2xl rounded-[1.5rem] border border-terracotta/30 bg-terracotta/5 p-6 sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-olive/15 px-3 py-1 text-xs font-semibold text-olive">
              <Check className="size-3" /> Abonnement actif
            </span>
            <h2 className="font-display text-3xl">{featuredPlan.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre commerce est visible auprès des clients de votre zone.
            </p>
          </div>
          <strong className="whitespace-nowrap text-xl text-terracotta">
            {featuredPlan.pricePerYear} DT
            <span className="text-sm font-normal text-muted-foreground">/an</span>
          </strong>
        </div>
        <div className="mb-8 flex items-center gap-3 rounded-xl bg-background p-4">
          <Clock3 className="size-5 text-terracotta" />
          <div>
            <p className="text-sm font-semibold">Essai gratuit en cours</p>
            <p className="text-sm text-muted-foreground">
              Votre essai de {TRIAL_DAYS} jours se termine le 15 septembre 2026
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Gérer mon abonnement <ChevronRight className="size-4" />
        </button>
      </section>
    </div>
  )
}
