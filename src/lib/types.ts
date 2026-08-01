// Tipos compartidos entre cliente y servidor (v2)
import type { Rarity, ItemType } from "./gacha-catalog"

export interface ClientQuestion {
  id: string
  uuid: string
  question: string
  options: string[]
  explanation?: string | null
}

export interface StartGameResponse {
  sessionId: string
  difficulty: string
  category: string
  timePerQuestion: number
  xpBase: number
  multiplier: number
  questions: ClientQuestion[]
  mode?: "classic" | "survival" | "suddendeath"
  initialLives?: number
}

export interface AnswerResponse {
  isCorrect: boolean
  correctAnswer: string
  xpGained: number
  xpBreakdown: {
    base: number
    difficultyMultiplier: number
    difficultyBonus: number
    timeBonus: number
    streakBonus: number
    total: number
    combo?: number
  }
  newTotalXp?: number
  newLevel?: number
  levelUp?: boolean
  boxesAvailable?: number
  explanation?: string | null
}

export interface LootBoxResultResponse {
  item: {
    id: string
    name: string
    type: ItemType
    rarity: Rarity
    description: string
  }
  rarity: Rarity
  isDuplicate: boolean
  xpBonus: number
  newTotalXp: number
  newLevel: number
  levelUp: boolean
  boxesRemaining: number
}

export interface ProfileFrame {
  id: string
  name: string
  description: string
  unlockLevel: number
  hex: string
  unlocked: boolean
  equipped: boolean
}

export interface ProfileIconClient {
  id: string
  emoji: string
  name: string
  unlockLevel: number
  unlocked: boolean
  equipped: boolean
}

export interface ProfileData {
  user: {
    id: string
    name: string
    email: string | null
    provider: string
    avatarBase: string
    skinTone: string
    profileIcon: string
    profileIconEmoji: string
    equippedFrame: string
    xp: number
    level: number
    coins: number
    boxes: number
    xpIntoLevel: number
    xpForNextLevel: number
    progressPct: number
    equipped: { hat: string | null; top: string | null; aura: string | null }
    inventoryCount: number
    inventoryByRarity: Record<Rarity, string[]>
    // Stats
    wins: number
    losses: number
    currentStreak: number
    maxStreak: number
    gamesPlayed: number
    winRate: number
    // Stats específicas de Supervivencia (GDD: récord personal)
    survivalBestCorrect: number
    survivalBestXp: number
    survivalRuns: number
    // Stats específicas de Muerte Súbita (GDD V3.0)
    suddenDeathBestCorrect: number
    suddenDeathBestXp: number
    suddenDeathRuns: number
  }
  progress: Array<{
    category: string
    difficulty: string
    correct: number
    total: number
    bestStreak: number
  }>
  frames: ProfileFrame[]
  icons: ProfileIconClient[]
}

export interface LoginResponse {
  userId: string
  name: string
  email?: string
  provider: string
  level: number
  isNew: boolean
}
