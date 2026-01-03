import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import { type NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"

import { prisma } from "@/lib/db"

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS
  if (!raw) return new Set<string>()
  return new Set(
    raw
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        ;(session.user as { id?: string; role?: UserRole }).id = user.id
        ;(session.user as { id?: string; role?: UserRole }).role =
          (user as { role?: UserRole }).role ?? UserRole.USER
      }
      return session
    },
    async signIn({ user }) {
      const adminEmails = parseAdminEmails()
      const email = user.email?.toLowerCase()
      if (email && adminEmails.has(email)) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: UserRole.ADMIN },
          })
        } catch (error) {
          console.error("Failed to set admin role", error)
        }
      }
      return true
    },
  },
}
