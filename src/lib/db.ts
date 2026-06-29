import { PrismaClient } from "@prisma/client"

// Serverless-friendly Prisma singleton.
// En Vercel cada función serverless puede instanciar Prisma múltiples veces,
// así que reutilizamos la instancia global para no agotar las conexiones.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    // Importante para Vercel Postgres / Neon: evita timeouts largos.
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
