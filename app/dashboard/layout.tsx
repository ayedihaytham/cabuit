import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'

/** Force le changement du mot de passe temporaire (comptes créés par un commercial). */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (user?.mustChangePassword) redirect('/securite')
  return <>{children}</>
}
