import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Mail, Phone } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { adminNav } from '@/lib/nav'
import { ModerationActions } from '@/components/admin/moderation-actions'
import { RecordPayment, ConfirmPaymentButton } from '@/components/admin/record-payment'
import { requireUser } from '@/lib/session'
import { getAdminStats, getBusinessForAdmin } from '@/lib/queries'
import { BUSINESS_STATUS_LABELS, SUB_STATUS_LABELS, CATEGORY_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

const fmtDate = (d: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(d)

export default async function AdminBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(['ADMIN'])
  const { id } = await params
  const [b, stats] = await Promise.all([getBusinessForAdmin(id), getAdminStats()])
  if (!b) notFound()

  const status = BUSINESS_STATUS_LABELS[b.status]
  const actions =
    b.status === 'PENDING'
      ? (['approve', 'reject'] as const)
      : b.status === 'ACTIVE'
        ? (['suspend'] as const)
        : b.status === 'SUSPENDED'
          ? (['reactivate'] as const)
          : (['approve', 'reject'] as const)

  return (
    <AppShell
      roleLabel="Administration"
      userName={user.name ?? user.email}
      homeHref="/admin"
      nav={adminNav({ reviews: stats.reviewsPending, reports: stats.reportsOpen })}
      activeKey="all"
    >
      <div className="mx-auto max-w-4xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta">
          <ArrowLeft className="size-4" /> Console admin
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl">{b.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.tone}`}>{status.label}</span>
          {b.status === 'ACTIVE' && (
            <Link href={`/commerce/${b.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:underline">
              <ExternalLink className="size-3.5" /> Fiche publique
            </Link>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {CATEGORY_LABELS[b.category]} · {b.type} · {b.city}
        </p>

        <div className="mt-5">
          <ModerationActions businessId={b.id} actions={[...actions]} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-xl font-bold">Fiche</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Adresse" v={b.address} />
              <Row k="Description" v={b.description} />
              <Row k="Téléphone" v={b.phone ?? '—'} />
              <Row k="Créée le" v={fmtDate(b.createdAt)} />
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-xl font-bold">Propriétaire</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Nom" v={b.owner.name ?? '—'} />
              <Row
                k="Email"
                v={
                  <a href={`mailto:${b.owner.email}`} className="inline-flex items-center gap-1.5 text-terracotta hover:underline">
                    <Mail className="size-3.5" /> {b.owner.email}
                  </a>
                }
              />
              <Row
                k="Téléphone"
                v={
                  b.owner.phone ? (
                    <a href={`tel:${b.owner.phone}`} className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5" /> {b.owner.phone}
                    </a>
                  ) : (
                    '—'
                  )
                }
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-xl font-bold">Activité</h2>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <Metric n={b._count.reviews} label="avis" />
              <Metric n={b._count.favorites} label="favoris" />
              <Metric n={b._count.events} label="événements" />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-xl font-bold">Abonnement</h2>
            {b.subscription ? (
              <>
                <dl className="mt-3 space-y-2 text-sm">
                  <Row k="Offre" v={`${b.subscription.tier} · ${b.subscription.pricePerYear} DT/an`} />
                  <Row k="Statut" v={SUB_STATUS_LABELS[b.subscription.status]} />
                  <Row k="CGA acceptées" v={`${fmtDate(b.subscription.acceptedTermsAt)} (IP ${b.subscription.acceptedTermsIp})`} />
                  {b.subscription.currentPeriodEnd && (
                    <Row k="Échéance" v={fmtDate(b.subscription.currentPeriodEnd)} />
                  )}
                </dl>

                {b.subscription.payments.some((p) => p.status === 'PENDING') && (
                  <div className="mt-5 space-y-2">
                    <h3 className="text-sm font-bold text-ochre">Virements déclarés à vérifier</h3>
                    {b.subscription.payments
                      .filter((p) => p.status === 'PENDING')
                      .map((p) => (
                        <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-ochre/10 p-3 text-sm">
                          <span>
                            {p.amount} DT · réf. {p.reference ?? '—'}
                          </span>
                          <ConfirmPaymentButton paymentId={p.id} />
                        </div>
                      ))}
                  </div>
                )}

                <h3 className="mt-5 text-sm font-bold">Enregistrer un paiement (manuel)</h3>
                <div className="mt-2">
                  <RecordPayment subscriptionId={b.subscription.id} defaultAmount={b.subscription.pricePerYear} />
                </div>

                {b.subscription.payments.length > 0 && (
                  <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                    {b.subscription.payments.map((p) => (
                      <li key={p.id} className="flex justify-between">
                        <span>{p.invoiceNumber ?? p.reference ?? '—'} · {p.method}</span>
                        <span>{p.amount} DT · {p.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Aucun abonnement (fiche non soumise).</p>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  )
}

function Metric({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <p className="font-display text-2xl font-bold">{n}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
