import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import type { Provider } from 'next-auth/providers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authConfig } from '@/auth.config'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const providers: Provider[] = [
  Credentials({
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw)
      if (!parsed.success) return null

      const user = await db.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      })
      if (!user?.passwordHash) return null

      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
      if (!valid) return null

      return { id: user.id, email: user.email, name: user.name, role: user.role }
    },
  }),
]

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ allowDangerousEmailAccountLinking: true }))
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers,
})
