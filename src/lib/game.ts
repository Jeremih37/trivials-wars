// ===============================
// Trivials Wars — Game Logic Core
// ===============================

// Ojo: game.ts no debe contener JSX. Importamos solo tipos y constantes sin JSX
// desde gacha-catalog.ts. AVATAR_BASES_INFO es metadata serializable.
import type { GachaItem, Rarity } from "./gacha-catalog"
import { GACHA_ITEMS, RARITY_CONFIG, AVATAR_BASES_INFO } from "./gacha-catalog"

export { AVATAR_BASES_INFO }

// ===== CATEGORÍAS Y DIFICULTADES =====
// 16 categorías: 10 originales + 6 nuevas "Aquatic Ambience" (modernas y atractivas)
export const CATEGORIES = [
  // --- Categorías originales ---
  { id: "Entretenimiento", name: "Entretenimiento", icon: "🎬", color: "#00B4D8" },
  { id: "Deporte", name: "Deporte", icon: "⚽", color: "#10b981" },
  { id: "Historia", name: "Historia", icon: "📜", color: "#fbbf24" },
  { id: "Matematicas", name: "Matemáticas", icon: "🔢", color: "#8b5cf6" },
  { id: "Ciencia", name: "Ciencia", icon: "🔬", color: "#2dd4bf" },
  { id: "Videojuegos", name: "Videojuegos", icon: "🎮", color: "#3b82f6" },
  { id: "Geografia", name: "Geografía", icon: "🌍", color: "#22d3ee" },
  { id: "Arte", name: "Arte y Literatura", icon: "🎨", color: "#f97316" },
  { id: "Tecnologia", name: "Tecnología", icon: "💻", color: "#67e8f9" },
  { id: "Mitologia", name: "Mitología", icon: "⚡", color: "#a855f7" },
  // --- Nuevas categorías Aquatic Ambience ---
  { id: "Retrofuturismo", name: "Futuro del Ayer", icon: "🛸", color: "#00F5D4" },
  { id: "Oceano", name: "Misterios del Océano", icon: "🌊", color: "#00B4D8" },
  { id: "IA", name: "IA & Mundo Digital", icon: "🤖", color: "#00F5D4" },
  { id: "Astronomia", name: "Astronomía", icon: "🪐", color: "#7dd3fc" },
  { id: "CulturaPop", name: "Cultura Pop", icon: "🎤", color: "#FF4D6D" },
  { id: "Maravillas", name: "Maravillas Ocultas", icon: "🗺️", color: "#2dd4bf" },
] as const

