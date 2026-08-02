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
// WELCOME SCREEN — Editorial dark minimal
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
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0f] text-[#e4e4e7]">
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
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
              <span className="font-fancy italic text-base font-bold text-white">T</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-fancy italic font-bold text-lg text-white tracking-tight">Trivials Wars</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mt-1">El conocimiento es poder</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AudioToggle compact />
            <button
              onClick={() => setScreen("lootbox")}
              className="relative px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-zinc-200"
              title="Abrir Loot Box"
            >
              <span className="text-xs font-medium">Caja</span>
              {profile?.user.boxes ? (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                  {profile.user.boxes}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setScreen("profile")}
              className="relative p-1 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition"
              title="Perfil"
            >
              {profile && frame ? (
                <div className="relative w-8 h-8">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    {frame.render()}
                  </svg>
                  <div className="absolute inset-1.5 rounded-full bg-white/5 flex items-center justify-center">
                    {avatarData && <AvatarSvg {...avatarData} size={28} />}
                  </div>
                </div>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* ====== HERO ====== */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-start pb-10 border-b border-white/5"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center lg:items-start gap-3">
            <div className="relative">
              <div
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center overflow-hidden"
              >
                {avatarData && <AvatarSvg {...avatarData} size={88} />}
              </div>
              {frame && (
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                  {frame.render()}
                </svg>
              )}
            </div>
            <div className="flex flex-col items-center lg:items-start gap-0.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Nivel</span>
              <span className="font-fancy italic text-2xl font-bold text-white tabular-nums leading-none">
                {profile?.user.level ?? 1}
              </span>
            </div>
          </div>

          {/* Saludo + edición + stats */}
          <div className="flex-1 min-w-0 space-y-5">
            <div className="space-y-2">
              <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-medium">
                Bienvenido
              </span>

              {!editingName ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-fancy italic text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                    Hola, <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">{displayName}</span>
                  </h1>
                  <button
                    onClick={startEditName}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                    title="Editar nombre"
                  >
                    <Pencil className="w-4 h-4 text-zinc-400" />
                  </button>
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
                    className="px-4 py-3 rounded-lg bg-white/5 border border-white/15 text-lg font-medium text-white focus:border-white/30 focus:outline-none w-full sm:w-auto sm:min-w-[280px]"
                  />
                  <button
                    onClick={saveName}
                    disabled={updateNameMut.isPending}
                    className="px-4 py-3 rounded-lg bg-white text-black hover:bg-zinc-200 transition flex items-center gap-2 font-semibold text-sm"
                  >
                    <Check className="w-4 h-4" />
                    {updateNameMut.isPending ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium text-zinc-300"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed pt-1">
                Cada partida es una oportunidad para aprender, ganar experiencia y desbloquear nuevos accesorios. Elegí tu modo y empezá a jugar.
              </p>
            </div>

            {/* Stats minimalistas tipográficas */}
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 pt-2">
              <Stat label="Nivel" value={profile?.user.level ?? 1} />
              <Stat label="XP" value={profile?.user.xp ?? 0} />
              <Stat label="Victorias" value={profile?.user.wins ?? 0} />
              <Stat label="Racha" value={profile?.user.currentStreak ?? 0} />
            </div>
          </div>
        </motion.section>

        {/* ====== CTA + modos rápidos ====== */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="py-8 border-b border-white/5"
        >
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 lg:gap-6 items-stretch">
            {/* CTA principal */}
            <button
              onClick={() => setScreen("home")}
              className="group relative overflow-hidden rounded-xl bg-white text-black hover:bg-zinc-100 transition-all px-6 py-6 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <Play className="w-5 h-5 fill-black" />
                <div className="flex flex-col items-start">
                  <span className="font-fancy italic font-bold text-2xl tracking-tight leading-none">Jugar ahora</span>
                  <span className="text-xs text-zinc-500 mt-1.5 tracking-wide">Elegí categoría y dificultad</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Modos rápidos */}
            <div className="grid grid-cols-3 gap-2">
              <QuickMode
                icon={<Swords className="w-4 h-4" />}
                label="Reto"
                onClick={() => {
                  useGameStore.getState().setMode("classic")
                  setScreen("home")
                }}
              />
              <QuickMode
                icon={<Heart className="w-4 h-4" />}
                label="Abismo"
                onClick={() => {
                  useGameStore.getState().setMode("survival")
                  setScreen("home")
                }}
              />
              <QuickMode
                icon={<Skull className="w-4 h-4" />}
                label="Muerte Súbita"
                onClick={() => {
                  useGameStore.getState().setMode("suddendeath")
                  setScreen("home")
                }}
              />
            </div>
          </div>
        </motion.section>

        {/* ====== CARRUSEL "¿Sabías que…?" ====== */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="py-8 border-b border-white/5"
        >
          {/* Header de sección */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-3">
              <h2 className="font-fancy italic text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ¿Sabías que…?
              </h2>
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-500 hidden sm:inline">
                {factIdx + 1} / {FUN_FACTS.length}
              </span>
            </div>
            <button
              onClick={() => setAutoPlay((v) => !v)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-medium border transition tracking-wide",
                autoPlay
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              {autoPlay ? "Auto ON" : "Auto OFF"}
            </button>
          </div>

          {/* Card del dato */}
          <div
            className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-10"
            onPointerEnter={() => setAutoPlay(false)}
            onPointerLeave={() => setAutoPlay(true)}
          >
            {/* Línea de color sutil en el borde izquierdo */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors"
              style={{ background: currentFact.color }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentFact.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-4"
              >
                {/* Categoría */}
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: currentFact.color }}
                  />
                  <span
                    className="text-[11px] uppercase tracking-[0.22em] font-medium"
                    style={{ color: currentFact.color }}
                  >
                    {currentFact.category}
                  </span>
                </div>

                {/* Título grande editorial */}
                <h3 className="font-fancy italic text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] text-white tracking-tight max-w-3xl">
                  {currentFact.title}
                </h3>

                {/* Descripción */}
                <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl">
                  {currentFact.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controles inferiores */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {/* Ventana deslizante de puntos */}
              <div className="flex items-center gap-1.5">
                {(() => {
                  const total = FUN_FACTS.length
                  const visible = Math.min(total, 9)
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
                        className="h-1.5 w-1.5 rounded-full bg-white/20 hover:bg-white/60 transition"
                        aria-label="Ir al primer dato"
                      />
                    )
                    dots.push(
                      <span key="ellipsis1" className="text-[10px] text-zinc-600 leading-none">…</span>
                    )
                  }
                  for (let i = start; i < end; i++) {
                    const isCurrent = i === factIdx
                    dots.push(
                      <button
                        key={`dot-${order[i]}`}
                        onClick={() => setFactIdx(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          isCurrent
                            ? "w-6 bg-white"
                            : "w-1.5 bg-white/20 hover:bg-white/50"
                        )}
                        aria-label={`Ir al dato ${i + 1}`}
                        aria-current={isCurrent ? "true" : undefined}
                      />
                    )
                  }
                  if (end < total) {
                    dots.push(
                      <span key="ellipsis2" className="text-[10px] text-zinc-600 leading-none">…</span>
                    )
                    dots.push(
                      <button
                        key="last"
                        onClick={() => setFactIdx(total - 1)}
                        className="h-1.5 w-1.5 rounded-full bg-white/20 hover:bg-white/60 transition"
                        aria-label="Ir al último dato"
                      />
                    )
                  }
                  return dots
                })()}
              </div>

              {/* Flechas */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  aria-label="Dato anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-300" />
                </button>
                <button
                  onClick={goNext}
                  className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  aria-label="Dato siguiente"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ====== CÁPSULAS DE SABIDURÍA ====== */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="py-8"
        >
          <WisdomCapsule />
        </motion.section>
      </main>

      <footer className="relative z-10 text-center text-[11px] text-zinc-600 py-6 border-t border-white/5">
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
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">{label}</span>
      <span className="font-fancy italic text-2xl font-bold text-white tabular-nums leading-none">{value}</span>
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
      className="group flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition"
    >
      <span className="text-zinc-400 group-hover:text-white transition">{icon}</span>
      <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition tracking-wide">{label}</span>
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
