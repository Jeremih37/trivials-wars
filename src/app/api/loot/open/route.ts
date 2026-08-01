import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { openLootBox, computeLevelFromXp } from "@/lib/game"
import { apiHandler } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const POST = apiHandler(async () => {
  const user = await db.user.findFirst({
    include: { inventory: true },
  })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }
  if (user.boxes <= 0) {
    return NextResponse.json({ error: "No tienes loot boxes disponibles" }, { status: 400 })
  }

  // Restar una caja
  await db.user.update({
    where: { id: user.id },
    data: { boxes: user.boxes - 1 },
  })

  const ownedItemIds = user.inventory.map((i) => i.itemId)
  const result = openLootBox(ownedItemIds)

  // Registrar log
  await db.lootBoxLog.create({
    data: {
      userId: user.id,
      rarity: result.rarity,
      itemId: result.item.id,
      isDuplicate: result.isDuplicate,
      xpBonus: result.xpBonus,
    },
  })

  // Si no es duplicado, agregar al inventario
  // Si es duplicado, sumar XP bonus
  let newXp = user.xp
  let newLevel = user.level
  let levelUp = false

  if (result.isDuplicate) {
    if (result.xpBonus > 0) {
      newXp = user.xp + result.xpBonus
      const levelInfo = computeLevelFromXp(newXp)
      newLevel = levelInfo.level
      levelUp = levelInfo.level > user.level

      const newBoxes = levelUp ? user.boxes : user.boxes - 1 // ya restamos 1 arriba, sumamos 1 si level up
      await db.user.update({
        where: { id: user.id },
        data: {
          xp: newXp,
          level: newLevel,
          boxes: levelUp ? newBoxes + 1 : undefined, // si level up, recuperar caja + sumar bonus
        },
      })
    }
  } else {
    await db.inventoryItem.create({
      data: {
        userId: user.id,
        itemId: result.item.id,
        type: result.item.type,
        rarity: result.item.rarity,
      },
    })
  }

  return NextResponse.json({
    item: result.item,
    rarity: result.rarity,
    isDuplicate: result.isDuplicate,
    xpBonus: result.xpBonus,
    newTotalXp: newXp,
    newLevel,
    levelUp,
    boxesRemaining: user.boxes - 1 + (levelUp ? 1 : 0),
  })
})
