import type { NextAuthConfig } from 'next-auth'

/**
 * Config partagée, compatible edge (aucun import Prisma / bcrypt ici).
 * La liste des providers est complétée dans `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: '/connexion-client',
  },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role?: string }).role as never
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub)
        session.user.role = token.role as never
      }
      return session
    },
  },
} satisfies NextAuthConfig
