import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/dashboard/app-header'
import { BusinessForm } from '@/components/dashboard/business-form'
import { createBusiness } from '@/app/actions/business'
import { requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function NewBusinessPage() {
  const user = await requireUser(['MERCHANT'])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        label="Espace commerçant"
        userName={user.name ?? user.email}
        homeHref="/dashboard"
        backHref={{ href: '/dashboard', label: '← Tableau de bord' }}
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta">
          <ArrowLeft className="size-4" /> Retour
        </Link>
        <h1 className="mt-4 font-display text-4xl">Nouvel établissement</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Renseignez les informations de base. Vous choisirez votre offre et enverrez la fiche à
          validation à l’étape suivante.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
          <BusinessForm action={createBusiness} submitLabel="Créer le brouillon" />
        </div>
      </main>
    </div>
  )
}
