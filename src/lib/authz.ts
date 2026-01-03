import { UserRole } from "@prisma/client"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

export async function getSessionWithRole() {
  return getServerSession(authOptions)
}

export function isAdmin(session: unknown): boolean {
  const role = (session as { user?: { role?: UserRole } } | undefined)?.user?.role
  return role === UserRole.ADMIN
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) {
    throw new Error("Forbidden")
  }
  return session
}
