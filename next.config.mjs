/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Tree-shake les gros barrels d'icônes.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Retire les console.* (hors error/warn) du bundle de production.
  compiler: {
    removeConsole: { exclude: ['error', 'warn'] },
  },
}

export default nextConfig
