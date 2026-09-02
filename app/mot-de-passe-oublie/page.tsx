import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { AuthCard } from '@/components/forms/auth-card'
import { RequestResetForm } from '@/components/auth/reset-forms'

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      badge={
        <span className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-olive">
          <KeyRound className="size-3.5" /> Récupération
        </span>
      }
      title="Mot de passe oublié"
      subtitle="Entre ton email, on t’envoie un lien pour en choisir un nouveau."
      footer={
        <p className="text-sm text-muted-foreground">
          <Link href="/connexion" className="font-bold text-terracotta hover:underline">
            Retour à la connexion
          </Link>
        </p>
      }
    >
      <RequestResetForm />
    </AuthCard>
  )
}
