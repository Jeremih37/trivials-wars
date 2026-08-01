"use client"

import { create } from "zustand"
import type { ClientQuestion, StartGameResponse, AnswerResponse } from "@/lib/types"
import type { DifficultyId, CategoryId, GameModeId } from "@/lib/game"
import { SURVIVAL_CONFIG } from "@/lib/game"

export type GameScreen = "login" | "welcome" | "home" | "playing" | "results" | "profile" | "lootbox"

export interface ActiveGame {
  sessionId: string
  category: CategoryId
  difficulty: DifficultyId
  timePerQuestion: number // tiempo base (puede ser 0 = sin tiempo)
  questions: ClientQuestion[]
  mode: GameModeId
  // Survival: vidas restantes
  lives: number
}

interface GameState {
  // Pantalla activa
  screen: GameScreen
  setScreen: (s: GameScreen) => void

  // Auth
  isAuthenticated: boolean
  setAuthenticated: (v: boolean) => void

  // Setup del juego
  selectedCategory: CategoryId | null
  selectedCategories: CategoryId[] // multi-select Frutiger Aero GDD V2
  selectedDifficulty: DifficultyId | null
  selectedMode: GameModeId
  selectedQuestionCount: number
  selectedTimePreset: number // 10, 15 o 0 (sin tiempo) — en desuso, se mantiene para compat
  setCategory: (c: CategoryId) => void
  setCategories: (cs: CategoryId[]) => void
  toggleCategory: (c: CategoryId) => void
  setDifficulty: (d: DifficultyId) => void
  setMode: (m: GameModeId) => void
  setQuestionCount: (n: number) => void
  setTimePreset: (t: number) => void

  // Juego activo
  activeGame: ActiveGame | null
  startGame: (data: StartGameResponse) => void
  endGame: () => void

  // Estado durante la partida
  currentQuestionIndex: number
  setCurrentQuestionIndex: (i: number) => void

  correctCount: number
  addCorrect: () => void

  totalXpEarned: number
  addXp: (xp: number) => void

  currentStreak: number
  setStreak: (s: number) => void

  bestStreak: number
  setBestStreak: (s: number) => void

  // Survival: vidas
  lives: number
  loseLife: () => void
  resetLives: () => void

  // Resultados de la última respuesta
  lastAnswer: AnswerResponse | null
  setLastAnswer: (a: AnswerResponse | null) => void

  // Modo supervivencia — para saber si terminó por quedarse sin vidas
  survivalEnded: boolean
  setSurvivalEnded: (v: boolean) => void

  // Resultado de finalizar sesión (incluye info de récord personal)
  lastSessionResult: {
    isSurvival?: boolean
    isNewRecord?: boolean
    survivalStats?: {
      correct: number
      xp: number
      bestCorrect: number
      bestXp: number
      totalRuns: number
    } | null
  } | null
  setLastSessionResult: (r: {
    isSurvival?: boolean
    isNewRecord?: boolean
    survivalStats?: {
      correct: number
      xp: number
      bestCorrect: number
      bestXp: number
      totalRuns: number
    } | null
  } | null) => void

  // Reset completo
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: "login",
  setScreen: (s) => set({ screen: s }),

  isAuthenticated: false,
  setAuthenticated: (v) => set({ isAuthenticated: v }),

  selectedCategory: null,
  selectedCategories: [],
  selectedDifficulty: null,
  selectedMode: "classic",
  selectedQuestionCount: 10,
  selectedTimePreset: 15,
  setCategory: (c) => set({ selectedCategory: c, selectedCategories: [c] }),
  setCategories: (cs) => set({ selectedCategories: cs, selectedCategory: cs.length === 1 ? cs[0] : (cs.length === 0 ? null : "mix") }),
  toggleCategory: (c) => set((s) => {
    const exists = s.selectedCategories.includes(c)
    const next = exists ? s.selectedCategories.filter((x) => x !== c) : [...s.selectedCategories, c]
    return {
      selectedCategories: next,
      selectedCategory: next.length === 0 ? null : next.length === 1 ? next[0] : "mix",
    }
  }),
  setDifficulty: (d) => set({ selectedDifficulty: d }),
  setMode: (m) => set({ selectedMode: m }),
  setQuestionCount: (n) => set({ selectedQuestionCount: n }),
  setTimePreset: (t) => set({ selectedTimePreset: t }),

  activeGame: null,
  startGame: (data) =>
    set({
      activeGame: {
        sessionId: data.sessionId,
        category: data.category as CategoryId,
        difficulty: data.difficulty as DifficultyId,
        timePerQuestion: data.timePerQuestion,
        questions: data.questions,
        mode: (data as StartGameResponse & { mode?: GameModeId }).mode ?? "classic",
        lives: SURVIVAL_CONFIG.initialLives,
      },
      currentQuestionIndex: 0,
      correctCount: 0,
      totalXpEarned: 0,
      currentStreak: 0,
      bestStreak: 0,
      lives: SURVIVAL_CONFIG.initialLives,
      lastAnswer: null,
      survivalEnded: false,
      screen: "playing",
    }),
  endGame: () => set({ screen: "results" }),

  currentQuestionIndex: 0,
  setCurrentQuestionIndex: (i) => set({ currentQuestionIndex: i }),

  correctCount: 0,
  addCorrect: () => set((s) => ({ correctCount: s.correctCount + 1 })),

  totalXpEarned: 0,
  addXp: (xp) => set((s) => ({ totalXpEarned: s.totalXpEarned + xp })),

  currentStreak: 0,
  setStreak: (s) => set({ currentStreak: s }),

  bestStreak: 0,
  setBestStreak: (s) => set((state) => ({ bestStreak: Math.max(state.bestStreak, s) })),

  lives: SURVIVAL_CONFIG.initialLives,
  loseLife: () => set((s) => ({ lives: Math.max(0, s.lives - 1) })),
  resetLives: () => set({ lives: SURVIVAL_CONFIG.initialLives }),

  lastAnswer: null,
  setLastAnswer: (a) => set({ lastAnswer: a }),

  survivalEnded: false,
  setSurvivalEnded: (v) => set({ survivalEnded: v }),

  lastSessionResult: null,
  setLastSessionResult: (r) => set({ lastSessionResult: r }),

  reset: () =>
    set({
      activeGame: null,
      currentQuestionIndex: 0,
      correctCount: 0,
      totalXpEarned: 0,
      currentStreak: 0,
      bestStreak: 0,
      lives: SURVIVAL_CONFIG.initialLives,
      lastAnswer: null,
      survivalEnded: false,
      lastSessionResult: null,
      screen: "home",
      selectedCategory: null,
      selectedCategories: [],
      selectedDifficulty: null,
    }),
}))
