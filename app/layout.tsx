import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'
import { BRAND, TAGLINE } from '@/lib/constants'
import { CookieConsent } from '@/components/cookie-consent'
import { PwaRegister } from '@/components/pwa-register'

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-body' })
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-display-face' })

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3100')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND} — ${TAGLINE}`,
    template: `%s · ${BRAND}`,
  },
  description:
    'Winou regroupe les restaurants et cafés / salons de thé de Tunisie sur une seule plateforme : explorez les bons plans, les commerces exposent leur espace via un abonnement annuel.',
  applicationName: BRAND,
  appleWebApp: { capable: true, title: BRAND, statusBarStyle: 'default' },
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
        <CookieConsent />
        <PwaRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
