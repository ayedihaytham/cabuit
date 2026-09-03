import { redirect } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function SecuritePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/connexion')
  // Compte déjà en règle : on renvoie vers son espace.
  if (!user.mustChangePassword) {
    redirect(user.role === 'ADMIN' ? '/admin' : user.role === 'COMMERCIAL' ? '/commercial' : '/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader variant="minimal" />
      <main className="mx-auto flex max-w-md flex-col items-center px-5 py-16">
        <span className="grid size-14 place-items-center rounded-2xl bg-terracotta/10 text-terracotta">
          <KeyRound className="size-6" />
        </span>
        <h1 className="mt-6 text-center font-display text-3xl font-bold">Choisissez votre mot de passe</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Votre compte a été créé par notre équipe avec un mot de passe temporaire. Définissez le
          vôtre pour continuer.
        </p>
        <div className="mt-8 w-full rounded-2xl border border-border bg-card p-6">
          <ChangePasswordForm />
        </div>
      </main>
    </div>
  )
}
