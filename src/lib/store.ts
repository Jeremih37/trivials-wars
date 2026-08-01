"use client"

import { create } from "zustand"
import type { ClientQuestion, StartGameResponse, AnswerResponse } from "@/lib/types"
import type { DifficultyId, CategoryId } from "@/lib/game"

export type GameScreen = "login" | "welcome" | "home" | "playing" | "results" | "profile" | "inventory" | "lootbox"

export interface ActiveGame {
  sessionId: string
  category: CategoryId
  difficulty: DifficultyId
  timePerQuestion: number
  questions: ClientQuestion[]
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
  selectedDifficulty: DifficultyId | null
  setCategory: (c: CategoryId) => void
  setDifficulty: (d: DifficultyId) => void

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

  // Resultados de la última respuesta
  lastAnswer: AnswerResponse | null
  setLastAnswer: (a: AnswerResponse | null) => void

  // Reset completo
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: "login",
  setScreen: (s) => set({ screen: s }),

  isAuthenticated: false,
  setAuthenticated: (v) => set({ isAuthenticated: v }),

  selectedCategory: null,
  selectedDifficulty: null,
  setCategory: (c) => set({ selectedCategory: c }),
  setDifficulty: (d) => set({ selectedDifficulty: d }),

  activeGame: null,
  startGame: (data) =>
    set({
      activeGame: {
        sessionId: data.sessionId,
        category: data.category as CategoryId,
        difficulty: data.difficulty as DifficultyId,
        timePerQuestion: data.timePerQuestion,
        questions: data.questions,
      },
      currentQuestionIndex: 0,
      correctCount: 0,
      totalXpEarned: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastAnswer: null,
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

  lastAnswer: null,
  setLastAnswer: (a) => set({ lastAnswer: a }),

  reset: () =>
    set({
      activeGame: null,
      currentQuestionIndex: 0,
      correctCount: 0,
      totalXpEarned: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastAnswer: null,
      screen: "home",
      selectedCategory: null,
      selectedDifficulty: null,
    }),
}))
