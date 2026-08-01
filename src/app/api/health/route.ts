import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Endpoint de diagnóstico: reporta env vars, conexión a DB, tablas y timestamps.
// NO expone secretos, solo prefijos y longitudes.
export async function GET() {
  const diag: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      DATABASE_URL_set: Boolean(process.env.DATABASE_URL),
      DATABASE_URL_len: process.env.DATABASE_URL?.length ?? 0,
      DATABASE_URL_starts_postgres:
        process.env.DATABASE_URL?.startsWith("postgres") ?? false,
      DIRECT_URL_set: Boolean(process.env.DIRECT_URL),
      DIRECT_URL_len: process.env.DIRECT_URL?.length ?? 0,
      POSTGRES_DATABASE_URL_set: Boolean(process.env.POSTGRES_DATABASE_URL),
      POSTGRES_PRISMA_URL_set: Boolean(process.env.POSTGRES_PRISMA_URL),
      POSTGRES_URL_set: Boolean(process.env.POSTGRES_URL),
    },
  }

  // Test de conexión a DB
  try {
    const tables = await db.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' ORDER BY table_name;
    `
    diag.db = {
      ok: true,
      tables: tables.map((t) => t.table_name),
      tableCount: tables.length,
    }
  } catch (e) {
    diag.db = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      code: (e as { code?: string })?.code,
    }
  }

  return NextResponse.json(diag)
}
