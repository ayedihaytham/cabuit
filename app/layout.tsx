import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'
import { BRAND, TAGLINE } from '@/lib/constants'

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-body' })
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-display-face' })

export const metadata: Metadata = {
  metadataBase: new URL('https://blayes.tn'),
  title: {
    default: `${BRAND} — ${TAGLINE}`,
    template: `%s · ${BRAND}`,
  },
  description:
    'Blayes regroupe les restaurants et cafés / salons de thé de Tunisie sur une seule plateforme : explorez les bons plans, les commerces exposent leur espace via un abonnement annuel.',
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    siteName: BRAND,
    title: `${BRAND} — ${TAGLINE}`,
    description:
      'Découvrez les meilleurs restaurants et cafés / salons de thé près de chez vous en Tunisie.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f0e8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="bg-background">
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
