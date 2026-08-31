import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { AuthCard } from '@/components/forms/auth-card'
import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default function ConnexionClientPage() {
  return (
    <AuthCard
      badge={
        <span className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-olive">
          <UserRound className="size-3.5" /> Espace client
        </span>
      }
      title="Ravi de te revoir"
      subtitle="Connecte-toi pour retrouver tes commerces et tes adresses préférées."
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/inscription-client" className="font-bold text-terracotta hover:underline">
              S’inscrire
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Vous êtes commerçant ?{' '}
            <Link href="/connexion" className="font-semibold text-olive hover:underline">
              Accéder à l’espace pro
            </Link>
          </p>
        </>
      }
    >
      <LoginForm variant="client" googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID)} />
    </AuthCard>
  )
}
