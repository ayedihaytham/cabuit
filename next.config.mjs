/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production'

// CSP volontairement pragmatique : 'unsafe-inline' sur les scripts est requis par
// Next tant qu'on n'a pas de nonce middleware. Elle bloque néanmoins l'injection
// de scripts/objets externes, le framing, et restreint les origines réseau.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src 'self' https://www.openstreetmap.org https://www.google.com",
  "connect-src 'self' https://nominatim.openstreetmap.org https://*.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.upstash.io" +
    (isDev ? ' ws:' : ''),
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig = {
  reactStrictMode: true,
  // Masque le bouton indicateur Next.js (le rond "N") affiché en dev uniquement.
  devIndicators: false,
  // Fichiers AGENTS.md / CLAUDE.md régénérés à chaque `next dev` : on les désactive.
  agentRules: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  // Tree-shake les gros barrels d'icônes.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Retire les console.* (hors error/warn) du bundle de production.
  compiler: {
    removeConsole: { exclude: ['error', 'warn'] },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
