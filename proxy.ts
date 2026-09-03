import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)

type Role = 'CLIENT' | 'MERCHANT' | 'COMMERCIAL' | 'ADMIN'

/** Préfixe -> rôles autorisés (ADMIN passe partout). `null` = tout utilisateur connecté. */
const RULES: { prefix: string; roles: Role[] | null; login: string }[] = [
  { prefix: '/admin', roles: ['ADMIN'], login: '/connexion' },
  { prefix: '/dashboard', roles: ['MERCHANT'], login: '/connexion' },
  { prefix: '/commercial', roles: ['COMMERCIAL'], login: '/connexion' },
  { prefix: '/paiement', roles: ['MERCHANT'], login: '/connexion' },
  { prefix: '/espace-client', roles: ['CLIENT'], login: '/connexion-client' },
  { prefix: '/compte', roles: null, login: '/connexion' },
  { prefix: '/securite', roles: null, login: '/connexion' },
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const rule = RULES.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'))
  if (!rule) return NextResponse.next()

  const role = req.auth?.user?.role as Role | undefined

  if (!role) {
    const url = new URL(rule.login, req.nextUrl)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (role === 'ADMIN') return NextResponse.next()
  if (rule.roles && !rule.roles.includes(role)) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/commercial/:path*',
    '/espace-client/:path*',
    '/paiement',
    '/compte',
    '/securite',
  ],
}
