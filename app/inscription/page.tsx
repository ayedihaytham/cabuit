import Link from 'next/link'
import { Store } from 'lucide-react'
import { AuthCard } from '@/components/forms/auth-card'
import { SignupForm } from '@/components/auth/signup-form'
import { signupMerchant } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'

export default function InscriptionPage() {
  return (
    <AuthCard
      badge={
        <span className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
          <Store className="size-3.5" /> Espace commerçant
        </span>
      }
      title="Inscrire mon établissement"
      subtitle="Créez votre compte, puis ajoutez votre restaurant ou café. 30 jours d'essai gratuit."
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            Déjà inscrit ?{' '}
            <Link href="/connexion" className="font-bold text-terracotta hover:underline">
              Se connecter
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Vous êtes client ?{' '}
            <Link href="/inscription-client" className="font-semibold text-olive hover:underline">
              Créer un compte client
            </Link>
          </p>
        </>
      }
    >
      <SignupForm action={signupMerchant} cta="Créer mon compte commerçant" />
    </AuthCard>
  )
}
