import { Prisma, Tag } from "@prisma/client"

import { prisma } from "@/lib/db"

type TxClient = Prisma.TransactionClient

function ensureDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }
}

export function normalizeTagNames(tagNames: string[] = []) {
  const normalized = Array.from(
    new Set(
      tagNames
        .map((name) => name.trim().toLowerCase())
        .filter((name) => name.length > 0)
    )
  )
  if (normalized.length > 3) {
    throw new Error("You can add up to 3 tags")
  }
  return normalized
}

export async function getOrCreateTags(
  names: string[],
  tx?: TxClient
): Promise<Tag[]> {
  ensureDb()
  const db = tx ?? prisma
  const normalized = normalizeTagNames(names)

  if (normalized.length === 0) {
    return []
  }

  const existing = await db.tag.findMany({
    where: { name: { in: normalized } },
  })

  const existingNames = new Set(existing.map((t) => t.name))
  const missing = normalized.filter((name) => !existingNames.has(name))

  const created =
    missing.length > 0
      ? await Promise.all(
          missing.map((name) => db.tag.create({ data: { name } }))
        )
      : []

  // Preserve input order
  const byName = new Map(
    [...existing, ...created].map((tag) => [tag.name, tag])
  )
  return normalized.map((name) => byName.get(name)!).filter(Boolean)
}

export async function listTags(limit = 50): Promise<Tag[]> {
  ensureDb()
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    take: limit,
  })
}
