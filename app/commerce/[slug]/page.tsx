import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, MapPin, MessageCircle, Phone, Star } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { FavoriteToggleDb } from '@/components/business/favorite-toggle-db'
import { ReviewFormDb } from '@/components/business/review-form-db'
import { ReportButton } from '@/components/business/report-button'
import { ContactLink } from '@/components/business/contact-link'
import { getPublicBusiness } from '@/lib/queries'
import { getSessionUser } from '@/lib/session'
import { db } from '@/lib/db'
import { CATEGORY_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const business = await getPublicBusiness(slug)
  return business ? { title: business.name, description: business.description } : { title: 'Commerce' }
}

export default async function CommercePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [business, user] = await Promise.all([getPublicBusiness(slug), getSessionUser()])
  if (!business) notFound()

  db.event
    .create({ data: { type: 'BUSINESS_VIEW', businessId: business.id, userId: user?.id ?? null } })
    .catch(() => {})

  const isClient = user?.role === 'CLIENT'
  const [favorite, myReview] = isClient
    ? await Promise.all([
        db.favorite.findUnique({ where: { userId_businessId: { userId: user!.id, businessId: business.id } } }),
        db.review.findUnique({ where: { businessId_authorId: { businessId: business.id, authorId: user!.id } } }),
      ])
    : [null, null]

  const cover = business.photos[0]?.url ?? '/images/restaurant.png'
  const avg =
    business.reviews.length > 0
      ? business.reviews.reduce((s, r) => s + r.rating, 0) / business.reviews.length
      : business.rating

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-12">
        <Link
          href={business.category === 'RESTAURANT' ? '/restauration' : '/recherche'}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta"
        >
          <ArrowLeft className="size-4" /> Retour
        </Link>

        <div className="relative mt-4 aspect-[2.2] overflow-hidden rounded-3xl bg-secondary">
          <Image src={cover} alt={business.name} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl font-bold">{business.name}</h1>
          {business.verified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive px-3 py-1 text-xs font-bold text-sand">
              <Check className="size-3.5" /> Vérifié
            </span>
          )}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{CATEGORY_LABELS[business.category]} · {business.type}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-terracotta" /> {business.address}</span>
          <span className="inline-flex items-center gap-1.5"><Star className="size-4 fill-ochre text-ochre" /> {avg.toFixed(1)} ({business.reviews.length} avis)</span>
        </p>

        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">{business.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {business.phone && (
            <ContactLink
              businessId={business.id}
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-sand hover:bg-terracotta"
            >
              <Phone className="size-4" /> Appeler
            </ContactLink>
          )}
          {business.whatsapp && (
            <ContactLink
              businessId={business.id}
              href={`https://wa.me/${business.whatsapp}`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-olive hover:text-olive"
            >
              <MessageCircle className="size-4 text-olive" /> WhatsApp
            </ContactLink>
          )}
          {isClient && (
            <FavoriteToggleDb
              businessId={business.id}
              businessName={business.name}
              initialFavorited={Boolean(favorite)}
              variant="button"
            />
          )}
        </div>

        {business.menuSections.length > 0 && (
          <section className="mt-12 border-t border-border pt-10">
            <p className="eyebrow">La carte</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Menu</h2>
            <div className="mt-6 space-y-8">
              {business.menuSections.map((section) => (
                <div key={section.id}>
                  <h3 className="font-display text-xl font-bold">{section.title}</h3>
                  <div className="mt-3 space-y-4">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-5">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-terracotta">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 border-t border-border pt-10">
          <p className="eyebrow">Avis clients</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Ce qu’en disent les clients</h2>

          {business.reviews.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {business.reviews.map((r) => (
                <article key={r.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <strong>{r.author.name ?? 'Client Blayes'}</strong>
                    <span className="flex items-center gap-1 text-ochre">
                      <Star className="size-4 fill-current" /> {r.rating}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{r.text}</p>
                  {r.ownerReply && (
                    <p className="mt-3 rounded-xl bg-secondary/70 p-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-olive">Réponse : </span>
                      {r.ownerReply}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Aucun avis pour l’instant.</p>
          )}

          {isClient ? (
            <div className="mt-6 max-w-lg">
              <ReviewFormDb businessId={business.id} existing={myReview} />
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              <Link href="/connexion-client" className="font-semibold text-terracotta">
                Connecte-toi
              </Link>{' '}
              pour laisser un avis.
            </p>
          )}
        </section>

        <ReportButton businessId={business.id} />
      </main>

      <SiteFooter />
    </div>
  )
}
