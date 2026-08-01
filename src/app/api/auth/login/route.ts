import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { autoUnlockByLevel } from "@/lib/auth"
import { computeLevelFromXp } from "@/lib/game"
import { apiHandler, safeJson } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface LoginBody {
  provider: "google" | "guest"
  email?: string
  name?: string
  googleId?: string
}

export const POST = apiHandler(async (req: Request) => {
  const body = await safeJson<LoginBody>(req)

  // Modo invitado: devuelve el primer usuario existente (o crea uno)
  if (body.provider === "guest") {
    let user = await db.user.findFirst()
    if (!user) {
      user = await db.user.create({
        data: {
          name: "Invitado",
          provider: "guest",
        },
      })
    }
    await autoUnlockByLevel(user.id, user.level)
    const levelInfo = computeLevelFromXp(user.xp)
    return NextResponse.json({
      userId: user.id,
      name: user.name,
      provider: user.provider,
      level: levelInfo.level,
      isNew: false,
    })
  }

  // Login con Google (mock OAuth)
  // En producción real esto vendría del flujo OAuth de Google
  if (body.provider === "google") {
    if (!body.email || !body.googleId) {
      return NextResponse.json({ error: "Faltan credenciales de Google" }, { status: 400 })
    }

    // Buscar usuario existente por googleId o email
    let user = await db.user.findUnique({ where: { googleId: body.googleId } })
    if (!user && body.email) {
      user = await db.user.findUnique({ where: { email: body.email } })
    }

    let isNew = false
    if (!user) {
      // Crear nuevo usuario con datos de Google
      user = await db.user.create({
        data: {
          email: body.email,
          name: body.name || body.email.split("@")[0],
          provider: "google",
          googleId: body.googleId,
          boxes: 2, // caja de bienvenida
        },
      })
      isNew = true
    } else {
      // Actualizar googleId si faltaba
      if (!user.googleId) {
        user = await db.user.update({
          where: { id: user.id },
          data: { googleId: body.googleId, provider: "google", email: body.email },
        })
      }
    }

    await autoUnlockByLevel(user.id, user.level)
    const levelInfo = computeLevelFromXp(user.xp)

    return NextResponse.json({
      userId: user.id,
      name: user.name,
      email: user.email,
      provider: "google",
      level: levelInfo.level,
      isNew,
    })
  }

  return NextResponse.json({ error: "Provider inválido" }, { status: 400 })
})
