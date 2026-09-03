import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { AccountActions } from '@/components/account/account-actions'
import { getSessionUser } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mon compte' }

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  MERCHANT: '/dashboard',
  COMMERCIAL: '/commercial',
  CLIENT: '/espace-client',
}

export default async function ComptePage() {
  const user = await getSessionUser()
  if (!user) redirect('/connexion')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader variant="minimal" back={{ href: HOME_BY_ROLE[user.role] ?? '/', label: 'Retour' }} />
      <main className="mx-auto max-w-xl px-5 py-12">
        <Link
          href={HOME_BY_ROLE[user.role] ?? '/'}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-terracotta"
        >
          <ArrowLeft className="size-4" /> Mon espace
        </Link>
        <h1 className="font-display text-3xl font-bold">Mon compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-8">
          <AccountActions email={user.email} />
        </div>
      </main>
    </div>
  )
}
