/* eslint-disable @next/next/no-img-element -- URLs commerçants externes arbitraires, hors optimiseur Next */
import Image from 'next/image'

const OPTIMISABLE = [
  /^\/images\//i, // assets locaux
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i, // Vercel Blob (autorisé dans next.config)
]

/**
 * Image de couverture. `next/image` (AVIF/WebP, redimensionnement) pour les
 * assets locaux et les photos hébergées sur Vercel Blob ; `<img>` paresseux
 * pour les URLs externes arbitraires collées par les commerçants.
 * À placer dans un conteneur `relative overflow-hidden`.
 */
export function Cover({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
  className = '',
}: {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
}) {
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
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  )
}
