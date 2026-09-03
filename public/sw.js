/* Service worker minimal — coquille hors-ligne + cache des assets. */
const VERSION = 'winou-v1'
const OFFLINE_URL = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll([OFFLINE_URL, '/icon.svg'])),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // Ne pas mettre en cache l'API ni l'auth.
  if (url.pathname.startsWith('/api/')) return

  // Navigation : réseau d'abord, repli sur la page hors-ligne.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || caches.match(OFFLINE_URL)),
      ),
    )
    return
  }

  // Assets statiques : cache d'abord, sinon réseau (et on met en cache).
  if (/\.(?:js|css|woff2?|png|jpg|jpeg|webp|avif|svg|ico)$/.test(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone()
            caches.open(VERSION).then((cache) => cache.put(request, copy))
            return res
          }),
      ),
    )
  }
})
