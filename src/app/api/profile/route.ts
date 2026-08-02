import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { computeLevelFromXp } from "@/lib/game"
import { ITEMS_BY_ID } from "@/lib/gacha-catalog"
import { FRAMES, PROFILE_ICONS, getIconEmoji } from "@/lib/profile-catalog"
import { apiHandler } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const GET = apiHandler(async () => {
  const user = await getCurrentUser()

  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    include: {
      inventory: true,
      equipped: true,
      progress: true,
      unlocks: true,
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 20,
      },
    },
  })
  if (!fullUser) {
    return NextResponse.json({ error: "No user found" }, { status: 404 })
  }

  const levelInfo = computeLevelFromXp(fullUser.xp)

  // Equipped items (hat/top/aura/weapon) para avatar SVG
  const equippedMap: { hat: string | null; top: string | null; aura: string | null; weapon: string | null } = {
    hat: null,
    top: null,
    aura: null,
    weapon: null,
  }
  for (const eq of fullUser.equipped) {
    equippedMap[eq.slot as "hat" | "top" | "aura" | "weapon"] = eq.itemId
  }

  // Inventario agrupado por rareza
  const inventoryByRarity = {
    Comun: [] as string[],
    Normal: [] as string[],
    Raro: [] as string[],
    Epico: [] as string[],
    Legendario: [] as string[],
  }
  for (const inv of fullUser.inventory) {
    const item = ITEMS_BY_ID[inv.itemId]
    if (item) {
      inventoryByRarity[item.rarity].push(item.id)
    }
  }

  // Marcos desbloqueados
  const unlockedFrames = fullUser.unlocks
    .filter((u) => u.type === "frame")
    .map((u) => u.key)
  const frames = FRAMES.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    unlockLevel: f.unlockLevel,
    hex: f.hex,
    unlocked: unlockedFrames.includes(f.id) || fullUser.level >= f.unlockLevel,
    equipped: fullUser.equippedFrame === f.id,
  }))

  // Iconos desbloqueados
  const unlockedIcons = fullUser.unlocks
    .filter((u) => u.type === "icon")
    .map((u) => u.key)
  const icons = PROFILE_ICONS.map((i) => ({
    id: i.id,
    emoji: i.emoji,
    name: i.name,
    unlockLevel: i.unlockLevel,
    unlocked: unlockedIcons.includes(i.id) || fullUser.level >= i.unlockLevel,
    equipped: getIconEmoji(fullUser.profileIcon) === i.emoji,
  }))

  return NextResponse.json({
    user: {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      provider: fullUser.provider,
      avatarBase: fullUser.avatarBase,
      skinTone: fullUser.skinTone,
      profileIcon: fullUser.profileIcon,
      profileIconEmoji: getIconEmoji(fullUser.profileIcon),
      equippedFrame: fullUser.equippedFrame,
      xp: fullUser.xp,
      level: levelInfo.level,
      coins: fullUser.coins,
      boxes: fullUser.boxes,
      xpIntoLevel: levelInfo.xpIntoLevel,
      xpForNextLevel: levelInfo.xpForNextLevel,
      progressPct: levelInfo.progressPct,
      equipped: equippedMap,
      inventoryCount: fullUser.inventory.length,
      inventoryByRarity,
      // Stats
      wins: fullUser.wins,
      losses: fullUser.losses,
      currentStreak: fullUser.currentStreak,
      maxStreak: fullUser.maxStreak,
      gamesPlayed: fullUser.gamesPlayed,
      winRate: fullUser.gamesPlayed > 0
        ? Math.round((fullUser.wins / fullUser.gamesPlayed) * 100)
        : 0,
      // Stats específicas de Supervivencia (GDD: récord personal)
      survivalBestCorrect: fullUser.survivalBestCorrect,
      survivalBestXp: fullUser.survivalBestXp,
      survivalRuns: fullUser.survivalRuns,
      // Stats específicas de Muerte Súbita (GDD V3.0)
      suddenDeathBestCorrect: fullUser.suddenDeathBestCorrect,
      suddenDeathBestXp: fullUser.suddenDeathBestXp,
      suddenDeathRuns: fullUser.suddenDeathRuns,
    },
    progress: fullUser.progress.map((p) => ({
      category: p.category,
      difficulty: p.difficulty,
      correct: p.correct,
      total: p.total,
      bestStreak: p.bestStreak,
    })),
    frames,
    icons,
  })
})
