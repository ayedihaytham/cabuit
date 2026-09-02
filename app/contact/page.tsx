'use client'

import { useActionState } from 'react'
import { Check, Link2, Mail, Send } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { sendContactMessage, type ContactState } from '@/app/actions/contact'
import { CONTACT_EMAIL, INSTAGRAM_URL } from '@/lib/constants'

export default function ContactPage() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(sendContactMessage, {})

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div>
          <p className="eyebrow">On est à ton écoute</p>
          <h1 className="mt-4 font-display text-5xl leading-none sm:text-7xl">
            Parlons-nous<span className="text-terracotta">.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">
            Une question sur Winou, une suggestion ou simplement envie de nous dire bonjour ?
            Écris-nous.
          </p>
          <div className="mt-10 flex flex-col gap-5 text-sm">
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 font-semibold hover:text-terracotta">
              <Mail className="size-5 text-terracotta" /> {CONTACT_EMAIL}
            </a>
            <a href={INSTAGRAM_URL} className="flex items-center gap-3 font-semibold hover:text-terracotta">
              <Link2 className="size-5 text-terracotta" /> @winou.tn
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          {state.ok ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-olive/10 text-olive">
                <Check className="size-8" />
              </span>
              <h2 className="mt-6 font-display text-3xl">Message envoyé.</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Merci, notre équipe revient vers toi rapidement.
              </p>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-5">
              <label className="field-label">
                Nom
                <input name="name" required className="field-input" />
              </label>
              <label className="field-label">
                Email
                <input name="email" type="email" required className="field-input" />
              </label>
              <label className="field-label">
                Message
                <textarea name="message" required rows={6} className="field-input resize-none" />
              </label>
              {state.error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                  {state.error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {pending ? 'Envoi…' : 'Envoyer le message'} <Send className="size-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
