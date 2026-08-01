import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { apiHandler, safeJson } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// PATCH /api/profile/name — actualizar el nombre del jugador
export const PATCH = apiHandler(async (req: Request) => {
  const user = await getCurrentUser()
  const body = await safeJson<{ name?: string }>(req)

  const raw = (body.name ?? "").trim()
  if (!raw) {
    return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 })
  }
  // Limitar a 20 caracteres y sanitizar
  const name = raw.slice(0, 20)

  await db.user.update({
    where: { id: user.id },
    data: { name },
  })

  return NextResponse.json({ ok: true, name })
})
