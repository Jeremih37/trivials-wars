"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/lib/store"
import { useProfile } from "@/hooks/use-game"
import { useAudio } from "@/hooks/use-audio"
import { Trophy, Zap, Flame, Target, Home, RotateCcw, Gift, Crown, Waves, Skull } from "lucide-react"
import { CATEGORIES, DIFFICULTIES } from "@/lib/game"
import { cn } from "@/lib/utils"

export function ResultsScreen() {
  const { activeGame, correctCount, totalXpEarned, bestStreak, reset, setScreen, lastSessionResult } = useGameStore()
  const { data: profile, refetch } = useProfile()
  const { sfx } = useAudio()

  // Refrescar perfil para mostrar el nuevo nivel
  void refetch()

  if (!activeGame) {
    return null
  }

  const cat = CATEGORIES.find((c) => c.id === activeGame.category)
  const diff = DIFFICULTIES.find((d) => d.id === activeGame.difficulty)
  const total = activeGame.questions.length
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const isSurvival = activeGame.mode === "survival"
  const isSuddenDeath = activeGame.mode === "suddendeath"
  const isEndless = isSurvival || isSuddenDeath
  const isNewRecord = (isSurvival || isSuddenDeath) && lastSessionResult?.isNewRecord
  const survivalStats = lastSessionResult?.survivalStats
  const suddenDeathStats = lastSessionResult?.suddenDeathStats

  const getRank = () => {
    if (isSuddenDeath) {
      // Rango por cantidad de aciertos en Muerte Súbita
      if (correctCount >= 20) return { label: "INMORTAL", color: "#fbbf24", emoji: "💀" }
      if (correctCount >= 15) return { label: "IMPARABLE", color: "#f59e0b", emoji: "🔥" }
      if (correctCount >= 10) return { label: "TENAZ", color: "#fb923c", emoji: "⚡" }
      if (correctCount >= 5) return { label: "VALENTE", color: "#0ea5e9", emoji: "🌊" }
      return { label: "CAÍDO", color: "#94a3b8", emoji: "💤" }
    }
    if (isSurvival) {
      if (correctCount >= 25) return { label: "LEGENDARIO", color: "#fbbf24", emoji: "👑" }
      if (correctCount >= 15) return { label: "ÉPICO", color: "#a855f7", emoji: "🔥" }
      if (correctCount >= 8) return { label: "Raro", color: "#3b82f6", emoji: "💎" }
      if (correctCount >= 3) return { label: "Inusual", color: "#22c55e", emoji: "✨" }
      return { label: "Novato", color: "#a1a1aa", emoji: "🌱" }
    }
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
        {/* Toast Nuevo Récord */}
        <AnimatePresence>
          {isNewRecord && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className={cn(
                "mb-4 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-2",
                isSuddenDeath
                  ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-900 glow-gold"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black glow-gold"
              )}
            >
              <Crown className="w-5 h-5" />
              ¡NUEVO RÉCORD PERSONAL!
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="text-xs uppercase tracking-widest text-sky-700/80">Rango obtenido</div>
          <h1
            className="text-4xl font-black uppercase tracking-tight mt-1"
            style={{ color: rank.color, textShadow: `0 0 30px ${rank.color}40` }}
          >
            {rank.label}
          </h1>
          <div className="text-sm text-sky-700 mt-2">
            {cat?.icon} {cat?.name} · {isSuddenDeath ? "☠ Muerte Súbita" : isSurvival ? "Supervivencia" : diff?.name}
          </div>
        </motion.div>

        {/* Stat grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-8"
        >
          {isEndless ? (
            <>
              <StatCard icon={<Target className="w-5 h-5" />} value={correctCount} label="Aciertos" color={isSuddenDeath ? "#f59e0b" : "#0ea5e9"} />
              <StatCard icon={<Zap className="w-5 h-5" />} value={`+${totalXpEarned}`} label="XP ganada" color="#a855f7" />
              <StatCard icon={<Flame className="w-5 h-5" />} value={bestStreak} label="Mejor racha" color="#f97316" />
              <StatCard
                icon={<Crown className="w-5 h-5" />}
                value={isSuddenDeath ? (suddenDeathStats?.bestCorrect ?? correctCount) : (survivalStats?.bestCorrect ?? correctCount)}
                label="Récord"
                color="#fbbf24"
                highlight={isNewRecord}
              />
            </>
          ) : (
            <>
              <StatCard icon={<Target className="w-5 h-5" />} value={`${correctCount}/${total}`} label="Aciertos" color="#0ea5e9" />
              <StatCard icon={<Trophy className="w-5 h-5" />} value={`${accuracy}%`} label="Precisión" color="#fbbf24" />
              <StatCard icon={<Zap className="w-5 h-5" />} value={`+${totalXpEarned}`} label="XP ganada" color="#a855f7" />
              <StatCard icon={<Flame className="w-5 h-5" />} value={bestStreak} label="Mejor racha" color="#f97316" />
            </>
          )}
        </motion.div>

        {/* Stats detalladas de Muerte Súbita */}
        {isSuddenDeath && suddenDeathStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full mt-4 rounded-2xl border border-amber-300/60 bg-amber-50/70 p-4 glass"
          >
            <div className="flex items-center gap-2 mb-2">
              <Skull className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-sm text-amber-800">Estadísticas de Muerte Súbita</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-black text-amber-700">{suddenDeathStats.bestCorrect}</div>
                <div className="text-[9px] uppercase tracking-wider text-amber-700/70">Mejor run (aciertos)</div>
              </div>
              <div>
                <div className="text-lg font-black text-amber-600">{suddenDeathStats.bestXp}</div>
                <div className="text-[9px] uppercase tracking-wider text-amber-700/70">Mejor run (XP)</div>
              </div>
              <div>
                <div className="text-lg font-black text-orange-600">{suddenDeathStats.totalRuns}</div>
                <div className="text-[9px] uppercase tracking-wider text-amber-700/70">Runs totales</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats detalladas de Supervivencia */}
        {isSurvival && survivalStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full mt-4 rounded-2xl border border-rose-300/60 bg-rose-50/70 p-4 glass"
          >
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-sm text-rose-800">Estadísticas de Supervivencia</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-black text-amber-700">{survivalStats.bestCorrect}</div>
                <div className="text-[9px] uppercase tracking-wider text-rose-700/70">Mejor run (aciertos)</div>
              </div>
              <div>
                <div className="text-lg font-black text-sky-700">{survivalStats.bestXp}</div>
                <div className="text-[9px] uppercase tracking-wider text-rose-700/70">Mejor run (XP)</div>
              </div>
              <div>
                <div className="text-lg font-black text-rose-700">{survivalStats.totalRuns}</div>
                <div className="text-[9px] uppercase tracking-wider text-rose-700/70">Runs totales</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Nivel actual */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full mt-6 rounded-2xl border border-cyan-200/60 bg-white/70 p-4 glass"
          >
            <div className="flex justify-between text-xs text-sky-700 mb-1">
              <span className="font-bold">Nivel {profile.user.level}</span>
              <span className="font-mono">{profile.user.xpIntoLevel} / {profile.user.xpForNextLevel} XP</span>
            </div>
            <div className="h-2 rounded-full bg-sky-100/80 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.user.progressPct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400"
              />
            </div>
            {profile.user.boxes > 0 && (
              <div className="mt-3 text-xs flex items-center gap-2 text-amber-700">
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
              onClick={() => { sfx.waterDrop(); setScreen("lootbox") }}
              className="py-3 px-4 rounded-xl font-bold text-sm bg-amber-400/30 border border-amber-400/60 text-amber-800 hover:bg-amber-400/40 transition flex items-center justify-center gap-2 glow-gold"
            >
              <Gift className="w-4 h-4" /> Abrir caja
            </button>
          ) : null}
          <button
            onClick={() => { sfx.waterDrop(); reset() }}
            className={cn(
              "py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 crystal-bubble text-white hover:scale-[1.02]",
              !profile?.user.boxes && "sm:col-span-2"
            )}
          >
            <RotateCcw className="w-4 h-4" /> Jugar de nuevo
          </button>
          <button
            onClick={() => { sfx.waterDrop(); reset(); setScreen("welcome") }}
            className="py-3 px-4 rounded-xl font-bold text-sm bg-white/70 border border-cyan-200/60 hover:bg-white/95 transition flex items-center justify-center gap-2 text-sky-800"
          >
            <Home className="w-4 h-4" /> Inicio
          </button>
        </motion.div>
      </main>
    </div>
  )
}

function StatCard({ icon, value, label, color, highlight = false }: { icon: React.ReactNode; value: string | number; label: string; color: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/70 p-4 text-center transition-all glass",
        highlight ? "border-amber-400/70 animate-gold-pulse" : "border-cyan-200/60"
      )}
      style={{ boxShadow: highlight ? `0 0 30px ${color}60` : `0 0 20px ${color}15` }}
    >
      <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-sky-700/70 mt-0.5">{label}</div>
    </div>
  )
}
