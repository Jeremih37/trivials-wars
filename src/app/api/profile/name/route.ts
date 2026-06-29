import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

// PATCH /api/profile/name — actualizar el nombre del jugador
export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  const body = (await req.json()) as { name?: string }

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
}
