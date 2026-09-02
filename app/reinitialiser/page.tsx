import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { AuthCard } from '@/components/forms/auth-card'
import { ResetPasswordForm } from '@/components/auth/reset-forms'

export const dynamic = 'force-dynamic'

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <AuthCard
      badge={
        <span className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-olive">
          <KeyRound className="size-3.5" /> Nouveau mot de passe
        </span>
      }
      title="Choisir un mot de passe"
      subtitle="Ce lien est valable une heure."
      footer={
        <p className="text-sm text-muted-foreground">
          <Link href="/connexion" className="font-bold text-terracotta hover:underline">
            Retour à la connexion
          </Link>
        </p>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="mt-8 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Lien invalide.{' '}
          <Link href="/mot-de-passe-oublie" className="font-semibold underline">
            Refaire une demande
          </Link>
        </p>
      )}
    </AuthCard>
  )
}
