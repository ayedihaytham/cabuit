import { AppShell } from '@/components/app/app-shell'
import { PageHead } from '@/components/app/ui'
import { COMMERCIAL_NAV } from '@/lib/nav'
import { requireCommercial } from '@/lib/session'
import { OnboardForm } from '@/components/commercial/onboard-form'

export const dynamic = 'force-dynamic'

export default async function CommercialOnboardPage() {
  const user = await requireCommercial()

  return (
    <AppShell
      roleLabel="Espace commercial"
      accent="ochre"
      userName={user.name ?? user.email}
      homeHref="/commercial"
      nav={COMMERCIAL_NAV}
      activeKey="onboard"
    >
      <div className="mx-auto max-w-3xl">
        <PageHead
          eyebrow="Onboarding terrain"
          title="Nouvel établissement"
          subtitle="Créez le compte du gérant et publiez sa fiche en une fois. Elle est mise en ligne directement, avec 30 jours d’essai."
        />
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <OnboardForm />
        </div>
      </div>
    </AppShell>
  )
}
