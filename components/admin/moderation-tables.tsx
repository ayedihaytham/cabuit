'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Spinner } from '@/components/app/spinner'
import { moderateBusiness } from '@/app/actions/admin'
import { moderateReview, resolveReport } from '@/app/actions/engagement'
import { BUSINESS_STATUS_LABELS, CATEGORY_LABELS } from '@/lib/status'
import type { BusinessStatus } from '@prisma/client'

type BusinessRow = {
  id: string
  name: string
  category: string
  city: string
  status: BusinessStatus
  owner: { email: string }
  subscription: { tier: string; pricePerYear: number } | null
}

const BTN = 'rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50'

export function BusinessRows({ rows }: { rows: BusinessRow[] }) {
  const [statuses, setStatuses] = useState<Record<string, BusinessStatus>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [, start] = useTransition()

  const act = (id: string, action: 'approve' | 'reject' | 'suspend' | 'reactivate') => {
    setBusy(id)
    start(async () => {
      const res = await moderateBusiness(id, action)
      if (res?.status) setStatuses((s) => ({ ...s, [id]: res.status as BusinessStatus }))
      setBusy(null)
    })
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="divide-y divide-border">
        {rows.map((b) => {
          const status = statuses[b.id] ?? b.status
          const s = BUSINESS_STATUS_LABELS[status]
          const actions: ('approve' | 'reject' | 'suspend' | 'reactivate')[] =
            status === 'PENDING'
              ? ['approve', 'reject']
              : status === 'ACTIVE'
                ? ['suspend']
                : status === 'SUSPENDED'
                  ? ['reactivate']
                  : ['approve', 'reject']
          const working = busy === b.id
          return (
            <div key={b.id} className="flex flex-col gap-3 p-5 md:grid md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center">
              <div>
                <Link href={`/admin/commerces/${b.id}`} className="font-semibold hover:text-terracotta">
                  {b.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[b.category]} · {b.city} · {b.owner.email}
                </p>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${s.tone}`}>{s.label}</span>
              <span className="text-sm text-muted-foreground">
                {b.subscription ? `${b.subscription.tier} · ${b.subscription.pricePerYear} DT/an` : 'Sans abonnement'}
              </span>
              <div className="flex flex-wrap gap-2">
                {actions.map((a) => (
                  <button
                    key={a}
                    type="button"
                    disabled={working}
                    onClick={() => act(b.id, a)}
                    className={`${BTN} ${
                      a === 'approve' || a === 'reactivate'
                        ? 'bg-primary text-primary-foreground'
                        : a === 'suspend'
                          ? 'border border-destructive/40 text-destructive hover:bg-destructive/10'
                          : 'border border-border hover:bg-muted'
                    }`}
                  >
                    {working ? (
                      <Spinner className="size-4" />
                    ) : a === 'approve' ? (
                      'Valider'
                    ) : a === 'reject' ? (
                      'Refuser'
                    ) : a === 'suspend' ? (
                      'Suspendre'
                    ) : (
                      'Réactiver'
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type ReviewRow = {
  id: string
  rating: number
  text: string
  author: { name: string | null; email: string }
  business: { name: string; slug: string }
}

export function ReviewRows({ rows }: { rows: ReviewRow[] }) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)
  const [, start] = useTransition()
  const visible = rows.filter((r) => !done.has(r.id))

  const act = (id: string, action: 'publish' | 'reject') => {
    setBusy(id)
    start(async () => {
      await moderateReview(id, action)
      setDone((d) => new Set(d).add(id))
      setBusy(null)
    })
  }

  if (visible.length === 0) {
    return <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun avis à modérer.</p>
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="divide-y divide-border">
        {visible.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {r.author.name ?? r.author.email} · sur{' '}
                <Link href={`/commerce/${r.business.slug}`} className="text-terracotta hover:underline">
                  {r.business.name}
                </Link>
              </p>
              <span className="flex items-center gap-1 text-ochre">
                <Star className="size-3.5 fill-current" /> {r.rating}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{r.text}</p>
            <div className="flex gap-2">
              <button type="button" disabled={busy === r.id} onClick={() => act(r.id, 'publish')} className={`${BTN} bg-primary text-primary-foreground`}>
                {busy === r.id ? <Spinner className="size-4" /> : 'Publier'}
              </button>
              <button type="button" disabled={busy === r.id} onClick={() => act(r.id, 'reject')} className={`${BTN} border border-border hover:bg-muted`}>
                Rejeter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type ReportRow = {
  id: string
  reason: string
  detail: string | null
  createdAt: Date
  business: { id: string; name: string }
  reporter: { name: string | null; email: string } | null
}

export function ReportRows({ rows }: { rows: ReportRow[] }) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)
  const [, start] = useTransition()
  const visible = rows.filter((r) => !done.has(r.id))

  const act = (id: string, action: 'RESOLVED' | 'DISMISSED') => {
    setBusy(id)
    start(async () => {
      await resolveReport(id, action)
      setDone((d) => new Set(d).add(id))
      setBusy(null)
    })
  }

  if (visible.length === 0) {
    return <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun signalement ouvert.</p>
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="divide-y divide-border">
        {visible.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                <Link href={`/admin/commerces/${r.business.id}`} className="text-terracotta hover:underline">
                  {r.business.name}
                </Link>{' '}
                — {r.reason}
              </p>
              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(r.createdAt)}
              </span>
            </div>
            {r.detail && <p className="text-sm text-muted-foreground">{r.detail}</p>}
            <p className="text-xs text-muted-foreground">
              Signalé par {r.reporter ? (r.reporter.name ?? r.reporter.email) : 'un visiteur'}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={busy === r.id} onClick={() => act(r.id, 'RESOLVED')} className={`${BTN} bg-primary text-primary-foreground`}>
                {busy === r.id ? <Spinner className="size-4" /> : 'Traité'}
              </button>
              <button type="button" disabled={busy === r.id} onClick={() => act(r.id, 'DISMISSED')} className={`${BTN} border border-border hover:bg-muted`}>
                Ignorer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Bons plans (modération admin) ---------- */

type OfferRow = {
  id: string
  title: string
  discountLabel: string
  status: string
  redemptionCount: number
  business: { name: string; slug: string }
}

export function OfferRows({ rows }: { rows: OfferRow[] }) {
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [, start] = useTransition()
  const visible = rows.filter((r) => !removed.has(r.id))

  const act = (id: string, action: 'pause' | 'activate' | 'remove') => {
    setBusy(id)
    start(async () => {
      const { adminModerateOffer } = await import('@/app/actions/admin')
      await adminModerateOffer(id, action)
      if (action === 'remove') setRemoved((s) => new Set(s).add(id))
      else setStatuses((s) => ({ ...s, [id]: action === 'pause' ? 'PAUSED' : 'ACTIVE' }))
      setBusy(null)
    })
  }

  if (visible.length === 0) {
    return <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun bon plan.</p>
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="divide-y divide-border">
        {visible.map((o) => {
          const status = statuses[o.id] ?? o.status
          return (
            <div key={o.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {o.title} · <span className="text-terracotta">{o.discountLabel}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  <Link href={`/commerce/${o.business.slug}`} className="hover:text-terracotta">{o.business.name}</Link>
                  {' · '}{o.redemptionCount} récupérés · {status === 'ACTIVE' ? 'actif' : status.toLowerCase()}
                </p>
              </div>
              <div className="flex gap-2">
                {status === 'ACTIVE' ? (
                  <button type="button" disabled={busy === o.id} onClick={() => act(o.id, 'pause')} className={`${BTN} border border-border hover:bg-muted`}>
                    Suspendre
                  </button>
                ) : (
                  <button type="button" disabled={busy === o.id} onClick={() => act(o.id, 'activate')} className={`${BTN} bg-primary text-primary-foreground`}>
                    Réactiver
                  </button>
                )}
                <button type="button" disabled={busy === o.id} onClick={() => act(o.id, 'remove')} className={`${BTN} border border-destructive/40 text-destructive hover:bg-destructive/10`}>
                  Supprimer
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Messages de contact ---------- */

type MessageRow = { id: string; name: string; email: string; message: string; createdAt: Date }

export function MessageRows({ rows }: { rows: MessageRow[] }) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)
  const [, start] = useTransition()
  const visible = rows.filter((r) => !done.has(r.id))

  const handle = (id: string) => {
    setBusy(id)
    start(async () => {
      const { markContactHandled } = await import('@/app/actions/admin')
      await markContactHandled(id)
      setDone((d) => new Set(d).add(id))
      setBusy(null)
    })
  }

  if (visible.length === 0) {
    return <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Aucun message en attente.</p>
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="divide-y divide-border">
        {visible.map((m) => (
          <div key={m.id} className="flex flex-col gap-2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                {m.name} ·{' '}
                <a href={`mailto:${m.email}`} className="text-terracotta hover:underline">{m.email}</a>
              </p>
              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(m.createdAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{m.message}</p>
            <button type="button" disabled={busy === m.id} onClick={() => handle(m.id)} className={`${BTN} w-fit bg-primary text-primary-foreground`}>
              {busy === m.id ? <Spinner className="size-4" /> : 'Marquer traité'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
