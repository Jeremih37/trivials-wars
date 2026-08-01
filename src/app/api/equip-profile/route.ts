import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser, autoUnlockByLevel } from "@/lib/auth"
import { FRAMES_BY_ID, PROFILE_ICONS, ICONS_BY_ID } from "@/lib/profile-catalog"
import { AVATAR_BASES } from "@/lib/gacha-catalog"
import { apiHandler, safeJson } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Equipar marco / icono / base
export const POST = apiHandler(async (req: Request) => {
  const body = await safeJson<{ type: "frame" | "icon" | "base"; key: string }>(req)
  const user = await getCurrentUser()

  if (body.type === "frame") {
    const frame = FRAMES_BY_ID[body.key]
    if (!frame) return NextResponse.json({ error: "Marco inválido" }, { status: 400 })
    if (user.level < frame.unlockLevel) {
      return NextResponse.json({ error: `Necesitas nivel ${frame.unlockLevel}` }, { status: 400 })
    }
    await db.user.update({
      where: { id: user.id },
      data: { equippedFrame: frame.id },
    })
    return NextResponse.json({ ok: true, equippedFrame: frame.id })
  }

  if (body.type === "icon") {
    const icon = ICONS_BY_ID[body.key]
    if (!icon) return NextResponse.json({ error: "Icono inválido" }, { status: 400 })
    if (user.level < icon.unlockLevel) {
      return NextResponse.json({ error: `Necesitas nivel ${icon.unlockLevel}` }, { status: 400 })
    }
    await db.user.update({
      where: { id: user.id },
      data: { profileIcon: icon.id },
    })
    return NextResponse.json({ ok: true, profileIcon: icon.id, emoji: icon.emoji })
  }

  if (body.type === "base") {
    const base = AVATAR_BASES.find((b) => b.id === body.key)
    if (!base) return NextResponse.json({ error: "Avatar base inválido" }, { status: 400 })
    await db.user.update({
      where: { id: user.id },
      data: { avatarBase: base.id },
    })
    return NextResponse.json({ ok: true, avatarBase: base.id })
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
})
