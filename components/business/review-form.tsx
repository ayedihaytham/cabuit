'use client'

import { FormEvent, useState } from 'react'
import { Check, MessageCircle, Send } from 'lucide-react'
import { Stars } from '@/components/ui/stars'

export function ReviewForm() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [published, setPublished] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rating > 0 && comment.trim()) setPublished(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-foreground"
      >
        <MessageCircle className="size-4" /> Laisser un avis
      </button>

      {open && (
        <section className="mt-6 rounded-3xl border border-terracotta/30 bg-terracotta/5 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Votre expérience</p>
              <h2 className="mt-1 font-display text-2xl font-bold">Partagez votre avis</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground"
            >
              Fermer
            </button>
          </div>

          {published ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-card p-4 text-sm font-semibold">
              <span className="flex size-8 items-center justify-center rounded-full bg-olive text-sand">
                <Check className="size-4" />
              </span>
              Merci, votre avis a bien été envoyé.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div>
                <span className="text-sm font-semibold">Votre note</span>
                <div className="mt-2">
                  <Stars rating={rating} interactive onChange={setRating} />
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="review-comment">
                Votre commentaire
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                  placeholder="Racontez votre expérience en quelques mots…"
                  className="min-h-28 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-normal outline-none placeholder:text-muted-foreground focus:border-terracotta"
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-sand hover:bg-terracotta"
              >
                <Send className="size-4" /> Publier
              </button>
            </form>
          )}
        </section>
      )}
    </>
  )
}
