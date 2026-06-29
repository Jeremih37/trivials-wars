// Tipos compartidos entre cliente y servidor
import type { Rarity, ItemType } from "./gacha-catalog"

export interface ClientQuestion {
  id: string
  uuid: string
  question: string
  options: string[]
}

export interface StartGameResponse {
  sessionId: string
  difficulty: string
  category: string
  timePerQuestion: number
  xpBase: number
  multiplier: number
  questions: ClientQuestion[]
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
  }
  newTotalXp?: number
  newLevel?: number
  levelUp?: boolean
  boxesAvailable?: number
}

export interface LootBoxResultResponse {
  item: {
    id: string
    name: string
    type: ItemType
    rarity: Rarity
    emoji: string
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

export interface ProfileData {
  user: {
    id: string
    name: string
    avatarBase: string
    xp: number
    level: number
    coins: number
    boxes: number
    xpIntoLevel: number
    xpForNextLevel: number
    progressPct: number
    avatarString: string
    equipped: {
      hat: string | null
      top: string | null
      aura: string | null
    }
    inventoryCount: number
    inventoryByRarity: Record<Rarity, string[]>
  }
  progress: Array<{
    category: string
    difficulty: string
    correct: number
    total: number
    bestStreak: number
  }>
}
