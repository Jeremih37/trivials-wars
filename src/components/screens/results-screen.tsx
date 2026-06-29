"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/lib/store"
import { useProfile } from "@/hooks/use-game"
import { Trophy, Zap, Flame, Target, Home, RotateCcw, Gift } from "lucide-react"
import { CATEGORIES, DIFFICULTIES } from "@/lib/game"
import { cn } from "@/lib/utils"

export function ResultsScreen() {
  const { activeGame, correctCount, totalXpEarned, bestStreak, reset, setScreen } = useGameStore()
  const { data: profile, refetch } = useProfile()

  // Refrescar perfil para mostrar el nuevo nivel
  void refetch()

  if (!activeGame) {
    return null
  }

  const cat = CATEGORIES.find((c) => c.id === activeGame.category)
  const diff = DIFFICULTIES.find((d) => d.id === activeGame.difficulty)
  const total = activeGame.questions.length
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

  const getRank = () => {
    if (accuracy === 100) return { label: "LEGENDARIO", color: "#fbbf24", emoji: "👑" }
    if (accuracy >= 80) return { label: "ÉPICO", color: "#a855f7", emoji: "🔥" }
    if (accuracy >= 60) return { label: "Raro", color: "#3b82f6", emoji: "💎" }
    if (accuracy >= 40) return { label: "Inusual", color: "#22c55e", emoji: "✨" }
    return { label: "Común", color: "#a1a1aa", emoji: "📦" }
  }
  const rank = getRank()

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-6xl mb-3"
        >
          {rank.emoji}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Rango obtenido</div>
          <h1 className="text-4xl font-black uppercase tracking-tight mt-1" style={{ color: rank.color, textShadow: `0 0 30px ${rank.color}60` }}>
            {rank.label}
          </h1>
          <div className="text-sm text-muted-foreground mt-2">{cat?.icon} {cat?.name} · {diff?.name}</div>
        </motion.div>

        {/* Stat grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-8"
        >
          <StatCard icon={<Target className="w-5 h-5" />} value={`${correctCount}/${total}`} label="Aciertos" color="#22d3ee" />
          <StatCard icon={<Trophy className="w-5 h-5" />} value={`${accuracy}%`} label="Precisión" color="#fbbf24" />
          <StatCard icon={<Zap className="w-5 h-5" />} value={`+${totalXpEarned}`} label="XP ganada" color="#a855f7" />
          <StatCard icon={<Flame className="w-5 h-5" />} value={bestStreak} label="Mejor racha" color="#f97316" />
        </motion.div>

        {/* Nivel actual */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full mt-6 rounded-2xl border border-border/60 bg-card/40 p-4"
          >
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Nivel {profile.user.level}</span>
              <span>{profile.user.xpIntoLevel} / {profile.user.xpForNextLevel} XP</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.user.progressPct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-primary via-accent to-amber-400"
              />
            </div>
            {profile.user.boxes > 0 && (
              <div className="mt-3 text-xs flex items-center gap-2 text-amber-300">
                <Gift className="w-4 h-4" />
                Tienes {profile.user.boxes} {profile.user.boxes === 1 ? "caja disponible" : "cajas disponibles"} para abrir
              </div>
            )}
          </motion.div>
        )}

        {/* Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6"
        >
          {profile?.user.boxes ? (
            <button
              onClick={() => setScreen("lootbox")}
              className="py-3 px-4 rounded-xl font-bold text-sm bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 transition flex items-center justify-center gap-2 glow-gold"
            >
              <Gift className="w-4 h-4" /> Abrir caja
            </button>
          ) : null}
          <button
            onClick={() => reset()}
            className={cn(
              "py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2",
              "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-[1.02]",
              !profile?.user.boxes && "sm:col-span-2"
            )}
          >
            <RotateCcw className="w-4 h-4" /> Jugar de nuevo
          </button>
          <button
            onClick={() => { reset(); setScreen("home") }}
            className="py-3 px-4 rounded-xl font-bold text-sm bg-card/60 border border-border/60 hover:bg-card transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Inicio
          </button>
        </motion.div>
      </main>
    </div>
  )
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-center" style={{ boxShadow: `0 0 20px ${color}10` }}>
      <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}
