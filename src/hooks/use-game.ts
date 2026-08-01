"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProfileData, StartGameResponse, AnswerResponse, LootBoxResultResponse, LoginResponse } from "@/lib/types"
import type { CategoryId, DifficultyId } from "@/lib/game"
import { parseJsonSafe, readApiError } from "@/lib/fetch-utils"

export function useProfile() {
  return useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await fetch("/api/profile")
      if (!r.ok) throw new Error(await readApiError(r, "Error al cargar perfil"))
      const data = await parseJsonSafe<ProfileData>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al cargar perfil")
      return data
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation<LoginResponse, Error, { provider: "google" | "guest"; email?: string; name?: string; googleId?: string }>({
    mutationFn: async (params) => {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!r.ok) {
        throw new Error(await readApiError(r, "Error al iniciar sesión"))
      }
      const data = await parseJsonSafe<LoginResponse>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al iniciar sesión")
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
      qc.invalidateQueries({ queryKey: ["inventory"] })
    },
    retry: 0,
  })
}

export function useEquipProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { type: "frame" | "icon" | "base"; key: string }) => {
      const r = await fetch("/api/equip-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!r.ok) {
        throw new Error(await readApiError(r, "Error al equipar"))
      }
      const data = await parseJsonSafe<{ ok: boolean }>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al equipar")
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
    },
    retry: 0,
  })
}

export function useUpdateName() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { name: string }) => {
      const r = await fetch("/api/profile/name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!r.ok) {
        throw new Error(await readApiError(r, "Error al actualizar nombre"))
      }
      const data = await parseJsonSafe<{ ok: boolean; name: string }>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al actualizar nombre")
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
    },
    retry: 0,
  })
}

export function useStartGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      category: CategoryId
      categories?: CategoryId[]
      difficulty: DifficultyId
      mode?: "classic" | "survival" | "suddendeath"
      questionCount?: number
      timePreset?: number
    }): Promise<StartGameResponse> => {
      const r = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!r.ok) throw new Error(await readApiError(r, "Error al iniciar partida"))
      const data = await parseJsonSafe<StartGameResponse>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al iniciar partida")
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
    retry: 0,
  })
}

export function useAnswerQuestion() {
  return useMutation({
    mutationFn: async (params: {
      sessionId: string
      questionId: string
      selectedAnswer: string
      timeRemaining: number
      totalTime: number
      streak: number
      lives?: number
      mode?: "classic" | "survival" | "suddendeath"
    }): Promise<AnswerResponse> => {
      const r = await fetch("/api/game/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!r.ok) throw new Error(await readApiError(r, "Error al procesar respuesta"))
      const data = await parseJsonSafe<AnswerResponse>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al procesar respuesta")
      return data
    },
    retry: 0,
  })
}

export interface EndSessionResult {
  ok: boolean
  result: "win" | "loss" | "pending"
  isSurvival?: boolean
  isSuddenDeath?: boolean
  mode?: "classic" | "survival" | "suddendeath"
  isNewRecord?: boolean
  survivalStats?: {
    correct: number
    xp: number
    bestCorrect: number
    bestXp: number
    totalRuns: number
  } | null
  suddenDeathStats?: {
    correct: number
    xp: number
    bestCorrect: number
    bestXp: number
    totalRuns: number
  } | null
}

export function useEndSession() {
  return useMutation<EndSessionResult, Error, { sessionId: string; mode?: "classic" | "survival" | "suddendeath" }>({
    mutationFn: async (params) => {
      const r = await fetch("/api/game/answer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: params.sessionId, mode: params.mode }),
      })
      if (!r.ok) throw new Error(await readApiError(r, "Error al finalizar sesión"))
      const data = await parseJsonSafe<EndSessionResult>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al finalizar sesión")
      return data
    },
    retry: 0,
  })
}

export function useOpenLootBox() {
  const qc = useQueryClient()
  return useMutation<LootBoxResultResponse, Error, void>({
    mutationFn: async () => {
      const r = await fetch("/api/loot/open", { method: "POST" })
      if (!r.ok) {
        throw new Error(await readApiError(r, "Error al abrir caja"))
      }
      const data = await parseJsonSafe<LootBoxResultResponse>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al abrir caja")
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
      qc.invalidateQueries({ queryKey: ["inventory"] })
    },
    retry: 0,
  })
}

export interface InventoryItemClient {
  id: string
  name: string
  type: "hat" | "top" | "aura"
  rarity: "Comun" | "Inusual" | "Raro" | "Epico" | "Legendario"
  emoji: string
  description: string
  owned: boolean
  acquiredAt: string | null
  equipped: boolean
  rarityColor: string
  rarityLabel: string
}

export function useInventory() {
  return useQuery<{
    items: InventoryItemClient[]
    equipped: { hat: string | null; top: string | null; aura: string | null }
    inventoryCount: number
    totalCount: number
  }>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const r = await fetch("/api/inventory")
      if (!r.ok) throw new Error(await readApiError(r, "Error al cargar inventario"))
      const data = await parseJsonSafe<{
        items: InventoryItemClient[]
        equipped: { hat: string | null; top: string | null; aura: string | null }
        inventoryCount: number
        totalCount: number
      }>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al cargar inventario")
      return data
    },
    staleTime: 0,
    retry: 1,
  })
}

export function useEquipItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string }) => {
      const r = await fetch("/api/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })
      if (!r.ok) throw new Error(await readApiError(r, "Error al equipar"))
      const data = await parseJsonSafe<{ ok: boolean }>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al equipar")
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] })
      qc.invalidateQueries({ queryKey: ["profile"] })
    },
    retry: 0,
  })
}

export function useUnequipItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ slot }: { slot: "hat" | "top" | "aura" }) => {
      const r = await fetch("/api/equip", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot }),
      })
      if (!r.ok) throw new Error(await readApiError(r, "Error al quitar"))
      const data = await parseJsonSafe<{ ok: boolean }>(r)
      if (!data) throw new Error("Respuesta vacía del servidor al quitar")
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] })
      qc.invalidateQueries({ queryKey: ["profile"] })
    },
    retry: 0,
  })
}
