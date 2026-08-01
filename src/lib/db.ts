import { PrismaClient } from "@prisma/client"

// Serverless-friendly Prisma singleton.
// En Vercel cada función serverless puede instanciar Prisma múltiples veces,
// así que reutilizamos la instancia global para no agotar las conexiones.

function resolveDatabaseUrl(): string | undefined {
  // Prioridad:
  // 1. DATABASE_URL (estándar Prisma)
  // 2. POSTGRES_PRISMA_URL (Vercel Postgres / Neon integration)
  // 3. POSTGRES_DATABASE_URL (Neon integration legacy)
  // 4. POSTGRES_URL (Vercel Postgres sin params extra)
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_DATABASE_URL ||
    process.env.POSTGRES_URL
  return url
}

function resolveDirectUrl(): string | undefined {
  // directUrl se usa para migraciones / prisma db push (sin pooler PgBouncer).
  // Si no está, usamos la DATABASE_URL normal.
  return (
    process.env.DIRECT_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_DATABASE_URL
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = resolveDatabaseUrl()
  if (!url) {
    console.error("[db] No se encontró DATABASE_URL ni POSTGRES_*_URL en env")
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    // Importante para Vercel Postgres / Neon: evita timeouts largos.
    datasources: {
      db: {
        url,
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
