/* eslint-disable @next/next/no-img-element -- URLs commerçants externes, hors optimiseur Next */
import Image from 'next/image'

/**
 * Image de couverture : `next/image` pour les fichiers locaux (/images/…),
 * `<img>` simple pour les URLs externes fournies par les commerçants
 * (évite d'avoir à autoriser tous les domaines dans next.config).
 * À placer dans un conteneur `relative overflow-hidden`.
 */
export function Cover({
  src,
  alt,
  sizes,
  priority = false,
  className = '',
}: {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
}) {
  if (/^https?:\/\//i.test(src)) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className={`absolute inset-0 size-full object-cover ${className}`}
      />
    )
  }
  return (
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />
  )
}
