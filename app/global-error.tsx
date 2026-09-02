'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif',
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf6f0',
          color: '#35291e',
        }}
      >
        <div style={{ maxWidth: 460, textAlign: 'center', padding: 24 }}>
          <p style={{ fontWeight: 800, fontSize: 22, color: '#af4930', margin: 0 }}>
            Winou<span style={{ color: '#af4930' }}>.</span>
          </p>
          <h1 style={{ fontSize: 28, margin: '20px 0 8px' }}>Le service est indisponible</h1>
          <p style={{ color: '#5b5044', lineHeight: 1.6, margin: 0 }}>
            Une erreur inattendue est survenue. Réessayez dans quelques instants.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              background: '#af4930',
              color: '#fff',
              border: 0,
              padding: '12px 22px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
