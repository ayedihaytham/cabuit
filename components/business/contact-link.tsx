'use client'

import type { ReactNode } from 'react'
import { logContactClick } from '@/app/actions/engagement'

/** Lien de contact (tel: / wa.me) qui enregistre un événement CONTACT_CLICK. */
export function ContactLink({
  businessId,
  href,
  className,
  children,
}: {
  businessId: string
  href: string
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        void logContactClick(businessId)
      }}
    >
      {children}
    </a>
  )
}
