import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { Card } from '@/components/app/ui'
import { MERCHANT_NAV } from '@/lib/nav'
import { BankTransferForm } from '@/components/dashboard/bank-transfer-form'
import { requireMerchant } from '@/lib/session'
import { db } from '@/lib/db'
import { BANK_DETAILS } from '@/lib/constants'
import { SUB_STATUS_LABELS } from '@/lib/status'

export const metadata: Metadata = { title: 'Régler mon abonnement' }
export const dynamic = 'force-dynamic'

const fmt = (d: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(d)

export default async function PaiementPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>
}) {
  const user = await requireMerchant()
  const { business: businessId } = await searchParams

  const business = await db.business.findFirst({
    where: businessId
      ? { id: businessId, ownerId: user.id }
      : { ownerId: user.id, subscription: { status: { in: ['TRIALING', 'PENDING_PAYMENT', 'PAST_DUE'] } } },
    include: { subscription: { include: { payments: { orderBy: { createdAt: 'desc' } } } } },
  })
  if (!business || !business.subscription) notFound()

  const sub = business.subscription
  const pendingPayment = sub.payments.find((p) => p.status === 'PENDING')

  return (
    <AppShell
      roleLabel="Espace commerçant"
      userName={user.name ?? user.email}
      homeHref="/dashboard"
      nav={MERCHANT_NAV}
      activeKey="etablissements"
    >
      <Link href={`/dashboard/${business.id}`} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta">
        <ArrowLeft className="size-4" /> Retour à la fiche
      </Link>
      <h1 className="font-display text-4xl">Régler l’abonnement</h1>
      <p className="mt-2 text-sm text-muted-foreground">{business.name}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="h-fit">
          <p className="eyebrow">Votre offre</p>
          <p className="mt-2 font-display text-3xl font-bold">{sub.tier}</p>
          <p className="mt-1 text-lg font-semibold text-terracotta">{sub.pricePerYear} DT / an</p>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Statut</dt>
              <dd className="font-semibold">{SUB_STATUS_LABELS[sub.status]}</dd>
            </div>
            {sub.trialEndsAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fin de l’essai</dt>
                <dd className="font-semibold">{fmt(sub.trialEndsAt)}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-olive" />
            <h2 className="font-display text-2xl font-bold">Paiement par virement</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Effectuez un virement du montant ci-dessus, puis déclarez-le. L’équipe Winou le vérifie
            et active votre abonnement.
          </p>

          <div className="mt-5 rounded-2xl bg-secondary/60 p-4 text-sm">
            <Row k="Bénéficiaire" v={BANK_DETAILS.holder} />
            <Row k="Banque" v={BANK_DETAILS.bank} />
            <Row k="RIB" v={BANK_DETAILS.rib} />
            <Row k="IBAN" v={BANK_DETAILS.iban} />
            <Row k="Montant" v={`${sub.pricePerYear} DT`} />
            <Row k="Motif" v={`Winou ${business.slug}`} />
          </div>

          <div className="mt-6">
            {pendingPayment ? (
              <p className="rounded-xl bg-ochre/15 px-4 py-3 text-sm font-medium text-ochre">
                Virement déclaré (réf. {pendingPayment.reference}) — en cours de vérification.
              </p>
            ) : sub.status === 'ACTIVE' ? (
              <p className="rounded-xl bg-olive/10 px-4 py-3 text-sm font-medium text-olive">
                Abonnement actif jusqu’au {sub.currentPeriodEnd ? fmt(sub.currentPeriodEnd) : '—'}.
              </p>
            ) : (
              <BankTransferForm subscriptionId={sub.id} />
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono font-semibold">{v}</span>
    </div>
  )
}
