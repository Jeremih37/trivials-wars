"use client"

import { motion } from "framer-motion"
import {
  CATEGORIES,
  DIFFICULTIES,
  GAME_MODES,
  QUESTION_COUNTS,
  type CategoryId,
  type DifficultyId,
  type GameModeId,
} from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useStartGame, useProfile } from "@/hooks/use-game"
import { useAudio } from "@/hooks/use-audio"
import { AudioToggle } from "@/components/audio-toggle"
import { BubblesBackground } from "@/components/bubbles-background"
import { ChevronLeft, Swords, Zap, Sparkles, Target, Skull, Shuffle, Crown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const handleStart = () => {
    if (!hasSelection || !selectedDifficulty) return
    sfx.waterDrop()
    // Si hay 1 categoría → enviar como category simple. Si hay varias → enviar categories[].
    const payload =
      selectedCount === 1
        ? { category: selectedCategories[0], difficulty: selectedDifficulty, mode: selectedMode, questionCount: selectedMode === "classic" ? selectedQuestionCount : undefined }
        : { category: "mix" as CategoryId, categories: selectedCategories, difficulty: selectedDifficulty, mode: selectedMode, questionCount: selectedMode === "classic" ? selectedQuestionCount : undefined }
    startGameMut.mutate(payload, {
      onSuccess: (data) => {
        startGame(data)
      },
    })
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <BubblesBackground count={14} />

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { sfx.waterDrop(); setScreen("welcome") }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-border hover:border-primary/60 transition text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="text-base font-black tracking-tight text-gradient-neon">PREPARADO PARA JUGAR</h1>
          <div className="flex items-center gap-2">
            <AudioToggle compact />
            <div className="w-[20px]" />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-7">
        {/* PASO 1: MODO DE JUEGO */}
        <section className="space-y-3">
          <SectionHeader step={1} title="Modo" subtitle="Elegí tu tipo de reto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GAME_MODES.map((m, i) => {
              const isSelected = selectedMode === m.id
              return (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={() => { sfx.waterDrop(); setMode(m.id as GameModeId) }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4 text-left transition-all glass-frutiger",
                    isSelected ? "scale-[1.01]" : "border-border/60 hover:border-primary/60"
                  )}
                  style={isSelected ? { boxShadow: `0 0 24px ${m.color}50, inset 0 1px 0 rgba(255,255,255,0.25)`, borderColor: m.color, background: `linear-gradient(135deg, ${m.color}22, ${m.color}08)` } : undefined}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl drop-shadow-lg">{m.icon}</span>
                    <div>
                      <div className="text-base font-black" style={{ color: isSelected ? m.color : undefined }}>{m.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.id === "classic" ? "Personalizable" : "Sin límite · 3 vidas"}</div>
                    </div>
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center justify-center" style={{ background: m.color, color: "#070F1E" }}>
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{m.desc}</p>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* PASO 2: CATEGORÍAS (multi-select Frutiger Aero GDD V2) */}
        <section className="space-y-3">
          <SectionHeader
            step={2}
            title="Categorías"
            subtitle={selectedCount === 0 ? "Selecciona una o varias temáticas" : `${selectedCount} ${selectedCount === 1 ? "seleccionada" : "seleccionadas"} · sesión ${isMix ? "mixta" : "única"}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Mix Aleatorio — selecciona todas */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                sfx.waterDrop()
                // Toggle: si ya están todas seleccionadas, limpiar; si no, seleccionar todas
                if (selectedCount === CATEGORIES.length) {
                  useGameStore.getState().setCategories([])
                } else {
                  useGameStore.getState().setCategories(CATEGORIES.map((c) => c.id as CategoryId))
                }
              }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-3 text-left transition-all flex items-center gap-3 col-span-2 sm:col-span-3",
                selectedCount === CATEGORIES.length ? "glass-frutiger scale-[1.01]" : "border-border/60 bg-card/40 hover:bg-card/70 hover:border-border"
              )}
              style={selectedCount === CATEGORIES.length ? { boxShadow: `0 0 24px #00F5D450, inset 0 1px 0 rgba(255,255,255,0.25)`, borderColor: "#00F5D4", background: "linear-gradient(135deg, #00F5D418, #00F5D408)" } : undefined}
            >
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl text-2xl shrink-0"
                style={{ background: "#00F5D420", border: `1px solid #00F5D440` }}
              >
                <Shuffle className="w-5 h-5" style={{ color: "#00F5D4" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold truncate" style={{ color: selectedCount === CATEGORIES.length ? "#00F5D4" : undefined }}>Mix Total · Todas las categorías</div>
                <div className="text-[10px] text-muted-foreground">Toca para activar o desactivar todas</div>
              </div>
              {selectedCount === CATEGORIES.length && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "#00F5D4", color: "#070F1E" }}>✓</span>
              )}
            </motion.button>

            {CATEGORIES.map((cat, i) => {
              const isSelected = selectedCategories.includes(cat.id as CategoryId)
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={() => { sfx.waterDrop(); toggleCategory(cat.id as CategoryId) }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-3 text-left transition-all flex items-center gap-3",
                    isSelected ? "glass-frutiger scale-[1.02]" : "border-border/60 bg-card/40 hover:bg-card/70 hover:border-border"
                  )}
                  style={isSelected ? { boxShadow: `0 0 22px ${cat.color}45, inset 0 1px 0 rgba(255,255,255,0.2)`, borderColor: cat.color, background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)` } : undefined}
                >
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl text-2xl shrink-0"
                    style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate" style={{ color: isSelected ? cat.color : undefined }}>{cat.name}</div>
                    <div className="text-[10px] text-muted-foreground">100+ preguntas</div>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center justify-center" style={{ background: cat.color, color: "#070F1E" }}>
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* PASO 3: DIFICULTAD — solo en modo clásico */}
        {selectedMode === "classic" && (
          <section className="space-y-3">
            <SectionHeader step={3} title="Dificultad" subtitle="Afecta el XP base y multiplicador" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DIFFICULTIES.map((d, i) => {
                const isSelected = selectedDifficulty === d.id
                return (
                  <motion.button
                    key={d.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                    onClick={() => { sfx.waterDrop(); setDifficulty(d.id as DifficultyId) }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border p-3 text-left transition-all",
                      isSelected ? "scale-[1.02] glass-frutiger" : "border-border/60 bg-card/40 hover:bg-card/70"
                    )}
                    style={isSelected ? { boxShadow: `0 0 22px ${d.color}45, inset 0 1px 0 rgba(255,255,255,0.2)`, borderColor: d.color, background: `linear-gradient(135deg, ${d.color}18, ${d.color}08)` } : undefined}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: d.color }}>{d.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black" style={{ color: d.color }}>{d.time}</span>
                      <span className="text-[10px] text-muted-foreground">seg/pregunta</span>
                    </div>
                    <div className="text-[10px] mt-1 font-mono flex items-center gap-2">
                      <span className="text-amber-300">+{d.xpBase} XP</span>
                      <span className="text-muted-foreground">×{d.multiplier}</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </section>
        )}

        {/* PASO 4: CANTIDAD DE PREGUNTAS — solo en modo clásico */}
        {selectedMode === "classic" && (
          <section className="space-y-3">
            <SectionHeader step={4} title="Cantidad" subtitle="¿Cuántas preguntas querés responder?" />
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((qc, i) => {
                const isSelected = selectedQuestionCount === qc.id
                return (
                  <motion.button
                    key={qc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * i }}
                    onClick={() => { sfx.waterDrop(); setQuestionCount(qc.id) }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border p-3 text-center transition-all",
                      isSelected ? "scale-[1.05] glass-frutiger" : "border-border/60 bg-card/40 hover:bg-card/70"
                    )}
                    style={isSelected ? { boxShadow: `0 0 22px ${qc.color}45, inset 0 1px 0 rgba(255,255,255,0.2)`, borderColor: qc.color, background: `linear-gradient(135deg, ${qc.color}18, ${qc.color}08)` } : undefined}
                  >
                    <div className="text-2xl font-black" style={{ color: isSelected ? qc.color : undefined }}>{qc.label}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{qc.desc}</div>
                  </motion.button>
                )
              })}
            </div>
          </section>
        )}

        {/* INFO SUPERVIVENCIA */}
        {selectedMode === "survival" && (
          <section className="rounded-2xl border border-[#FF4D6D]/40 bg-[#FF4D6D]/8 p-4 glass">
            <div className="flex items-center gap-2 mb-2">
              <Skull className="w-4 h-4" style={{ color: "#FF4D6D" }} />
              <span className="font-bold text-sm" style={{ color: "#FF4D6D" }}>Reglas del Abismo</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
              <li>Comenzás con <span style={{ color: "#FF4D6D" }}>❤️ ❤️ ❤️ 3 corazones</span> — cada error resta 1 vida</li>
              <li>Tiempo inicial: <span className="text-foreground font-bold">15 segundos</span> por pregunta</li>
              <li>Cada <span className="text-foreground font-bold">5 aciertos</span> el tiempo baja 1s (mínimo 5s)</li>
              <li>Combo bioluminiscente: <span style={{ color: "#00F5D4" }}>3 seguidas = ×2</span>, <span style={{ color: "#00F5D4" }}>5 seguidas = ×3</span></li>
              <li>Se cargan 30 preguntas iniciales — sobreviví lo máximo que puedas</li>
              <li>La dificultad elegida no afecta este modo (mezcla de todas)</li>
            </ul>

            {/* Récord personal — GDD: sistema de High Score */}
            {profile?.user && profile.user.survivalRuns > 0 && (
              <div className="mt-3 pt-3 border-t border-[#FF4D6D]/20 flex items-center gap-3">
                <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Tu récord personal</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-bold text-amber-300">{profile.user.survivalBestCorrect} aciertos</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-bold text-cyan-300">+{profile.user.survivalBestXp} XP</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{profile.user.survivalRuns} runs</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* RESUMEN + CTA — Frutiger Aero Crystal Bubble */}
        <section className="space-y-3 pb-4">
          <SectionHeader
            step={selectedMode === "classic" ? 5 : 3}
            title="Resumen"
            subtitle="Verifica tu configuración"
          />
          <div className={cn("grid gap-2.5", selectedMode === "classic" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
            <SummaryCard
              icon={<Sparkles className="w-4 h-4" />}
              label="Modo"
              value={GAME_MODES.find((m) => m.id === selectedMode)?.name ?? "—"}
              color={GAME_MODES.find((m) => m.id === selectedMode)?.color}
            />
            <SummaryCard
              icon={<Target className="w-4 h-4" />}
              label={isMix ? "Categorías" : "Categoría"}
              value={selectedCount === 0 ? "—" : isMix ? `${selectedCount} mixtas` : (CATEGORIES.find((c) => c.id === selectedCategories[0])?.name ?? "—")}
              color={selectedCount > 0 ? "#00F5D4" : undefined}
            />
            {selectedMode === "classic" && (
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
          </div>

          {/* Crystal Bubble CTA — Frutiger Aero GDD V2 */}
          <button
            onClick={handleStart}
            disabled={!hasSelection || (selectedMode === "classic" && !selectedDifficulty) || startGameMut.isPending}
            className={cn(
              "w-full py-4 rounded-3xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-3 relative overflow-hidden",
              !hasSelection || (selectedMode === "classic" && !selectedDifficulty) || startGameMut.isPending
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : selectedMode === "survival"
                  ? "crystal-bubble-coral text-white animate-cta-pulse"
                  : "crystal-bubble text-[#070F1E] animate-cta-pulse"
            )}
          >
            {startGameMut.isPending ? (
              <>Iniciando…</>
            ) : !hasSelection ? (
              "Seleccioná al menos una categoría"
            ) : (selectedMode === "classic" && !selectedDifficulty) ? (
              "Seleccioná una dificultad"
            ) : (
              <>
                <Swords className="w-5 h-5 relative z-10" />
                <span className="relative z-10">
                  {selectedMode === "survival" ? "¡COMENZAR ABISMO!" : "¡COMENZAR BATALLA!"}
                </span>
              </>
            )}
          </button>
        </section>
      </main>
    </div>
  )
}

function SectionHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-xl glass border border-primary/40 text-primary text-xs font-bold flex items-center justify-center shrink-0">
        {step}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-base leading-tight">{title}</h3>
        <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
      </div>
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
        "rounded-2xl border bg-card/50 p-3 transition glass",
        color ? "border-border/60" : "border-dashed border-border/40"
      )}
      style={color ? { borderColor: `${color}50`, boxShadow: `0 0 12px ${color}15` } : undefined}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span style={color ? { color } : undefined}>{icon}</span>
        {label}
      </div>
      <div className="text-sm font-bold mt-1 truncate" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  )
}
