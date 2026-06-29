import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ITEMS_BY_ID, GACHA_ITEMS, RARITY_CONFIG } from "@/lib/gacha-catalog"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await db.user.findFirst({
    include: { inventory: true, equipped: true },
  })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const equippedMap: Record<string, string | null> = { hat: null, top: null, aura: null }
  for (const eq of user.equipped) {
    equippedMap[eq.slot] = eq.itemId
  }

  // Lista completa de items del catálogo, marcando cuáles posee y cuáles están equipados
  const items = GACHA_ITEMS.map((item) => {
    const inv = user.inventory.find((i) => i.itemId === item.id)
    return {
      ...item,
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
    inventoryCount: user.inventory.length,
    totalCount: GACHA_ITEMS.length,
  })
}
