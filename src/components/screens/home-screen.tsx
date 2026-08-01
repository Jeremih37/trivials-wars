"use client"

import { motion } from "framer-motion"
import {
  CATEGORIES,
  DIFFICULTIES,
  GAME_MODES,
  QUESTION_COUNTS,
  TIME_PRESETS,
  type CategoryId,
  type DifficultyId,
  type GameModeId,
} from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useStartGame, useProfile } from "@/hooks/use-game"
import { useAudio } from "@/hooks/use-audio"
import { AudioToggle } from "@/components/audio-toggle"
import { ChevronLeft, Swords, Zap, Clock, Sparkles, Target, Skull, Shuffle, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

export function HomeScreen() {
  const {
    setScreen,
    setCategory,
    setDifficulty,
    setMode,
    setQuestionCount,
    setTimePreset,
    selectedCategory,
    selectedDifficulty,
    selectedMode,
    selectedQuestionCount,
    selectedTimePreset,
    startGame,
  } = useGameStore()
  const startGameMut = useStartGame()
  const { sfx } = useAudio()
  const { data: profile } = useProfile()

  // Mix Aleatorio = special pseudo-category "mix"
  const isMix = selectedCategory === "mix"

  const handleStart = () => {
    if (!selectedCategory || !selectedDifficulty) return
    sfx.waterDrop()
    startGameMut.mutate(
      {
        category: selectedCategory,
        difficulty: selectedDifficulty,
        mode: selectedMode,
        questionCount: selectedMode === "classic" ? selectedQuestionCount : undefined,
        timePreset: selectedMode === "classic" ? selectedTimePreset : undefined,
      },
      {
        onSuccess: (data) => {
          startGame(data)
        },
      }
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { sfx.waterDrop(); setScreen("welcome") }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border hover:border-primary/60 transition text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="text-base font-black tracking-tight text-gradient-neon">CONFIGURAR PARTIDA</h1>
          <div className="flex items-center gap-2">
            <AudioToggle compact />
            <div className="w-[20px]" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-7">
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
                    "relative overflow-hidden rounded-2xl border p-4 text-left transition-all glass",
                    isSelected ? "scale-[1.01]" : "border-border/60 hover:bg-card/70 hover:border-border"
                  )}
                  style={isSelected ? { boxShadow: `0 0 20px ${m.color}40`, borderColor: m.color, background: `${m.color}12` } : undefined}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl">{m.icon}</span>
                    <div>
                      <div className="text-base font-black" style={{ color: isSelected ? m.color : undefined }}>{m.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.id === "classic" ? "Personalizable" : "Sin límite · 3 vidas"}</div>
                    </div>
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: m.color, color: "#070F1E" }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{m.desc}</p>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* PASO 2: CATEGORÍA */}
        <section className="space-y-3">
          <SectionHeader step={2} title="Categoría" subtitle="Elige el campo de batalla" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Mix Aleatorio — special */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => { sfx.waterDrop(); setCategory("mix" as CategoryId) }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-3 text-left transition-all flex items-center gap-3 col-span-2 sm:col-span-3",
                isMix ? "scale-[1.01] glass-strong" : "border-border/60 bg-card/40 hover:bg-card/70 hover:border-border"
              )}
              style={isMix ? { boxShadow: `0 0 22px #00F5D440`, borderColor: "#00F5D4", background: "#00F5D410" } : undefined}
            >
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl text-2xl shrink-0"
                style={{ background: "#00F5D420", border: `1px solid #00F5D440` }}
              >
                <Shuffle className="w-5 h-5" style={{ color: "#00F5D4" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold truncate" style={{ color: isMix ? "#00F5D4" : undefined }}>Mix Aleatorio</div>
                <div className="text-[10px] text-muted-foreground">Todas las categorías mezcladas · 100+ por categoría</div>
              </div>
              {isMix && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "#00F5D4", color: "#070F1E" }}>✓</span>
              )}
            </motion.button>

            {CATEGORIES.map((cat, i) => {
              const isSelected = selectedCategory === cat.id
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={() => { sfx.waterDrop(); setCategory(cat.id as CategoryId) }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-3 text-left transition-all flex items-center gap-3",
                    isSelected ? "scale-[1.02] glass" : "border-border/60 bg-card/40 hover:bg-card/70 hover:border-border"
                  )}
                  style={isSelected ? { boxShadow: `0 0 20px ${cat.color}40`, borderColor: cat.color, background: `${cat.color}12` } : undefined}
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
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: cat.color, color: "#070F1E" }}>✓</span>
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
                      isSelected ? "scale-[1.02] glass" : "border-border/60 bg-card/40 hover:bg-card/70"
                    )}
                    style={isSelected ? { boxShadow: `0 0 20px ${d.color}40`, borderColor: d.color, background: `${d.color}12` } : undefined}
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
                      isSelected ? "scale-[1.05] glass" : "border-border/60 bg-card/40 hover:bg-card/70"
                    )}
                    style={isSelected ? { boxShadow: `0 0 20px ${qc.color}40`, borderColor: qc.color, background: `${qc.color}12` } : undefined}
                  >
                    <div className="text-2xl font-black" style={{ color: isSelected ? qc.color : undefined }}>{qc.label}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{qc.desc}</div>
                  </motion.button>
                )
              })}
            </div>
          </section>
        )}

        {/* PASO 5: SELECTOR DE TIEMPO — solo en modo clásico */}
        {selectedMode === "classic" && (
          <section className="space-y-3">
            <SectionHeader step={5} title="Tiempo por pregunta" subtitle="Cuánta presión querés sentir" />
            <div className="grid grid-cols-3 gap-2">
              {TIME_PRESETS.map((tp, i) => {
                const isSelected = selectedTimePreset === tp.id
                return (
                  <motion.button
                    key={tp.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * i }}
                    onClick={() => { sfx.waterDrop(); setTimePreset(tp.id) }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border p-3 text-center transition-all",
                      isSelected ? "scale-[1.05] glass" : "border-border/60 bg-card/40 hover:bg-card/70"
                    )}
                    style={isSelected ? { boxShadow: `0 0 20px ${tp.color}40`, borderColor: tp.color, background: `${tp.color}12` } : undefined}
                  >
                    <div className="text-2xl font-black flex items-center justify-center gap-1" style={{ color: isSelected ? tp.color : undefined }}>
                      {tp.id === 0 ? <Clock className="w-5 h-5" /> : tp.label}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{tp.desc}</div>
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

        {/* RESUMEN + CTA */}
        <section className="space-y-3 pb-4">
          <SectionHeader
            step={selectedMode === "classic" ? 6 : 3}
            title="Resumen"
            subtitle="Verifica tu configuración"
          />
          <div className={cn("grid gap-2.5", selectedMode === "classic" ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-2")}>
            <SummaryCard
              icon={<Sparkles className="w-4 h-4" />}
              label="Modo"
              value={GAME_MODES.find((m) => m.id === selectedMode)?.name ?? "—"}
              color={GAME_MODES.find((m) => m.id === selectedMode)?.color}
            />
            <SummaryCard
              icon={<Target className="w-4 h-4" />}
              label="Categoría"
              value={isMix ? "Mix" : (CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? "—")}
              color={isMix ? "#00F5D4" : selectedCategory ? CATEGORIES.find((c) => c.id === selectedCategory)?.color : undefined}
            />
            {selectedMode === "classic" && (
              <>
                <SummaryCard
                  icon={<Clock className="w-4 h-4" />}
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
                <SummaryCard
                  icon={<Clock className="w-4 h-4" />}
                  label="Tiempo"
                  value={selectedTimePreset === 0 ? "∞" : `${selectedTimePreset}s`}
                  color={TIME_PRESETS.find((t) => t.id === selectedTimePreset)?.color}
                />
              </>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={!selectedCategory || (selectedMode === "classic" && !selectedDifficulty) || startGameMut.isPending}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2",
              !selectedCategory || (selectedMode === "classic" && !selectedDifficulty) || startGameMut.isPending
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : selectedMode === "survival"
                  ? "bg-gradient-to-r from-[#FF4D6D] via-[#ff6b8a] to-[#FF4D6D] text-white hover:scale-[1.01] active:scale-[0.99] glow-coral"
                  : "bg-gradient-to-r from-[#00F5D4] via-[#00B4D8] to-[#2dd4bf] text-[#070F1E] hover:scale-[1.01] active:scale-[0.99] glow-bioluminescent"
            )}
          >
            {startGameMut.isPending ? (
              <>Iniciando…</>
            ) : !selectedCategory || (selectedMode === "classic" && !selectedDifficulty) ? (
              "Seleccioná categoría y dificultad"
            ) : (
              <>
                <Swords className="w-5 h-5" />
                {selectedMode === "survival" ? "¡COMENZAR ABISMO!" : "¡COMENZAR BATALLA!"}
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
      <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center shrink-0">
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
        "rounded-2xl border bg-card/50 p-3 transition glass-light",
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
