import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { computeLevelFromXp, buildAvatarString, type EquippedItems } from "@/lib/game"
import { ITEMS_BY_ID } from "@/lib/gacha-catalog"

export const dynamic = "force-dynamic"

export async function GET() {
  // Por simplicidad del MVP usamos el primer usuario (cuenta única local)
  const user = await db.user.findFirst({
    include: {
      inventory: true,
      equipped: true,
      progress: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 404 })
  }

  const levelInfo = computeLevelFromXp(user.xp)

  const equippedMap: EquippedItems = {}
  for (const eq of user.equipped) {
    const item = ITEMS_BY_ID[eq.itemId]
    if (item) {
      equippedMap[item.type] = item
    }
  }

  // Agrupar inventario por rareza
  const inventoryByRarity = {
    Comun: [] as string[],
    Inusual: [] as string[],
    Raro: [] as string[],
    Epico: [] as string[],
    Legendario: [] as string[],
  }
  for (const inv of user.inventory) {
    const item = ITEMS_BY_ID[inv.itemId]
    if (item) {
      inventoryByRarity[item.rarity].push(item.id)
    }
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      avatarBase: user.avatarBase,
      xp: user.xp,
      level: levelInfo.level,
      coins: user.coins,
      boxes: user.boxes,
      xpIntoLevel: levelInfo.xpIntoLevel,
      xpForNextLevel: levelInfo.xpForNextLevel,
      progressPct: levelInfo.progressPct,
      avatarString: buildAvatarString(user.avatarBase, equippedMap),
      equipped: {
        hat: equippedMap.hat?.id ?? null,
        top: equippedMap.top?.id ?? null,
        aura: equippedMap.aura?.id ?? null,
      },
      inventoryCount: user.inventory.length,
      inventoryByRarity,
    },
    progress: user.progress.map((p) => ({
      category: p.category,
      difficulty: p.difficulty,
      correct: p.correct,
      total: p.total,
      bestStreak: p.bestStreak,
    })),
  })
}
