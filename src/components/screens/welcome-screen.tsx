"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { useGameStore } from "@/lib/store"
import { useProfile, useUpdateName } from "@/hooks/use-game"
import { AvatarSvg, buildAvatarFromIds } from "@/components/avatar-svg"
import { FRAMES_BY_ID } from "@/lib/profile-catalog"
import { WisdomCapsule } from "@/components/wisdom-capsule"
import { AudioToggle } from "@/components/audio-toggle"
import {
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  Heart,
  Skull,
  Swords,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FUN_FACTS } from "@/lib/facts-data"

// ============================================================
// WELCOME SCREEN — Editorial dark minimal · Compact natural flow
// Refs: Linear, Vercel docs, Notion. No emojis, no glassy gradients.
// ============================================================

export function WelcomeScreen() {
  const { setScreen } = useGameStore()
  const { data: profile } = useProfile()
  const updateNameMut = useUpdateName()

  // ====== Orden barajado de facts (Fisher-Yates) ======
  const [order, setOrder] = useState<number[]>(() => shuffleIds(FUN_FACTS.length))
  const [factIdx, setFactIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")

  const currentFact = FUN_FACTS[order[factIdx]]

  useEffect(() => {
    if (!autoPlay) return
    const t = setInterval(() => {
      setFactIdx((i) => {
        const next = i + 1
        if (next >= FUN_FACTS.length) {
          setOrder(shuffleIds(FUN_FACTS.length))
          return 0
        }
        return next
      })
    }, 6500)
    return () => clearInterval(t)
  }, [autoPlay])

  const goNext = useCallback(() => {
    setFactIdx((i) => {
      const next = i + 1
      if (next >= FUN_FACTS.length) {
        setOrder(shuffleIds(FUN_FACTS.length))
        return 0
      }
      return next
    })
  }, [])
  const goPrev = useCallback(() => {
    setFactIdx((i) => (i - 1 + FUN_FACTS.length) % FUN_FACTS.length)
  }, [])

  const startEditName = () => {
    setNameInput(profile?.user.name ?? "Jugador")
    setEditingName(true)
  }

  const saveName = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    updateNameMut.mutate(
      { name: trimmed },
      { onSuccess: () => setEditingName(false) }
    )
  }

  const avatarData = profile
    ? buildAvatarFromIds(profile.user.avatarBase, profile.user.skinTone, profile.user.equipped)
    : null
  const frame = profile ? FRAMES_BY_ID[profile.user.equippedFrame] : null
  const displayName = profile?.user.name ?? "Jugador"

  return (
    <div className="relative min-h-dvh flex flex-col bg-[#0a0a0f] text-[#e4e4e7]">
      {/* Fondo: halos sutiles, no cromados */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, rgba(120, 119, 198, 0.08) 0%, transparent 60%), radial-gradient(50% 50% at 0% 100%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)",
        }}
      />
      {/* Grano fino opcional: patrón sutil de puntos */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header minimalista */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-white/5 shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
              <span className="font-fancy italic text-[10px] font-bold text-white">T</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-fancy italic font-bold text-xs text-white tracking-tight">Trivials Wars</span>
              <span className="text-[8px] uppercase tracking-[0.18em] text-zinc-500 mt-0.5 hidden sm:inline">El conocimiento es poder</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <AudioToggle compact />
            <button
              onClick={() => setScreen("lootbox")}
              className="relative px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition text-zinc-200"
              title="Abrir Loot Box"
            >
              <span className="text-[10px] font-medium">Caja</span>
              {profile?.user.boxes ? (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center tabular-nums">
                  {profile.user.boxes}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setScreen("profile")}
              className="relative p-0.5 rounded-md bg-white/5 border border-white/10 hover:border-white/20 transition"
              title="Perfil"
            >
              {profile && frame ? (
                <div className="relative w-6 h-6">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    {frame.render()}
                  </svg>
                  <div className="absolute inset-1 rounded-full bg-white/5 flex items-center justify-center">
                    {avatarData && <AvatarSvg {...avatarData} size={20} />}
                  </div>
                </div>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-3 flex flex-col gap-2.5">
        {/* ====== HERO compacto ====== */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 pb-2 border-b border-white/5"
        >
          {/* Avatar + Nivel */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center overflow-hidden">
                {avatarData && <AvatarSvg {...avatarData} size={36} />}
              </div>
              {frame && (
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                  {frame.render()}
                </svg>
              )}
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-[7px] uppercase tracking-[0.2em] text-zinc-500">Nivel</span>
              <span className="font-fancy italic text-sm font-bold text-white tabular-nums leading-none">
                {profile?.user.level ?? 1}
              </span>
            </div>
          </div>

          {/* Saludo + edición + stats */}
          <div className="flex-1 min-w-0">
            {!editingName ? (
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-fancy italic text-base sm:text-lg font-bold tracking-tight text-white leading-none">
                  Hola, <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">{displayName}</span>
                </h1>
                <button
                  onClick={startEditName}
                  className="p-0.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  title="Editar nombre"
                >
                  <Pencil className="w-2.5 h-2.5 text-zinc-400" />
                </button>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 ml-auto">
                  <Stat label="XP" value={profile?.user.xp ?? 0} />
                  <Stat label="Victorias" value={profile?.user.wins ?? 0} />
                  <Stat label="Racha" value={profile?.user.currentStreak ?? 0} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value.slice(0, 20))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName()
                    if (e.key === "Escape") setEditingName(false)
                  }}
                  autoFocus
                  placeholder="Tu nombre de jugador"
                  className="px-2 py-1 rounded-md bg-white/5 border border-white/15 text-[11px] font-medium text-white focus:border-white/30 focus:outline-none w-full sm:w-auto sm:min-w-[200px]"
                />
                <button
                  onClick={saveName}
                  disabled={updateNameMut.isPending}
                  className="px-2 py-1 rounded-md bg-white text-black hover:bg-zinc-200 transition flex items-center gap-1 font-semibold text-[10px]"
                >
                  <Check className="w-2.5 h-2.5" />
                  {updateNameMut.isPending ? "Guardando…" : "Guardar"}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition text-[10px] font-medium text-zinc-300"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* ====== Modos rápidos ====== */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
        >
          <div className="grid grid-cols-3 gap-1.5">
            <QuickMode
              icon={<Swords className="w-3 h-3" />}
              label="Reto"
              onClick={() => {
                useGameStore.getState().setMode("classic")
                setScreen("home")
              }}
            />
            <QuickMode
              icon={<Heart className="w-3 h-3" />}
              label="Abismo"
              onClick={() => {
                useGameStore.getState().setMode("survival")
                setScreen("home")
              }}
            />
            <QuickMode
              icon={<Skull className="w-3 h-3" />}
              label="Muerte Súbita"
              onClick={() => {
                useGameStore.getState().setMode("suddendeath")
                setScreen("home")
              }}
            />
          </div>
        </motion.section>

        {/* ====== Carruseles en 2 columnas (lg+) — sin forzar altura ====== */}
        <div className="grid lg:grid-cols-2 gap-2.5 items-start">
          {/* "¿Sabías que…?" */}
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-baseline gap-2">
                <h2 className="font-fancy italic text-sm font-bold text-white tracking-tight">
                  ¿Sabías que…?
                </h2>
                <span className="text-[8px] uppercase tracking-[0.18em] text-zinc-500 hidden sm:inline">
                  {factIdx + 1} / {FUN_FACTS.length}
                </span>
              </div>
              <button
                onClick={() => setAutoPlay((v) => !v)}
                className={cn(
                  "px-1.5 py-0.5 rounded-md text-[8px] font-medium border transition tracking-wide",
                  autoPlay
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-transparent border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                {autoPlay ? "Auto ON" : "Auto OFF"}
              </button>
            </div>

            <div
              className="relative overflow-hidden rounded-lg bg-white/[0.02] border border-white/10 p-2.5"
              onPointerEnter={() => setAutoPlay(false)}
              onPointerLeave={() => setAutoPlay(true)}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] transition-colors"
                style={{ background: currentFact.color }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFact.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: currentFact.color }}
                    />
                    <span
                      className="text-[8px] uppercase tracking-[0.22em] font-medium"
                      style={{ color: currentFact.color }}
                    >
                      {currentFact.category}
                    </span>
                  </div>

                  <h3 className="font-fancy italic text-sm font-bold leading-tight text-white tracking-tight">
                    {currentFact.title}
                  </h3>

                  <p className="text-zinc-400 text-[10px] leading-snug line-clamp-3">
                    {currentFact.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-2 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  {(() => {
                    const total = FUN_FACTS.length
                    const visible = Math.min(total, 7)
                    const half = Math.floor(visible / 2)
                    let start = Math.max(0, factIdx - half)
                    const end = Math.min(total, start + visible)
                    if (end - start < visible) start = Math.max(0, end - visible)
                    const dots: React.ReactNode[] = []
                    if (start > 0) {
                      dots.push(
                        <button
                          key="first"
                          onClick={() => setFactIdx(0)}
                          className="h-1 w-1 rounded-full bg-white/20 hover:bg-white/60 transition"
                          aria-label="Ir al primer dato"
                        />
                      )
                      dots.push(
                        <span key="ellipsis1" className="text-[8px] text-zinc-600 leading-none">…</span>
                      )
                    }
                    for (let i = start; i < end; i++) {
                      const isCurrent = i === factIdx
                      dots.push(
                        <button
                          key={`dot-${order[i]}`}
                          onClick={() => setFactIdx(i)}
                          className={cn(
                            "h-1 rounded-full transition-all",
                            isCurrent
                              ? "w-4 bg-white"
                              : "w-1 bg-white/20 hover:bg-white/50"
                          )}
                          aria-label={`Ir al dato ${i + 1}`}
                          aria-current={isCurrent ? "true" : undefined}
                        />
                      )
                    }
                    if (end < total) {
                      dots.push(
                        <span key="ellipsis2" className="text-[8px] text-zinc-600 leading-none">…</span>
                      )
                      dots.push(
                        <button
                          key="last"
                          onClick={() => setFactIdx(total - 1)}
                          className="h-1 w-1 rounded-full bg-white/20 hover:bg-white/60 transition"
                          aria-label="Ir al último dato"
                        />
                      )
                    }
                    return dots
                  })()}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={goPrev}
                    className="p-0.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
                    aria-label="Dato anterior"
                  >
                    <ChevronLeft className="w-2.5 h-2.5 text-zinc-300" />
                  </button>
                  <button
                    onClick={goNext}
                    className="p-0.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
                    aria-label="Dato siguiente"
                  >
                    <ChevronRight className="w-2.5 h-2.5 text-zinc-300" />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cápsulas de Sabiduría */}
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <WisdomCapsule />
          </motion.section>
        </div>

        {/* ====== CTA principal — siempre visible después del contenido ====== */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-auto"
        >
          <button
            onClick={() => setScreen("home")}
            className="group relative overflow-hidden rounded-lg bg-white text-black hover:bg-zinc-100 transition-all px-3 py-2 flex items-center justify-between gap-2 w-full"
          >
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 fill-black" />
              <div className="flex items-baseline gap-2">
                <span className="font-fancy italic font-bold text-sm tracking-tight leading-none">Jugar ahora</span>
                <span className="text-[9px] text-zinc-500 tracking-wide hidden sm:inline">Elegí categoría y dificultad</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.section>
      </main>

      <footer className="relative z-10 text-center text-[8px] text-zinc-600 py-1 border-t border-white/5 shrink-0">
        Trivials Wars · {profile?.user.provider === "google" ? "Cuenta Google" : "Modo Invitado"}
      </footer>
    </div>
  )
}

// ============================================================
// Subcomponentes
// ============================================================

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-0">
      <span className="text-[7px] uppercase tracking-[0.2em] text-zinc-500 font-medium leading-none">{label}</span>
      <span className="font-fancy italic text-xs font-bold text-white tabular-nums leading-none mt-0.5">{value}</span>
    </div>
  )
}

function QuickMode({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition"
    >
      <span className="text-zinc-400 group-hover:text-white transition">{icon}</span>
      <span className="text-[10px] font-medium text-zinc-300 group-hover:text-white transition tracking-wide">{label}</span>
    </button>
  )
}

/**
 * Genera un array de `n` índices [0..n-1] barajados con Fisher-Yates.
 */
function shuffleIds(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
