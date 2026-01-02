process.env.PRISMA_CLIENT_ENGINE_TYPE = "library"
process.env.PRISMA_ENGINE_TYPE = "library"
process.env.PRISMA_CLI_QUERY_ENGINE_TYPE = "library"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client")
type PrismaClientType = import("@prisma/client").PrismaClient

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
