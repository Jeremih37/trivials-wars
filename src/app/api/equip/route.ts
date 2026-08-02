import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ITEMS_BY_ID } from "@/lib/gacha-catalog"
import { apiHandler, safeJson } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface EquipBody {
  itemId: string
}

export const POST = apiHandler(async (req: Request) => {
  const body = await safeJson<EquipBody>(req)
  const item = ITEMS_BY_ID[body.itemId]
  if (!item) {
    return NextResponse.json({ error: "Item inválido" }, { status: 400 })
  }

  const user = await db.user.findFirst({
    include: { inventory: true, equipped: true },
  })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  // Verificar que el usuario posee el item
  const owns = user.inventory.some((i) => i.itemId === body.itemId)
  if (!owns) {
    return NextResponse.json({ error: "No posees este item" }, { status: 400 })
  }

  // Reemplazar el item equipado en ese slot
  const slot = item.type // hat | top | aura | weapon
  const existing = user.equipped.find((e) => e.slot === slot)
  if (existing) {
    await db.equippedItem.update({
      where: { id: existing.id },
      data: { itemId: item.id },
    })
  } else {
    await db.equippedItem.create({
      data: {
        userId: user.id,
        slot,
        itemId: item.id,
      },
    })
  }

  return NextResponse.json({ ok: true, slot, itemId: item.id })
})

interface UnequipBody {
  slot: "hat" | "top" | "aura" | "weapon"
}

export const DELETE = apiHandler(async (req: Request) => {
  const body = await safeJson<UnequipBody>(req)
  const user = await db.user.findFirst({ include: { equipped: true } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }
  const existing = user.equipped.find((e) => e.slot === body.slot)
  if (existing) {
    await db.equippedItem.delete({ where: { id: existing.id } })
  }
  return NextResponse.json({ ok: true })
})
