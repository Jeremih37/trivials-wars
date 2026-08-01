"use client"

import { motion } from "framer-motion"
import { useEffect } from "react"
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
  Clock,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * HomeScreen V4.0 — Panel espacioso + tipografía fancy
 * - Más aire entre secciones (padding y gaps generosos)
 * - Tipografía italic serif (font-fancy) para titulares
 * - Paleta neutra (slate / sage / sand)
 * - Una sola vista compacta pero cómoda
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

  const selectedCount = selectedCategories.length
  const hasSelection = selectedCount > 0
  const isMix = selectedCount > 1

  const isSuddenDeath = selectedMode === "suddendeath"
  const isSurvival = selectedMode === "survival"
  const isClassic = selectedMode === "classic"
  const isEndless = isSurvival || isSuddenDeath

  // FIX: auto-selecciona Mix Total + dificultad Medio en modos endless
  useEffect(() => {
    if ((isSurvival || isSuddenDeath) && !selectedDifficulty) {
      setDifficulty("Medio" as DifficultyId)
    }
    if (selectedCategories.length === 0) {
      useGameStore.getState().setCategories(CATEGORIES.map((c) => c.id as CategoryId))
    }
  }, [isSurvival, isSuddenDeath, selectedDifficulty, setDifficulty, selectedCategories])

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

  const ctaConfig = isSuddenDeath
    ? { label: "Comenzar Muerte Súbita", class: "crystal-bubble-gold text-white" }
    : isSurvival
      ? { label: "Comenzar Abismo", class: "crystal-bubble-coral text-white" }
      : { label: "Comenzar Batalla", class: "crystal-bubble text-white" }

  return (
    <div className="relative min-h-screen flex flex-col">
      <BubblesBackground count={16} />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/50 border-b border-slate-300/40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => { sfx.waterDrop(); setScreen("welcome") }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl glass border border-slate-300/50 hover:border-slate-500/40 transition text-sm font-bold text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="font-fancy text-2xl sm:text-3xl font-medium text-gradient-neon">
            Preparado para jugar
          </h1>
          <div className="flex items-center gap-2">
            <AudioToggle compact />
            <div className="w-[20px]" />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-7">
        {/* ============================================================
            PANEL PRINCIPAL — Una sola vista, espaciosa
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] glass-strong p-7 sm:p-9 space-y-8"
        >
          {/* Fila 1: Modo de Juego */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-fancy text-3xl italic text-slate-400 leading-none">01</span>
              <h3 className="font-fancy text-xl sm:text-2xl text-slate-700 italic">Modo de juego</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {GAME_MODES.map((m) => {
                const isSelected = selectedMode === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => { sfx.waterDrop(); setMode(m.id as GameModeId) }}
                    data-selected={isSelected}
                    className={cn(
                      "relative overflow-hidden rounded-3xl border p-4 text-left transition-all",
                      isSelected
                        ? "scale-[1.02] border-transparent"
                        : "border-slate-300/40 bg-white/60 hover:bg-white/95 hover:border-slate-500/40"
                    )}
                    style={
                      isSelected
                        ? {
                            background: `linear-gradient(135deg, ${m.color}22, ${m.color}08)`,
                            borderColor: m.color,
                            boxShadow: `0 4px 18px ${m.color}25, inset 0 1px 0 rgba(255,255,255,0.55)`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{m.icon}</span>
                      {isSelected && (
                        <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: m.color }}>
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="font-fancy italic text-base font-semibold" style={{ color: isSelected ? m.color : "#4C5C75" }}>
                      {m.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {m.id === "classic" ? "Personalizable" : m.id === "survival" ? "3 vidas" : "1 fallo = fin"}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Separador sutil */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent" />

          {/* Fila 2: Categorías — Pastillas (multi-select) */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="flex items-baseline gap-3">
                <span className="font-fancy text-3xl italic text-slate-400 leading-none">02</span>
                <h3 className="font-fancy text-xl sm:text-2xl text-slate-700 italic">Categorías</h3>
              </div>
              <span className="text-xs text-slate-500 italic font-script">
                {selectedCount === 0
                  ? "Tocá para elegir"
                  : `${selectedCount} ${selectedCount === 1 ? "seleccionada" : "seleccionadas"}${isMix ? " · mix" : ""}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
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
                className="pill-selector rounded-full px-4 py-2 text-sm font-bold flex items-center gap-2"
              >
                <Shuffle className="w-3.5 h-3.5" /> Mix Total
              </button>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id as CategoryId)
                return (
                  <button
                    key={cat.id}
                    onClick={() => { sfx.waterDrop(); toggleCategory(cat.id as CategoryId) }}
                    data-selected={isSelected}
                    className="pill-selector rounded-full px-4 py-2 text-sm font-bold flex items-center gap-2"
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate max-w-[130px]">{cat.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Separador sutil */}
          {isClassic && (
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent" />
          )}

          {/* Fila 3: Dificultad (sólo classic) */}
          {isClassic && (
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="font-fancy text-3xl italic text-slate-400 leading-none">03</span>
                <h3 className="font-fancy text-xl sm:text-2xl text-slate-700 italic">Dificultad</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DIFFICULTIES.map((d) => {
                  const isSelected = selectedDifficulty === d.id
                  return (
                    <button
                      key={d.id}
                      onClick={() => { sfx.waterDrop(); setDifficulty(d.id as DifficultyId) }}
                      data-selected={isSelected}
                      className={cn(
                        "relative overflow-hidden rounded-3xl border p-4 text-left transition-all flex flex-col gap-2",
                        isSelected
                          ? "scale-[1.03] border-transparent"
                          : "border-slate-300/40 bg-white/60 hover:bg-white/95 hover:border-slate-500/40"
                      )}
                      style={
                        isSelected
                          ? {
                              background: `linear-gradient(135deg, ${d.color}22, ${d.color}08)`,
                              borderColor: d.color,
                              boxShadow: `0 4px 18px ${d.color}30, inset 0 1px 0 rgba(255,255,255,0.65)`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="w-9 h-9 rounded-2xl flex items-center justify-center"
                          style={{
                            background: `${d.color}22`,
                            border: `1.5px solid ${d.color}`,
                          }}
                        >
                          <Target className="w-4 h-4" style={{ color: d.color }} />
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: d.color }}>
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="font-fancy italic text-base font-semibold" style={{ color: isSelected ? d.color : "#4C5C75" }}>
                        {d.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{d.time}s</span>
                        <span className="opacity-50">·</span>
                        <span className="font-bold" style={{ color: d.color }}>×{d.multiplier}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Separador sutil */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent" />

          {/* Fila 4: Cantidad / Duración */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-fancy text-3xl italic text-slate-400 leading-none">
                {isClassic ? "04" : "03"}
              </span>
              <h3 className="font-fancy text-xl sm:text-2xl text-slate-700 italic">
                {isEndless ? "Duración" : "Cantidad de preguntas"}
              </h3>
            </div>

            {isSuddenDeath ? (
              <div className="rounded-3xl border-2 border-dashed border-amber-300/50 bg-amber-50/50 p-6 text-center">
                <div className="flex items-center justify-center gap-3 text-amber-700">
                  <Skull className="w-6 h-6" />
                  <span className="font-fancy italic text-xl font-semibold tracking-wide">Infinitas · Hasta fallar</span>
                </div>
                <div className="text-xs text-amber-700/80 mt-2 italic">
                  1 solo error termina la partida · Pool de {SUDDEN_DEATH_CONFIG.initialPoolSize} preguntas
                </div>
              </div>
            ) : isSurvival ? (
              <div className="rounded-3xl border-2 border-dashed border-rose-300/50 bg-rose-50/50 p-6 text-center">
                <div className="flex items-center justify-center gap-3 text-rose-700">
                  <Heart className="w-6 h-6 fill-rose-400" />
                  <span className="font-fancy italic text-xl font-semibold tracking-wide">Infinitas · Hasta perder 3 vidas</span>
                </div>
                <div className="text-xs text-rose-700/80 mt-2 italic">
                  Pool de 30 preguntas · tiempo decreciente
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {QUESTION_COUNTS.map((qc) => {
                  const isSelected = selectedQuestionCount === qc.id
                  return (
                    <button
                      key={qc.id}
                      onClick={() => { sfx.waterDrop(); setQuestionCount(qc.id) }}
                      data-selected={isSelected}
                      className="circular-count rounded-3xl aspect-square flex flex-col items-center justify-center"
                    >
                      <div className="font-fancy italic text-3xl font-bold leading-none">{qc.label}</div>
                      <div className="text-[10px] uppercase tracking-wide opacity-70 mt-1">{qc.desc}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.section>

        {/* INFO del modo seleccionado */}
        {isSuddenDeath && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.5rem] border border-amber-300/40 bg-amber-50/40 p-6 glass"
          >
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-5 h-5 text-amber-700" />
              <span className="font-fancy italic text-lg text-amber-800 font-semibold">Reglas de Muerte Súbita</span>
            </div>
            <ul className="text-sm text-amber-800/90 space-y-2 ml-6 list-disc italic font-script">
              <li>Sin margen de error: <span className="font-bold not-italic">fallar 1 pregunta termina la partida</span></li>
              <li>Racha infinitamente escalable — tu High Score se guarda por separado</li>
              <li>Combo: <span className="font-bold not-italic">5 seguidas ×2</span>, <span className="font-bold not-italic">10 seguidas ×3</span>, <span className="font-bold not-italic">15 seguidas ×4</span></li>
              <li>Tiempo fijo de <span className="font-bold not-italic">15 segundos</span> por pregunta</li>
              <li>Tensión dorada: al superar <span className="font-bold not-italic">10 aciertos</span> el fondo se tiñe dorado/alerta</li>
            </ul>

            {profile?.user && profile.user.suddenDeathRuns > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-300/30 flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="flex-1 text-sm">
                  <div className="text-amber-700/70 uppercase tracking-wider text-[10px] italic">Tu récord de Muerte Súbita</div>
                  <div className="flex items-center gap-3 mt-1">
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
            className="rounded-[1.5rem] border border-rose-300/40 bg-rose-50/40 p-6 glass"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-400" />
              <span className="font-fancy italic text-lg text-rose-800 font-semibold">Reglas de Supervivencia</span>
            </div>
            <ul className="text-sm text-rose-800/90 space-y-2 ml-6 list-disc italic font-script">
              <li>Comenzás con <span className="font-bold not-italic text-rose-700">3 corazones</span> — cada error resta 1 vida</li>
              <li>Tiempo inicial: <span className="font-bold not-italic">15 segundos</span> por pregunta</li>
              <li>Cada <span className="font-bold not-italic">5 aciertos</span> el tiempo baja 1s (mínimo 5s)</li>
              <li>Combo: <span className="font-bold not-italic">3 seguidas ×2</span>, <span className="font-bold not-italic">5 seguidas ×3</span></li>
            </ul>

            {profile?.user && profile.user.survivalRuns > 0 && (
              <div className="mt-4 pt-4 border-t border-rose-300/30 flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="flex-1 text-sm">
                  <div className="text-rose-700/70 uppercase tracking-wider text-[10px] italic">Tu récord de Supervivencia</div>
                  <div className="flex items-center gap-3 mt-1">
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
        <section className="space-y-5 pb-8">
          <div className="flex items-baseline gap-3">
            <span className="font-fancy text-3xl italic text-amber-400 leading-none">★</span>
            <h3 className="font-fancy text-xl sm:text-2xl text-slate-700 italic">Resumen</h3>
          </div>
          <div className={cn("grid gap-3", isClassic ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
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
              color={selectedCount > 0 ? "#8AA088" : undefined}
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
                  color="#D9A85E"
                />
              </>
            )}
            {isEndless && (
              <SummaryCard
                icon={<Skull className="w-4 h-4" />}
                label="Duración"
                value="∞ hasta fallar"
                color={isSuddenDeath ? "#D9A85E" : "#C98492"}
              />
            )}
          </div>

          {/* Crystal Bubble CTA */}
          <button
            onClick={handleStart}
            disabled={!hasSelection || (isClassic && !selectedDifficulty) || startGameMut.isPending}
            className={cn(
              "w-full py-5 rounded-[2rem] font-fancy italic font-bold text-lg sm:text-xl tracking-wide transition-all flex items-center justify-center gap-3 mt-4 relative overflow-hidden",
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
        "rounded-2xl border bg-white/70 p-4 transition glass",
        color ? "border-slate-300/40" : "border-dashed border-slate-300/40"
      )}
      style={color ? { borderColor: `${color}50`, boxShadow: `0 0 12px ${color}15` } : undefined}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 italic">
        <span style={color ? { color } : undefined}>{icon}</span>
        {label}
      </div>
      <div className="font-fancy italic text-base font-semibold mt-1 truncate text-slate-700" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  )
}
