import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { AuthCard } from '@/components/forms/auth-card'
import { SignupForm } from '@/components/auth/signup-form'
import { signupClient } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'

export default function InscriptionClientPage() {
  return (
    <AuthCard
      badge={
        <span className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-olive">
          <UserRound className="size-3.5" /> Espace client
        </span>
      }
      title="Créer ton compte"
      subtitle="Découvre les restaurants et cafés locaux et garde tes favoris à portée de main."
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/connexion-client" className="font-bold text-terracotta hover:underline">
              Se connecter
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Vous êtes commerçant ?{' '}
            <Link href="/inscription" className="font-semibold text-olive hover:underline">
              Inscrire mon établissement
            </Link>
          </p>
        </>
      }
    >
      <SignupForm action={signupClient} cta="Créer mon compte" />
    </AuthCard>
  )
}
