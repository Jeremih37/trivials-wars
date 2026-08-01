import { NextResponse } from "next/server"

/**
 * Envuelve un handler de API route para garantizar:
 * 1. Siempre devuelve JSON (incluso en errores 500 inesperados)
 * 2. Captura errores de Prisma, red, runtime, etc.
 * 3. Mensaje útil en producción para depurar
 *
 * Uso:
 *   export const POST = apiHandler(async (req) => { ... })
 *   export const GET = apiHandler(async () => { ... })
 */
export function apiHandler<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response | NextResponse>,
): (...args: TArgs) => Promise<Response> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args)
    } catch (err) {
      const e = err as { message?: string; code?: string; name?: string }
      const status = e?.code === "P2025" ? 404 : 500
      console.error("[apiHandler] error:", e?.name, e?.code, e?.message)

      // Si el handler ya devolvía un NextResponse con status, lo respetamos.
      // (Esto sólo aplica si el throw viene antes del return.)
      return NextResponse.json(
        {
          error: e?.message || "Error interno del servidor",
          code: e?.code,
          name: e?.name,
        },
        { status },
      )
    }
  }
}

/**
 * Helper para parsear JSON del request de forma segura.
 * Si el body viene vacío o no es JSON válido, devuelve {}.
 */
export async function safeJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    const text = await req.text()
    if (!text) return {} as T
    return JSON.parse(text) as T
  } catch {
    return {} as T
  }
}