export const DIFFICULTIES = [
  { id: "Facil", name: "Fácil", time: 30, xpBase: 50, multiplier: 1, color: "#10b981", desc: "30s por pregunta" },
  { id: "Medio", name: "Medio", time: 20, xpBase: 80, multiplier: 1.3, color: "#fbbf24", desc: "20s por pregunta" },
  { id: "Dificil", name: "Difícil", time: 15, xpBase: 120, multiplier: 1.7, color: "#fb7185", desc: "15s por pregunta" },
  { id: "Experto", name: "Experto", time: 10, xpBase: 200, multiplier: 2.2, color: "#a855f7", desc: "10s por pregunta · riesgo alto" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"] | "mix"
export type DifficultyId = (typeof DIFFICULTIES)[number]["id"]

// ===== MODOS DE JUEGO =====
export const GAME_MODES = [
  {
    id: "classic",
    name: "Reto Personalizado",
    icon: "🎯",
    color: "#00F5D4",
    desc: "Configurá la partida a tu medida: cantidad de preguntas, tiempo y categoría.",
  },
  {
    id: "survival",
    name: "Supervivencia Abisal",
    icon: "💀",
    color: "#FF4D6D",
    desc: "3 corazones. Cada error te resta una vida. ¿Hasta dónde llegás en el abismo?",
  },
] as const

export type GameModeId = (typeof GAME_MODES)[number]["id"]

// ===== CANTIDAD DE PREGUNTAS (modo clásico / Reto Personalizado) =====
// Según GDD: 5 (Rápida), 10 (Estándar), 20 (Maratón), 50 (Gran Reto)
export const QUESTION_COUNTS = [
  { id: 5, label: "5", desc: "Rápida", color: "#10b981" },
  { id: 10, label: "10", desc: "Estándar", color: "#00F5D4" },
  { id: 20, label: "20", desc: "Maratón", color: "#00B4D8" },
  { id: 50, label: "50", desc: "Gran Reto", color: "#FF4D6D" },
] as const

// ===== SELECTOR DE TIEMPO (modo clásico / Reto Personalizado) =====
// Según GDD: 10s, 15s o Sin tiempo
export const TIME_PRESETS = [
  { id: 10, label: "10s", desc: "Relámpago", color: "#FF4D6D" },
  { id: 15, label: "15s", desc: "Ágil", color: "#fbbf24" },
  { id: 0, label: "∞", desc: "Sin tiempo", color: "#00F5D4" },
] as const

// ===== CONFIGURACIÓN DEL MODO SUPERVIVENCIA "ABISAL" =====
// Según GDD:
//   - 3 corazones (vidas)
//   - Tiempo decreciente: cada 5 correctas baja 1s (mínimo 5s)
//   - Multiplicador de racha (combo): 3 seguidas = x2, 5 seguidas = x3
export const SURVIVAL_CONFIG = {
  initialLives: 3, // ❤️ ❤️ ❤️
  initialTime: 15, // seg por pregunta al inicio
  minTime: 5, // mínimo tras reducciones
  timeDecrementEvery: 5, // cada 5 correctas, baja 1s
  initialPoolSize: 30, // preguntas iniciales que se cargan
  refillThreshold: 10,
  refillSize: 20,
  xpBasePerCorrect: 30,
  // Combo multiplier: 0-2 streak = x1, 3-4 streak = x2, 5+ streak = x3
  comboMultiplier: (streak: number): number => {
    if (streak >= 5) return 3
    if (streak >= 3) return 2
    return 1
  },
  // Tiempo actual según racha de correctas
  currentTime: (correctCount: number): number => {
    const decrements = Math.floor(correctCount / 5)
    return Math.max(5, 15 - decrements)
  },
} as const

// ===== SISTEMA DE XP Y NIVELES =====
export function xpRequiredForLevel(level: number): number {
  if (level < 1) return 0
  return Math.round(100 * Math.pow(1.2, level - 1))
}

export function totalXpForLevel(level: number): number {
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
    if (level > 200) break
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

export const LEVEL_TABLE = Array.from({ length: 20 }, (_, i) => {
  const level = i + 1
  return {
    level,
    xpRequired: xpRequiredForLevel(level),
    cumulative: totalXpForLevel(level),
  }
})

// ===== XP POR PARTIDA =====
export interface XpBreakdown {
  base: number
  difficultyMultiplier: number
  difficultyBonus: number
  timeBonus: number
  streakBonus: number
  total: number
  combo?: number // multiplicador de combo (sólo survival)
}

export function computeAnswerXp(params: {
  difficultyId: DifficultyId
  isCorrect: boolean
  timeRemaining: number
  totalTime: number
  streak: number
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

  const timeRatio = params.totalTime > 0 ? params.timeRemaining / params.totalTime : 0.5
  if (timeRatio > 0.7) {
    breakdown.timeBonus = Math.round(diff.xpBase * 0.5)
  } else if (timeRatio > 0.4) {
    breakdown.timeBonus = Math.round(diff.xpBase * 0.3)
  } else if (timeRatio > 0.2) {
    breakdown.timeBonus = Math.round(diff.xpBase * 0.15)
  }

  const streakMultiplier = Math.min(1.0, Math.floor(params.streak / 3) * 0.2)
  if (streakMultiplier > 0) {
    breakdown.streakBonus = Math.round(diff.xpBase * streakMultiplier)
  }

  breakdown.total =
    breakdown.base + breakdown.difficultyBonus + breakdown.timeBonus + breakdown.streakBonus

  return breakdown
}

// XP para modo supervivencia — combo multiplier según GDD
export function computeSurvivalXp(streak: number): { base: number; streakBonus: number; total: number; combo: number } {
  const base = SURVIVAL_CONFIG.xpBasePerCorrect
  const combo = SURVIVAL_CONFIG.comboMultiplier(streak)
  const total = base * combo
  const streakBonus = total - base
  return {
    base,
    streakBonus,
    total,
    combo,
  }
}

// ===== SISTEMA GACHA (LOOT BOX) =====
const RARITY_ORDER: Rarity[] = ["Comun", "Inusual", "Raro", "Epico", "Legendario"]

function rollRarity(rng: () => number = Math.random): Rarity {
  const r = rng() * 100
  let cumulative = 0
  for (const rarity of RARITY_ORDER) {
    cumulative += RARITY_CONFIG[rarity].probability * 100
    if (r <= cumulative) return rarity
  }
  return "Comun"
}

export interface LootBoxResult {
  item: GachaItem
  rarity: Rarity
  isDuplicate: boolean
  xpBonus: number
}

export function openLootBox(ownedItemIds: string[]): LootBoxResult {
  const rarity = rollRarity()
  const pool = GACHA_ITEMS.filter((i) => i.rarity === rarity)
  const finalPool = pool.length > 0 ? pool : GACHA_ITEMS.filter((i) => i.rarity === "Comun")
  const item = finalPool[Math.floor(Math.random() * finalPool.length)]

  const isDuplicate = ownedItemIds.includes(item.id)
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

// ===== WIN/LOSS/STREAK =====
export const WIN_THRESHOLD = 0.6

export function computeSessionResult(correctCount: number, totalQuestions: number): "win" | "loss" {
  if (totalQuestions === 0) return "loss"
  return correctCount / totalQuestions >= WIN_THRESHOLD ? "win" : "loss"
}

// ===== UNLOCKS AUTOMÁTICOS =====
export function checkFrameUnlocks(level: number): string[] {
  const frames: string[] = []
  for (let l = 10; l <= level; l += 10) {
    if (l <= 50) {
      const map: Record<number, string> = {
        10: "frame_bronze",
        20: "frame_silver",
        30: "frame_gold",
        40: "frame_diamond",
        50: "frame_legendary",
      }
      if (map[l]) frames.push(map[l])
    }
  }
  return frames
}

export function checkIconUnlocks(level: number): string[] {
  const icons: string[] = []
  const thresholds = [1, 5, 15, 25, 35, 45, 50]
  for (const t of thresholds) {
    if (level >= t) icons.push(`lvl_${t}`)
  }
  return icons
}
