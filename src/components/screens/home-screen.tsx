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
  Sparkles,
  Skull,
  Shuffle,
  Crown,
  Check,
  Heart,
  Flame,
  Clock,
  Target,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * HomeScreen V5.0 — Burbujas tipo "pop" + CTA chico fijo abajo
 * - Cada selector es una burbuja independiente (no lista)
 * - CTA pequeño flotante abajo (no gigante)
 * - Más aire entre elementos
 * - Fondo cálido arena (no blanco)
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

  const ctaLabel = isSuddenDeath
    ? "Comenzar Muerte Súbita"
    : isSurvival
      ? "Comenzar Abismo"
      : "Comenzar Batalla"

  const canStart = hasSelection && (!isClassic || !!selectedDifficulty) && !startGameMut.isPending

  return (
    <div className="relative min-h-screen flex flex-col">
      <BubblesBackground count={14} />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#EFE7D4]/70 border-b border-[#3D4A60]/15">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => { sfx.waterDrop(); setScreen("welcome") }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl glass border border-[#3D4A60]/20 hover:border-[#5C6E8A]/50 transition text-sm font-semibold text-[#3D4A60]"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="font-fancy text-xl sm:text-2xl italic font-bold text-gradient-neon">
            Preparado para jugar
          </h1>
          <div className="flex items-center gap-2">
            <AudioToggle compact />
            <div className="w-[20px]" />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-5 py-7 space-y-10 pb-32">
        {/* ============================================================
            SECCIÓN 1 — Modo de Juego (3 burbujas grandes)
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="flex items-baseline gap-3 px-1">
            <span className="font-fancy text-2xl italic text-[#8E9DB4] leading-none">01</span>
            <h3 className="font-fancy text-lg sm:text-xl italic font-semibold text-[#3D4A60]">Modo de juego</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {GAME_MODES.map((m) => {
              const isSelected = selectedMode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => { sfx.waterDrop(); setMode(m.id as GameModeId) }}
                  className={cn(
                    "relative overflow-hidden rounded-3xl p-5 text-center transition-all",
                    isSelected ? "bubble-pop-selected scale-[1.02]" : "bubble-pop hover:scale-[1.01]",
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{m.icon}</span>
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-[#F2ECDD]/30 backdrop-blur">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <div
                      className="font-fancy italic text-sm font-semibold"
                      style={{ color: isSelected ? "#F2ECDD" : m.color }}
                    >
                      {m.name}
                    </div>
                    <div className="text-[10px] leading-tight italic" style={{ color: isSelected ? "rgba(242,236,221,0.85)" : "#7A8492" }}>
                      {m.id === "classic" ? "Personalizable" : m.id === "survival" ? "3 vidas" : "1 fallo = fin"}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.section>

        {/* ============================================================
            SECCIÓN 2 — Categorías (burbujas tipo pills grandes)
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-5"
        >
          <div className="flex items-baseline justify-between gap-3 px-1 flex-wrap">
            <div className="flex items-baseline gap-3">
              <span className="font-fancy text-2xl italic text-[#8E9DB4] leading-none">02</span>
              <h3 className="font-fancy text-lg sm:text-xl italic font-semibold text-[#3D4A60]">Categorías</h3>
            </div>
            <span className="text-xs text-[#7A8492] italic font-script">
              {selectedCount === 0
                ? "Tocá para elegir"
                : `${selectedCount} ${selectedCount === 1 ? "seleccionada" : "seleccionadas"}${isMix ? " · mix" : ""}`}
            </span>
          </div>

          {/* Botón Mix Total destacado */}
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
            className={cn(
              "w-full rounded-3xl px-5 py-3.5 flex items-center justify-center gap-2.5 text-sm font-bold transition-all",
              selectedCount === CATEGORIES.length
                ? "bubble-pop-selected scale-[1.01]"
                : "bubble-pop hover:scale-[1.01]",
            )}
          >
            <Shuffle className="w-4 h-4" />
            <span className="font-fancy italic">Mix Total — todas las categorías</span>
            {selectedCount === CATEGORIES.length && <Check className="w-4 h-4" />}
          </button>

          {/* Pills de categorías */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id as CategoryId)
              return (
                <button
                  key={cat.id}
                  onClick={() => { sfx.waterDrop(); toggleCategory(cat.id as CategoryId) }}
                  data-selected={isSelected}
                  className="pill-selector rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
                >
                  <span>{cat.icon}</span>
                  <span className="truncate max-w-[120px]">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              )
            })}
          </div>
        </motion.section>

        {/* ============================================================
            SECCIÓN 3 — Dificultad (sólo classic) — 4 burbujas
            ============================================================ */}
        {isClassic && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            className="space-y-5"
          >
            <div className="flex items-baseline gap-3 px-1">
              <span className="font-fancy text-2xl italic text-[#8E9DB4] leading-none">03</span>
              <h3 className="font-fancy text-lg sm:text-xl italic font-semibold text-[#3D4A60]">Dificultad</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIFFICULTIES.map((d) => {
                const isSelected = selectedDifficulty === d.id
                return (
                  <button
                    key={d.id}
                    onClick={() => { sfx.waterDrop(); setDifficulty(d.id as DifficultyId) }}
                    className={cn(
                      "relative overflow-hidden rounded-3xl p-4 text-left transition-all flex flex-col gap-2",
                      isSelected ? "bubble-pop-selected scale-[1.03]" : "bubble-pop hover:scale-[1.02]",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center"
                        style={{
                          background: isSelected ? "rgba(255,248,230,0.20)" : `${d.color}22`,
                          border: `1.5px solid ${isSelected ? "rgba(248,240,222,0.5)" : d.color}`,
                        }}
                      >
                        <Target className="w-4 h-4" style={{ color: isSelected ? "#F2ECDD" : d.color }} />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#F2ECDD]/30 backdrop-blur">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                    <div
                      className="font-fancy italic text-base font-semibold"
                      style={{ color: isSelected ? "#F2ECDD" : d.color }}
                    >
                      {d.name}
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-[11px] italic"
                      style={{ color: isSelected ? "rgba(242,236,221,0.85)" : "#7A8492" }}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{d.time}s</span>
                      <span className="opacity-50">·</span>
                      <span className="font-bold">×{d.multiplier}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* ============================================================
            SECCIÓN 4 — Cantidad / Duración
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-5"
        >
          <div className="flex items-baseline gap-3 px-1">
            <span className="font-fancy text-2xl italic text-[#8E9DB4] leading-none">
              {isClassic ? "04" : "03"}
            </span>
            <h3 className="font-fancy text-lg sm:text-xl italic font-semibold text-[#3D4A60]">
              {isEndless ? "Duración" : "Cantidad de preguntas"}
            </h3>
          </div>

          {isSuddenDeath ? (
            <div className="rounded-3xl border-2 border-dashed border-[#C99A50]/50 bg-[#F0E0C0]/40 p-6 text-center bubble-pop">
              <div className="flex items-center justify-center gap-3 text-[#6B4D1C]">
                <Skull className="w-6 h-6" />
                <span className="font-fancy italic text-lg font-semibold tracking-wide">Infinitas · Hasta fallar</span>
              </div>
              <div className="text-xs text-[#6B4D1C]/80 mt-2 italic">
                1 solo error termina la partida · Pool de {SUDDEN_DEATH_CONFIG.initialPoolSize} preguntas
              </div>
            </div>
          ) : isSurvival ? (
            <div className="rounded-3xl border-2 border-dashed border-[#B57482]/50 bg-[#F0D4D8]/40 p-6 text-center bubble-pop">
              <div className="flex items-center justify-center gap-3 text-[#6F3A45]">
                <Heart className="w-6 h-6 fill-[#C98896]" />
                <span className="font-fancy italic text-lg font-semibold tracking-wide">Infinitas · Hasta perder 3 vidas</span>
              </div>
              <div className="text-xs text-[#6F3A45]/80 mt-2 italic">
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
                    className={cn(
                      "rounded-3xl aspect-square flex flex-col items-center justify-center transition-all",
                      isSelected ? "bubble-pop-selected scale-[1.03]" : "bubble-pop hover:scale-[1.04]",
                    )}
                  >
                    <div className="font-fancy italic text-3xl font-bold leading-none">{qc.label}</div>
                    <div className="text-[10px] uppercase tracking-wide mt-1 italic opacity-80">{qc.desc}</div>
                  </button>
                )
              })}
            </div>
          )}
        </motion.section>

        {/* INFO del modo seleccionado */}
        {isSuddenDeath && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#C99A50]/30 bg-[#F0E0C0]/30 p-5 bubble-pop"
          >
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-5 h-5 text-[#8A6428]" />
              <span className="font-fancy italic text-base text-[#6B4D1C] font-semibold">Reglas de Muerte Súbita</span>
            </div>
            <ul className="text-sm text-[#6B4D1C]/90 space-y-1.5 ml-5 list-disc italic font-script">
              <li>Sin margen de error: <span className="font-bold not-italic">1 fallo = fin</span></li>
              <li>Combo: <span className="font-bold not-italic">5 ×2</span>, <span className="font-bold not-italic">10 ×3</span>, <span className="font-bold not-italic">15 ×4</span></li>
              <li>Tiempo fijo de <span className="font-bold not-italic">15s</span> por pregunta</li>
              <li>Tensión dorada tras <span className="font-bold not-italic">10 aciertos</span></li>
            </ul>

            {profile?.user && profile.user.suddenDeathRuns > 0 && (
              <div className="mt-4 pt-4 border-t border-[#C99A50]/25 flex items-center gap-3">
                <Crown className="w-5 h-5 text-[#8A6428] shrink-0" />
                <div className="flex-1 text-sm">
                  <div className="text-[#8A6428]/80 uppercase tracking-wider text-[10px] italic">Tu récord</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-bold text-[#6B4D1C]">{profile.user.suddenDeathBestCorrect} aciertos</span>
                    <span className="text-[#8A6428]/60">·</span>
                    <span className="font-bold text-[#6B4D1C]">+{profile.user.suddenDeathBestXp} XP</span>
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
            className="rounded-3xl border border-[#B57482]/30 bg-[#F0D4D8]/30 p-5 bubble-pop"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-[#8B4A56] fill-[#C98896]" />
              <span className="font-fancy italic text-base text-[#6F3A45] font-semibold">Reglas de Supervivencia</span>
            </div>
            <ul className="text-sm text-[#6F3A45]/90 space-y-1.5 ml-5 list-disc italic font-script">
              <li>Comenzás con <span className="font-bold not-italic text-[#8B4A56]">3 corazones</span> — cada error resta 1</li>
              <li>Tiempo inicial: <span className="font-bold not-italic">15s</span> · baja 1s cada <span className="font-bold not-italic">5 aciertos</span></li>
              <li>Combo: <span className="font-bold not-italic">3 ×2</span>, <span className="font-bold not-italic">5 ×3</span></li>
            </ul>

            {profile?.user && profile.user.survivalRuns > 0 && (
              <div className="mt-4 pt-4 border-t border-[#B57482]/25 flex items-center gap-3">
                <Crown className="w-5 h-5 text-[#8A6428] shrink-0" />
                <div className="flex-1 text-sm">
                  <div className="text-[#8B4A56]/80 uppercase tracking-wider text-[10px] italic">Tu récord</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-bold text-[#6F3A45]">{profile.user.survivalBestCorrect} aciertos</span>
                    <span className="text-[#8B4A56]/60">·</span>
                    <span className="font-bold text-[#6F3A45]">+{profile.user.survivalBestXp} XP</span>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Mini resumen — burbujas pequeñas */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3 px-1">
            <span className="font-fancy text-2xl italic text-amber-500 leading-none">★</span>
            <h3 className="font-fancy text-lg sm:text-xl italic font-semibold text-[#3D4A60]">Resumen</h3>
          </div>
          <div className={cn("grid gap-2", isClassic ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
            <SummaryChip
              icon={<Sparkles className="w-3.5 h-3.5" />}
              label="Modo"
              value={GAME_MODES.find((m) => m.id === selectedMode)?.name ?? "—"}
              color={GAME_MODES.find((m) => m.id === selectedMode)?.color}
            />
            <SummaryChip
              icon={<Flame className="w-3.5 h-3.5" />}
              label={isMix ? "Categorías" : "Categoría"}
              value={selectedCount === 0 ? "—" : isMix ? `${selectedCount} mixtas` : (CATEGORIES.find((c) => c.id === selectedCategories[0])?.name ?? "—")}
              color={selectedCount > 0 ? "#718C6F" : undefined}
            />
            {isClassic && (
              <>
                <SummaryChip
                  icon={<Target className="w-3.5 h-3.5" />}
                  label="Dificultad"
                  value={selectedDifficulty ? DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.name ?? "—" : "—"}
                  color={selectedDifficulty ? DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.color : undefined}
                />
                <SummaryChip
                  icon={<Target className="w-3.5 h-3.5" />}
                  label="Preguntas"
                  value={selectedQuestionCount.toString()}
                  color="#C99A50"
                />
              </>
            )}
            {isEndless && (
              <SummaryChip
                icon={<Skull className="w-3.5 h-3.5" />}
                label="Duración"
                value="∞ hasta fallar"
                color={isSuddenDeath ? "#C99A50" : "#B57482"}
              />
            )}
          </div>
        </section>
      </main>

      {/* ============================================================
          CTA — Sticky bottom, pequeño, redondeado tipo píldora
          NO gigante. Flota sobre el contenido al hacer scroll.
          ============================================================ */}
      <div className="sticky-cta-bottom">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={cn(
            "flex items-center gap-2",
            !canStart
              ? "bg-[#D9CFB8] text-[#7A8492] cursor-not-allowed"
              : isSuddenDeath
                ? "crystal-bubble-gold"
                : isSurvival
                  ? "crystal-bubble-coral"
                  : "crystal-bubble",
          )}
        >
          {startGameMut.isPending ? (
            <>Iniciando…</>
          ) : !hasSelection ? (
            "Elegí una categoría"
          ) : (isClassic && !selectedDifficulty) ? (
            "Elegí una dificultad"
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{ctaLabel}</span>
              <Swords className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function SummaryChip({
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
    <div className="rounded-2xl px-3 py-2.5 bubble-pop">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#7A8492] italic">
        <span style={color ? { color } : undefined}>{icon}</span>
        {label}
      </div>
      <div
        className="font-fancy italic text-sm font-semibold mt-0.5 truncate"
        style={{ color: color ?? "#2A3340" }}
      >
        {value}
      </div>
    </div>
  )
}
