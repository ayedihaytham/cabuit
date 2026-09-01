import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { PageHead, Card } from '@/components/app/ui'
import { BusinessForm } from '@/components/dashboard/business-form'
import { createBusiness } from '@/app/actions/business'
import { requireMerchant } from '@/lib/session'
import { MERCHANT_NAV } from '@/lib/nav'

export const dynamic = 'force-dynamic'

export default async function NewBusinessPage() {
  const user = await requireMerchant()

  return (
    <AppShell
      roleLabel="Espace commerçant"
      userName={user.name ?? user.email}
      homeHref="/dashboard"
      nav={MERCHANT_NAV}
      activeKey="etablissements"
    >
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta"
      >
        <ArrowLeft className="size-4" /> Retour
      </Link>
      <PageHead
        title="Nouvel établissement"
        subtitle="Renseignez les informations de base. Vous choisirez votre offre et enverrez la fiche à validation à l’étape suivante."
      />
      <Card className="max-w-3xl">
        <BusinessForm action={createBusiness} submitLabel="Créer le brouillon" />
      </Card>
    </AppShell>
  )
}
