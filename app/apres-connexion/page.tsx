import { redirect } from 'next/navigation'
import { auth } from '@/auth'

/** Aiguillage post-connexion selon le rôle. */
export default async function AfterLoginPage() {
  const session = await auth()
  switch (session?.user?.role) {
    case 'ADMIN':
      redirect('/admin')
    case 'MERCHANT':
      redirect('/dashboard')
    case 'COMMERCIAL':
      redirect('/commercial')
    case 'CLIENT':
      redirect('/espace-client')
    default:
      redirect('/')
  }
}
