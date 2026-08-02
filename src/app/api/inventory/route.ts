import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { GACHA_ITEMS, RARITY_CONFIG } from "@/lib/gacha-catalog"
import { apiHandler } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const GET = apiHandler(async () => {
  const user = await getCurrentUser()

  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    include: { inventory: true, equipped: true },
  })
  if (!fullUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const equippedMap: Record<string, string | null> = { hat: null, top: null, aura: null, weapon: null }
  for (const eq of fullUser.equipped) {
    equippedMap[eq.slot] = eq.itemId
  }

  const items = GACHA_ITEMS.map((item) => {
    const inv = fullUser.inventory.find((i) => i.itemId === item.id)
    return {
      id: item.id,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      description: item.description,
      owned: !!inv,
      acquiredAt: inv?.acquiredAt ?? null,
      equipped: equippedMap[item.type] === item.id,
      rarityColor: RARITY_CONFIG[item.rarity].hex,
      rarityLabel: RARITY_CONFIG[item.rarity].label,
    }
  })

  return NextResponse.json({
    items,
    equipped: equippedMap,
    inventoryCount: fullUser.inventory.length,
    totalCount: GACHA_ITEMS.length,
  })
})
