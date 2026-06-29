// ===============================
// Trivials Wars — Game Logic Core
// ===============================

import { GACHA_ITEMS, RARITY_CONFIG, type GachaItem, type Rarity } from "./gacha-catalog"

// ===== CATEGORÍAS Y DIFICULTADES =====
export const CATEGORIES = [
  { id: "Entretenimiento", name: "Entretenimiento", icon: "🎬", color: "#ec4899" },
  { id: "Deporte", name: "Deporte", icon: "⚽", color: "#22c55e" },
  { id: "Historia", name: "Historia", icon: "📜", color: "#f59e0b" },
  { id: "Matematicas", name: "Matemáticas", icon: "🔢", color: "#06b6d4" },
  { id: "Ciencia", name: "Ciencia", icon: "🔬", color: "#a855f7" },
  { id: "Videojuegos", name: "Videojuegos", icon: "🎮", color: "#3b82f6" },
] as const

export const DIFFICULTIES = [
  { id: "Facil", name: "Fácil", time: 30, xpBase: 50, multiplier: 1, color: "#22c55e", desc: "30s por pregunta" },
  { id: "Medio", name: "Medio", time: 20, xpBase: 80, multiplier: 1.3, color: "#f59e0b", desc: "20s por pregunta" },
  { id: "Dificil", name: "Difícil", time: 15, xpBase: 120, multiplier: 1.7, color: "#ef4444", desc: "15s por pregunta" },
  { id: "Experto", name: "Experto", time: 10, xpBase: 200, multiplier: 2.2, color: "#a855f7", desc: "10s por pregunta · riesgo alto" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]
export type DifficultyId = (typeof DIFFICULTIES)[number]["id"]

// ===== SISTEMA DE XP Y NIVELES =====
// Fórmula: XP requerida para nivel N+1 = 100 * (1.2 ^ (N-1))
// Suave al inicio, requiere más esfuerzo en niveles altos sin volverse imposible.

export function xpRequiredForLevel(level: number): number {
  if (level < 1) return 0
  return Math.round(100 * Math.pow(1.2, level - 1))
}

export function totalXpForLevel(level: number): number {
  // XP acumulada requerida para ALCANZAR el nivel dado (partiendo de nivel 1 = 0 XP)
  let total = 0
  for (let l = 1; l < level; l++) {
    total += xpRequiredForLevel(l)
  }
  return total
}

export function computeLevelFromXp(xp: number): { level: number; xpIntoLevel: number; xpForNextLevel: number; progressPct: number } {
  let level = 1
  let remaining = xp
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level)
    level++
    if (level > 200) break // safety
  }
  const needed = xpRequiredForLevel(level)
  const pct = needed > 0 ? (remaining / needed) * 100 : 0
  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: needed,
    progressPct: Math.min(100, Math.max(0, pct)),
  }
}

// Tabla de niveles 1-20 (para debug/UI)
export const LEVEL_TABLE = Array.from({ length: 20 }, (_, i) => {
  const level = i + 1
  return {
    level,
    xpRequired: xpRequiredForLevel(level),
    cumulative: totalXpForLevel(level),
  }
})

// ===== XP POR PARTIDA =====
// XP final = xpBase * multiplier(dificultad) + bonusTiempo + bonusStreak
// bonusTiempo: si respondes correctamente en los primeros X segundos del temporizador,
//   ganas hasta +50% extra proporcional a la rapidez.
// bonusStreak: cada 3 aciertos seguidos = +20% acumulativo (cap 100%)

export interface XpBreakdown {
  base: number
  difficultyMultiplier: number
  difficultyBonus: number
  timeBonus: number
  streakBonus: number
  total: number
}

