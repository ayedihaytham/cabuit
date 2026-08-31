import Link from 'next/link'
import { Store } from 'lucide-react'
import { AuthCard } from '@/components/forms/auth-card'
import { LoginForm } from '@/components/auth/login-form'

// Page de connexion : dynamique (lit ?next=), pas de pré-rendu statique.
export const dynamic = 'force-dynamic'

export default function ConnexionPage() {
  return (
    <AuthCard
      badge={
        <span className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
          <Store className="size-3.5" /> Espace commerçant
        </span>
      }
      title="Ravi de vous revoir."
      subtitle="Connectez-vous pour gérer votre fiche et développer votre visibilité."
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            Pas encore inscrit ?{' '}
            <Link href="/inscription" className="font-bold text-terracotta hover:underline">
              Créer ma fiche commerce
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Vous êtes client ?{' '}
            <Link href="/connexion-client" className="font-semibold text-olive hover:underline">
              Espace client
            </Link>
          </p>
        </>
      }
    >
      <LoginForm variant="pro" googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID)} />
    </AuthCard>
  )
}
