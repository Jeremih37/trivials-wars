"use client"

import { motion } from "framer-motion"
import {
  CATEGORIES,
  DIFFICULTIES,
  GAME_MODES,
  QUESTION_COUNTS,
  SUDDEN_DEATH_CONFIG,
  type CategoryId,
  type DifficultyId,
  type GameModeId,
} from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useStartGame, useProfile } from "@/hooks/use-game"
import { useAudio } from "@/hooks/use-audio"
import { AudioToggle } from "@/components/audio-toggle"
import { BubblesBackground } from "@/components/bubbles-background"
import {
  ChevronLeft,
  Swords,
  Zap,
  Sparkles,
  Skull,
  Shuffle,
  Crown,
  Check,
  Heart,
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * HomeScreen V3.0 — Panel de Configuración Compacto (UI Acoplable)
 * GDD V3.0: matriz de selector en una sola vista compacta
 *   - Fila 1: Categorías en pastillas "Pills"
 *   - Fila 2: Segmented Control (Fácil | Normal | Difícil | Muerte Súbita)
 *   - Fila 3: Botones circulares compactos (5, 10, 20, 50)
 *             En Muerte Súbita: bloqueado en "Infinitas / Hasta fallar"
 */
export function HomeScreen() {
  const {
    setScreen,
    toggleCategory,
    setDifficulty,
    setMode,
    setQuestionCount,
    selectedCategories,
    selectedDifficulty,
    selectedMode,
    selectedQuestionCount,
    startGame,
  } = useGameStore()
  const startGameMut = useStartGame()
  const { sfx } = useAudio()
  const { data: profile } = useProfile()

  // Estado multi-select de categorías
  const selectedCount = selectedCategories.length
  const hasSelection = selectedCount > 0
  const isMix = selectedCount > 1

  // ¿Está en modo Muerte Súbita? Bloquea el selector de cantidad
  const isSuddenDeath = selectedMode === "suddendeath"
  const isSurvival = selectedMode === "survival"
  const isClassic = selectedMode === "classic"
  const isEndless = isSurvival || isSuddenDeath

  const handleStart = () => {
    if (!hasSelection || !selectedDifficulty) return
    sfx.waterDrop()
    const payload =
      selectedCount === 1
        ? {
            category: selectedCategories[0],
            difficulty: selectedDifficulty,
            mode: selectedMode,
            questionCount: isClassic ? selectedQuestionCount : undefined,
          }
        : {
            category: "mix" as CategoryId,
            categories: selectedCategories,
            difficulty: selectedDifficulty,
            mode: selectedMode,
            questionCount: isClassic ? selectedQuestionCount : undefined,
          }
    startGameMut.mutate(payload, {
      onSuccess: (data) => {
        startGame(data)
      },
    })
  }

  // Configuración del CTA según modo
  const ctaConfig = isSuddenDeath
    ? { label: "¡COMENZAR MUERTE SÚBITA!", class: "crystal-bubble-gold text-white" }
    : isSurvival
      ? { label: "¡COMENZAR ABISMO!", class: "crystal-bubble-coral text-white" }
      : { label: "¡COMENZAR BATALLA!", class: "crystal-bubble text-white" }

  return (
    <div className="relative min-h-screen flex flex-col">
      <BubblesBackground count={14} />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-cyan-200/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { sfx.waterDrop(); setScreen("welcome") }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-cyan-200/60 hover:border-sky-400/70 transition text-sm font-bold text-sky-900"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-600 bg-clip-text text-transparent">
            PREPARADO PARA JUGAR
          </h1>
          <div className="flex items-center gap-2">
            <AudioToggle compact />
            <div className="w-[20px]" />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 py-5 space-y-5">
        {/* ============================================================
            PANEL COMPACTO — Una sola vista (GDD V3.0)
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl glass-strong p-5 sm:p-6 space-y-5"
        >
          {/* Fila 0: Modo (selector de modo de juego) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
              <h3 className="font-black text-sm sm:text-base text-sky-900">Modo de Juego</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GAME_MODES.map((m) => {
                const isSelected = selectedMode === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => { sfx.waterDrop(); setMode(m.id as GameModeId) }}
                    data-selected={isSelected}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border p-3 text-left transition-all",
                      isSelected
                        ? "scale-[1.02] border-transparent"
                        : "border-cyan-200/60 bg-white/60 hover:bg-white/90 hover:border-sky-400/50"
                    )}
                    style={
                      isSelected
                        ? {
                            background: `linear-gradient(135deg, ${m.color}22, ${m.color}08)`,
                            borderColor: m.color,
                            boxShadow: `0 0 18px ${m.color}40, inset 0 1px 0 rgba(255,255,255,0.6)`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xl">{m.icon}</span>
                      {isSelected && (
                        <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center" style={{ background: m.color }}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-black uppercase tracking-wide" style={{ color: isSelected ? m.color : "#0369a1" }}>
                      {m.name}
                    </div>
                    <div className="text-[9px] text-sky-700/70 mt-0.5 leading-tight">
                      {m.id === "classic" ? "Personalizable" : m.id === "survival" ? "3 vidas" : "1 fallo = fin"}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fila 1: Categorías — Pastillas "Pills" (multi-select) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                <h3 className="font-black text-sm sm:text-base text-sky-900">Categorías</h3>
              </div>
              <span className="text-[10px] text-sky-700/70">
                {selectedCount === 0 ? "Tocá para elegir" : `${selectedCount} ${selectedCount === 1 ? "seleccionada" : "seleccionadas"}${isMix ? " · mix" : ""}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {/* Mix Total */}
              <button
                onClick={() => {
                  sfx.waterDrop()
                  if (selectedCount === CATEGORIES.length) {
                    useGameStore.getState().setCategories([])
                  } else {
                    useGameStore.getState().setCategories(CATEGORIES.map((c) => c.id as CategoryId))
                  }
                }}
                data-selected={selectedCount === CATEGORIES.length}
                className="pill-selector rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
              >
                <Shuffle className="w-3 h-3" /> Mix Total
              </button>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id as CategoryId)
                return (
                  <button
                    key={cat.id}
                    onClick={() => { sfx.waterDrop(); toggleCategory(cat.id as CategoryId) }}
                    data-selected={isSelected}
                    className="pill-selector rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate max-w-[110px]">{cat.name}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fila 2: Dificultad — Segmented Control (Fácil | Normal | Difícil | Muerte Súbita)
              NOTA: En el GDD V3.0 el segmented control incluye Muerte Súbita.
              Aquí lo usamos como selector de dificultad para classic; el modo Muerte Súbita
              se selecciona arriba (Fila 0) por compatibilidad con la lógica existente. */}
          {isClassic && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-white text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                <h3 className="font-black text-sm sm:text-base text-sky-900">Dificultad</h3>
              </div>
              <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white/50 border border-cyan-200/50 p-1">
                {DIFFICULTIES.map((d) => {
                  const isSelected = selectedDifficulty === d.id
                  return (
                    <button
                      key={d.id}
                      onClick={() => { sfx.waterDrop(); setDifficulty(d.id as DifficultyId) }}
                      data-selected={isSelected}
                      className="segmented-option rounded-xl py-2 px-1 text-center"
                    >
                      <div className="text-[11px] font-black uppercase tracking-wide">{d.name}</div>
                      <div className="text-[9px] opacity-70">{d.time}s · ×{d.multiplier}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Fila 3: Cantidad de preguntas — Botones circulares compactos (5, 10, 20, 50)
              Si es Muerte Súbita: bloqueado en "Infinitas / Hasta fallar" */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                {isClassic ? "4" : "3"}
              </span>
              <h3 className="font-black text-sm sm:text-base text-sky-900">
                {isEndless ? "Duración" : "Cantidad de Preguntas"}
              </h3>
            </div>

            {isSuddenDeath ? (
              // Bloqueado en infinitas
              <div className="rounded-2xl border-2 border-dashed border-amber-300/60 bg-amber-50/60 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <Skull className="w-5 h-5" />
                  <span className="font-black text-base uppercase tracking-wider">Infinitas · Hasta fallar</span>
                </div>
                <div className="text-[10px] text-amber-700/70 mt-1">
                  1 solo error termina la partida · Pool de {SUDDEN_DEATH_CONFIG.initialPoolSize} preguntas
                </div>
              </div>
            ) : isSurvival ? (
              // Bloqueado en infinitas
              <div className="rounded-2xl border-2 border-dashed border-rose-300/60 bg-rose-50/60 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-rose-700">
                  <Heart className="w-5 h-5 fill-rose-500" />
                  <span className="font-black text-base uppercase tracking-wider">Infinitas · Hasta perder 3 vidas</span>
                </div>
                <div className="text-[10px] text-rose-700/70 mt-1">
                  Pool de 30 preguntas · tiempo decreciente
                </div>
              </div>
            ) : (
              // Selector circular de cantidades
              <div className="grid grid-cols-4 gap-2">
                {QUESTION_COUNTS.map((qc) => {
                  const isSelected = selectedQuestionCount === qc.id
                  return (
                    <button
                      key={qc.id}
                      onClick={() => { sfx.waterDrop(); setQuestionCount(qc.id) }}
                      data-selected={isSelected}
                      className="circular-count rounded-2xl aspect-square flex flex-col items-center justify-center"
                    >
                      <div className="text-2xl font-black leading-none">{qc.label}</div>
                      <div className="text-[9px] uppercase tracking-wide opacity-70 mt-0.5">{qc.desc}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.section>

        {/* INFO del modo seleccionado — tarjetas informativas compactas */}
        {isSuddenDeath && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-300/50 bg-amber-50/60 p-4 glass"
          >
            <div className="flex items-center gap-2 mb-2">
              <Skull className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-sm text-amber-800">Reglas de Muerte Súbita</span>
            </div>
            <ul className="text-xs text-amber-800/90 space-y-1.5 ml-6 list-disc">
              <li>Sin margen de error: <span className="font-bold">fallar 1 pregunta termina la partida</span></li>
              <li>Racha infinitamente escalable — tu High Score se guarda por separado</li>
              <li>Combo: <span className="font-bold">5 seguidas ×2</span>, <span className="font-bold">10 seguidas ×3</span>, <span className="font-bold">15 seguidas ×4</span></li>
              <li>Tiempo fijo de <span className="font-bold">15 segundos</span> por pregunta</li>
              <li>Tensión dorada: al superar <span className="font-bold">10 aciertos</span> el fondo se tiñe dorado/alerta</li>
            </ul>

            {profile?.user && profile.user.suddenDeathRuns > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-300/30 flex items-center gap-3">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="text-amber-700/70 uppercase tracking-wider text-[10px]">Tu récord de Muerte Súbita</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-bold text-amber-700">{profile.user.suddenDeathBestCorrect} aciertos</span>
                    <span className="text-amber-700/60">·</span>
                    <span className="font-bold text-amber-700">+{profile.user.suddenDeathBestXp} XP</span>
                    <span className="text-amber-700/60">·</span>
                    <span className="text-amber-700/70">{profile.user.suddenDeathRuns} runs</span>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {isSurvival && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-300/50 bg-rose-50/60 p-4 glass"
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-500" />
              <span className="font-bold text-sm text-rose-800">Reglas de Supervivencia</span>
            </div>
            <ul className="text-xs text-rose-800/90 space-y-1.5 ml-6 list-disc">
              <li>Comenzás con <span className="font-bold text-rose-700">3 corazones ❤️❤️❤️</span> — cada error resta 1 vida</li>
              <li>Tiempo inicial: <span className="font-bold">15 segundos</span> por pregunta</li>
              <li>Cada <span className="font-bold">5 aciertos</span> el tiempo baja 1s (mínimo 5s)</li>
              <li>Combo: <span className="font-bold">3 seguidas ×2</span>, <span className="font-bold">5 seguidas ×3</span></li>
            </ul>

            {profile?.user && profile.user.survivalRuns > 0 && (
              <div className="mt-3 pt-3 border-t border-rose-300/30 flex items-center gap-3">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="text-rose-700/70 uppercase tracking-wider text-[10px]">Tu récord de Supervivencia</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-bold text-rose-700">{profile.user.survivalBestCorrect} aciertos</span>
                    <span className="text-rose-700/60">·</span>
                    <span className="font-bold text-rose-700">+{profile.user.survivalBestXp} XP</span>
                    <span className="text-rose-700/60">·</span>
                    <span className="text-rose-700/70">{profile.user.survivalRuns} runs</span>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* RESUMEN + CTA */}
        <section className="space-y-3 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-rose-400 text-white text-[10px] font-black flex items-center justify-center shrink-0">★</span>
            <h3 className="font-black text-sm sm:text-base text-sky-900">Resumen</h3>
          </div>
          <div className={cn("grid gap-2", isClassic ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
            <SummaryCard
              icon={<Sparkles className="w-4 h-4" />}
              label="Modo"
              value={GAME_MODES.find((m) => m.id === selectedMode)?.name ?? "—"}
              color={GAME_MODES.find((m) => m.id === selectedMode)?.color}
            />
            <SummaryCard
              icon={<Flame className="w-4 h-4" />}
              label={isMix ? "Categorías" : "Categoría"}
              value={selectedCount === 0 ? "—" : isMix ? `${selectedCount} mixtas` : (CATEGORIES.find((c) => c.id === selectedCategories[0])?.name ?? "—")}
              color={selectedCount > 0 ? "#4ADE80" : undefined}
            />
            {isClassic && (
              <>
                <SummaryCard
                  icon={<Zap className="w-4 h-4" />}
                  label="Dificultad"
                  value={selectedDifficulty ? DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.name ?? "—" : "—"}
                  color={selectedDifficulty ? DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.color : undefined}
                />
                <SummaryCard
                  icon={<Zap className="w-4 h-4" />}
                  label="Preguntas"
                  value={selectedQuestionCount.toString()}
                  color="#fbbf24"
                />
              </>
            )}
            {isEndless && (
              <SummaryCard
                icon={<Skull className="w-4 h-4" />}
                label="Duración"
                value="∞ hasta fallar"
                color={isSuddenDeath ? "#fbbf24" : "#fb7185"}
              />
            )}
          </div>

          {/* Crystal Bubble CTA */}
          <button
            onClick={handleStart}
            disabled={!hasSelection || (isClassic && !selectedDifficulty) || startGameMut.isPending}
            className={cn(
              "w-full py-4 rounded-3xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-3 relative overflow-hidden",
              !hasSelection || (isClassic && !selectedDifficulty) || startGameMut.isPending
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : cn(ctaConfig.class, "animate-cta-pulse")
            )}
          >
            {startGameMut.isPending ? (
              <>Iniciando…</>
            ) : !hasSelection ? (
              "Seleccioná al menos una categoría"
            ) : (isClassic && !selectedDifficulty) ? (
              "Seleccioná una dificultad"
            ) : (
              <>
                <Swords className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{ctaConfig.label}</span>
              </>
            )}
          </button>
        </section>
      </main>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/70 p-3 transition glass",
        color ? "border-cyan-200/60" : "border-dashed border-cyan-200/40"
      )}
      style={color ? { borderColor: `${color}50`, boxShadow: `0 0 12px ${color}15` } : undefined}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-sky-700/70">
        <span style={color ? { color } : undefined}>{icon}</span>
        {label}
      </div>
      <div className="text-sm font-bold mt-1 truncate text-sky-900" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  )
}
