import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)

const MERCHANT_PREFIX = '/dashboard'
const ADMIN_PREFIX = '/admin'
const CLIENT_PREFIX = '/espace-client'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role
  const isLoggedIn = Boolean(req.auth)

  const needsMerchant = pathname.startsWith(MERCHANT_PREFIX)
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX)
  const needsClient = pathname.startsWith(CLIENT_PREFIX)

  if (!needsMerchant && !needsAdmin && !needsClient) return NextResponse.next()

  if (!isLoggedIn) {
    const loginPath = needsClient ? '/connexion-client' : '/connexion'
    const url = new URL(loginPath, req.nextUrl)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  const allowed =
    (needsAdmin && role === 'ADMIN') ||
    (needsMerchant && (role === 'MERCHANT' || role === 'ADMIN')) ||
    (needsClient && Boolean(role))

  if (!allowed) return NextResponse.redirect(new URL('/', req.nextUrl))

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/espace-client/:path*'],
}
