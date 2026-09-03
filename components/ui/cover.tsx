/* eslint-disable @next/next/no-img-element -- URLs commerçants externes arbitraires, hors optimiseur Next */
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'

const OPTIMISABLE = [
  /^\/images\//i, // assets locaux
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i, // Vercel Blob (autorisé dans next.config)
]

/**
 * Image de couverture. `next/image` (AVIF/WebP, redimensionnement) pour les
 * assets locaux et les photos hébergées sur Vercel Blob ; `<img>` paresseux
 * pour les URLs externes arbitraires collées par les commerçants ; et un
 * placeholder « photo à venir » quand aucune photo n'a été fournie.
 * À placer dans un conteneur `relative overflow-hidden`.
 */
export function Cover({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
  className = '',
}: {
  src?: string | null
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
}) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-secondary to-ochre/15 text-muted-foreground/60">
        <ImageIcon className="size-6" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">Photo à venir</span>
      </div>
    )
  }

  const optimisable = OPTIMISABLE.some((re) => re.test(src))

  if (!optimisable) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`absolute inset-0 size-full object-cover ${className}`}
      />
    )
  }

  return (
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />
  )
}
