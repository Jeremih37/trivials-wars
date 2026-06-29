"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProfileData, StartGameResponse, AnswerResponse, LootBoxResultResponse, LoginResponse } from "@/lib/types"
import type { CategoryId, DifficultyId } from "@/lib/game"

export function useProfile() {
  return useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await fetch("/api/profile")
      if (!r.ok) throw new Error("Error al cargar perfil")
      return r.json()
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
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
        const e = await r.json()
        throw new Error(e.error || "Error al iniciar sesión")
      }
      return r.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
      qc.invalidateQueries({ queryKey: ["inventory"] })
    },
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
        const e = await r.json()
        throw new Error(e.error || "Error al equipar")
      }
      return r.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
    },
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
        const e = await r.json()
        throw new Error(e.error || "Error al actualizar nombre")
      }
      return r.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export function useStartGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { category: CategoryId; difficulty: DifficultyId }): Promise<StartGameResponse> => {
      const r = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!r.ok) throw new Error("Error al iniciar partida")
      return r.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
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
    }): Promise<AnswerResponse> => {
      const r = await fetch("/api/game/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!r.ok) throw new Error("Error al procesar respuesta")
      return r.json()
    },
  })
}

export function useEndSession() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await fetch("/api/game/answer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
    },
  })
}

export function useOpenLootBox() {
  const qc = useQueryClient()
  return useMutation<LootBoxResultResponse, Error, void>({
    mutationFn: async () => {
      const r = await fetch("/api/loot/open", { method: "POST" })
      if (!r.ok) {
        const e = await r.json()
        throw new Error(e.error || "Error al abrir caja")
      }
      return r.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] })
      qc.invalidateQueries({ queryKey: ["inventory"] })
    },
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
      if (!r.ok) throw new Error("Error al cargar inventario")
      return r.json()
    },
    staleTime: 0,
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
      if (!r.ok) throw new Error("Error al equipar")
      return r.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] })
      qc.invalidateQueries({ queryKey: ["profile"] })
    },
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
      if (!r.ok) throw new Error("Error al quitar")
      return r.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] })
      qc.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}
