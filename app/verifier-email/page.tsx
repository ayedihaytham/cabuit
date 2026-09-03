import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { db } from '@/lib/db'
import { consumeEmailVerifyToken } from '@/lib/tokens'
import { getSessionUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  MERCHANT: '/dashboard',
  COMMERCIAL: '/commercial',
  CLIENT: '/espace-client',
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const email = token ? await consumeEmailVerifyToken(token) : null

  if (email) {
    await db.user.updateMany({ where: { email }, data: { emailVerified: new Date() } })
  }

  const session = await getSessionUser()
  const back = session ? (HOME_BY_ROLE[session.role] ?? '/') : '/connexion'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader variant="minimal" />
      <main className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
        {email ? (
          <>
            <CheckCircle2 className="size-14 text-olive" />
            <h1 className="mt-6 font-display text-3xl font-bold">Adresse confirmée</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Merci ! Votre compte est maintenant pleinement actif.
            </p>
          </>
        ) : (
          <>
            <XCircle className="size-14 text-destructive" />
            <h1 className="mt-6 font-display text-3xl font-bold">Lien invalide ou expiré</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Reconnectez-vous et demandez un nouveau lien depuis le bandeau de votre espace.
            </p>
          </>
        )}
        <Link
          href={back}
          className="mt-8 rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Continuer
        </Link>
      </main>
    </div>
  )
}
