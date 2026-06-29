"use client"

import { motion } from "framer-motion"
import { CATEGORIES, DIFFICULTIES, type CategoryId, type DifficultyId } from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useStartGame } from "@/hooks/use-game"
import { ChevronLeft, Swords, Zap, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function HomeScreen() {
  const { setScreen, setCategory, setDifficulty, selectedCategory, selectedDifficulty, startGame } = useGameStore()
  const startGameMut = useStartGame()

  const handleStart = () => {
    if (!selectedCategory || !selectedDifficulty) return
    startGameMut.mutate(
      { category: selectedCategory, difficulty: selectedDifficulty },
      {
        onSuccess: (data) => {
          startGame(data)
        },
      }
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header compacto */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setScreen("welcome")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border hover:border-primary/60 transition text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <h1 className="text-base font-black tracking-tight text-gradient-neon">CONFIGURAR PARTIDA</h1>
          <div className="w-[80px]" />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-7">
        {/* Selección de categoría — compacta */}
        <section className="space-y-3">
          <SectionHeader
            step={1}
            title="Categoría"
            subtitle="Elige el campo de batalla"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat, i) => {
              const isSelected = selectedCategory === cat.id
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={() => setCategory(cat.id as CategoryId)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-3 text-left transition-all flex items-center gap-3",
                    isSelected
                      ? "scale-[1.02]"
                      : "border-border/60 bg-card/40 hover:bg-card/70 hover:border-border"
                  )}
                  style={
                    isSelected
                      ? { boxShadow: `0 0 20px ${cat.color}40`, borderColor: cat.color, background: `${cat.color}12` }
                      : undefined
                  }
                >
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl text-2xl shrink-0"
                    style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-bold truncate"
                      style={{ color: isSelected ? cat.color : undefined }}
                    >
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">10 preguntas</div>
                  </div>
                  {isSelected && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: cat.color, color: "#000" }}
                    >
                      ✓
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Selección de dificultad — compacta */}
        <section className="space-y-3">
          <SectionHeader
            step={2}
            title="Dificultad"
            subtitle="Menos tiempo = más XP"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DIFFICULTIES.map((d, i) => {
              const isSelected = selectedDifficulty === d.id
              return (
                <motion.button
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={() => setDifficulty(d.id as DifficultyId)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-3 text-left transition-all",
                    isSelected ? "scale-[1.02]" : "border-border/60 bg-card/40 hover:bg-card/70 hover:border-border"
                  )}
                  style={
                    isSelected
                      ? { boxShadow: `0 0 20px ${d.color}40`, borderColor: d.color, background: `${d.color}12` }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: d.color, boxShadow: `0 0 6px ${d.color}` }}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: d.color }}>
                      {d.name}
                    </span>
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

        {/* Resumen de la partida */}
        <section className="space-y-3">
          <SectionHeader
            step={3}
            title="Resumen"
            subtitle="Verifica tu configuración"
          />

          <div className="grid grid-cols-3 gap-2.5">
            <SummaryCard
              icon={<Sparkles className="w-4 h-4" />}
              label="Categoría"
              value={selectedCategory ?? "—"}
              color={selectedCategory ? CATEGORIES.find((c) => c.id === selectedCategory)?.color : undefined}
            />
            <SummaryCard
              icon={<Clock className="w-4 h-4" />}
              label="Dificultad"
              value={selectedDifficulty ? DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.name ?? "—" : "—"}
              color={selectedDifficulty ? DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.color : undefined}
            />
            <SummaryCard
              icon={<Zap className="w-4 h-4" />}
              label="XP base"
              value={selectedDifficulty ? `${DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.xpBase ?? 0}` : "—"}
              color="#fbbf24"
            />
          </div>
        </section>

        {/* CTA — COMENZAR */}
        <section className="pb-4">
          <button
            onClick={handleStart}
            disabled={!selectedCategory || !selectedDifficulty || startGameMut.isPending}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              !selectedCategory || !selectedDifficulty || startGameMut.isPending
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-500 text-white hover:scale-[1.01] active:scale-[0.99] glow-pink"
            )}
          >
            {startGameMut.isPending ? (
              <>Iniciando…</>
            ) : !selectedCategory || !selectedDifficulty ? (
              "Selecciona categoría y dificultad"
            ) : (
              <>
                <Swords className="w-5 h-5" /> ¡COMENZAR BATALLA!
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
        "rounded-2xl border bg-card/50 p-3 transition",
        color ? "border-border/60" : "border-dashed border-border/40"
      )}
      style={color ? { borderColor: `${color}50`, boxShadow: `0 0 12px ${color}15` } : undefined}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span style={color ? { color } : undefined}>{icon}</span>
        {label}
      </div>
      <div
        className="text-sm font-bold mt-1 truncate"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
    </div>
  )
}
