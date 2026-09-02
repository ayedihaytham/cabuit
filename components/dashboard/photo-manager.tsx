'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Star, Trash2 } from 'lucide-react'
import { addPhoto, removePhoto, setCover } from '@/app/actions/photos'

type Photo = { id: string; url: string }

export function PhotoManager({ businessId, photos }: { businessId: string; photos: Photo[] }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const run = (fn: () => Promise<{ error?: string } | void>) =>
    start(async () => {
      const res = await fn()
      setError(res?.error ?? '')
      if (!res?.error) router.refresh()
    })

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((p, i) => (
          <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="size-full object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                Couverture
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => run(() => setCover(p.id))}
                  className="rounded-md bg-white/90 p-1.5 text-foreground"
                  title="Définir comme couverture"
                >
                  <Star className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => run(() => removePhoto(p.id))}
                className="rounded-md bg-white/90 p-1.5 text-destructive"
                title="Supprimer"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        action={(fd) => {
          run(() => addPhoto(businessId, fd))
          if (inputRef.current) inputRef.current.value = ''
        }}
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        <ImagePlus className="size-4 text-terracotta" />
        <input
          ref={inputRef}
          name="url"
          type="url"
          required
          placeholder="Coller l'URL d'une image (https://…)"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending || photos.length >= 8}
          className="rounded-full bg-terracotta px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>
      <p className="mt-1 text-xs text-muted-foreground">
        {photos.length}/8 · collez le lien d’une photo (Instagram, votre site, un hébergeur d’images…).
      </p>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