export function computeAnswerXp(params: {
  difficultyId: DifficultyId
  isCorrect: boolean
  timeRemaining: number // segundos restantes cuando respondió
  totalTime: number // tiempo total de la pregunta
  streak: number // racha actual de aciertos
}): XpBreakdown {
  const diff = DIFFICULTIES.find((d) => d.id === params.difficultyId)!
  const breakdown: XpBreakdown = {
    base: 0,
    difficultyMultiplier: diff.multiplier,
    difficultyBonus: 0,
    timeBonus: 0,
    streakBonus: 0,
    total: 0,
  }

  if (!params.isCorrect) return breakdown

  breakdown.base = diff.xpBase
  breakdown.difficultyBonus = Math.round(diff.xpBase * (diff.multiplier - 1))

  // Bonus por tiempo: hasta +50% si respondes en el primer 30% del temporizador
  const timeRatio = params.timeRemaining / params.totalTime
  if (timeRatio > 0.7) {
    breakdown.timeBonus = Math.round(diff.xpBase * 0.5)
  } else if (timeRatio > 0.4) {
    breakdown.timeBonus = Math.round(diff.xpBase * 0.3)
  } else if (timeRatio > 0.2) {
    breakdown.timeBonus = Math.round(diff.xpBase * 0.15)
  }

  // Bonus por racha: cada 3 aciertos consecutivos = +20% (cap 100%)
  const streakMultiplier = Math.min(1.0, Math.floor(params.streak / 3) * 0.2)
  if (streakMultiplier > 0) {
    breakdown.streakBonus = Math.round(diff.xpBase * streakMultiplier)
  }

  breakdown.total =
    breakdown.base + breakdown.difficultyBonus + breakdown.timeBonus + breakdown.streakBonus

  return breakdown
}

// ===== SISTEMA GACHA (LOOT BOX) =====
// Distribución de probabilidad acumulada para evitar sesgos:
// Común 55%, Inusual 25%, Raro 12%, Épico 6%, Legendario 2%

const RARITY_ORDER: Rarity[] = ["Comun", "Inusual", "Raro", "Epico", "Legendario"]

function rollRarity(rng: () => number = Math.random): Rarity {
  const r = rng() * 100 // 0..100
  let cumulative = 0
  for (const rarity of RARITY_ORDER) {
    cumulative += RARITY_CONFIG[rarity].probability * 100
    if (r <= cumulative) return rarity
  }
  return "Comun" // fallback
}

export interface LootBoxResult {
  item: GachaItem
  rarity: Rarity
  isDuplicate: boolean
  xpBonus: number // si era duplicado, se convierte en XP
}

/**
 * Abre una loot box y devuelve el resultado.
 * @param ownedItemIds - ids de items que ya posee el usuario
 */
export function openLootBox(ownedItemIds: string[]): LootBoxResult {
  const rarity = rollRarity()
  const pool = GACHA_ITEMS.filter((i) => i.rarity === rarity)
  // Si no hay items de esa rareza (no debería pasar), usar Común
  const finalPool = pool.length > 0 ? pool : GACHA_ITEMS.filter((i) => i.rarity === "Comun")
  const item = finalPool[Math.floor(Math.random() * finalPool.length)]

  const isDuplicate = ownedItemIds.includes(item.id)
  // Duplicados dan XP bonus proporcional a la rareza
  const xpBonusMap: Record<Rarity, number> = {
    Comun: 10,
    Inusual: 25,
    Raro: 60,
    Epico: 150,
    Legendario: 400,
  }
  const xpBonus = isDuplicate ? xpBonusMap[rarity] : 0

  return { item, rarity, isDuplicate, xpBonus }
}

// ===== AVATAR =====
export interface EquippedItems {
  hat?: GachaItem
  top?: GachaItem
  aura?: GachaItem
}

export function buildAvatarString(avatarBase: string, equipped: EquippedItems): string {
  // Render simple en capas: aura + cuerpo + top + hat (en texto)
  const parts: string[] = []
  if (equipped.aura) parts.push(equipped.aura.emoji)
  parts.push(avatarBase || "🧑")
  if (equipped.top) parts.push(equipped.top.emoji)
  if (equipped.hat) parts.push(equipped.hat.emoji)
  return parts.join(" ")
}
