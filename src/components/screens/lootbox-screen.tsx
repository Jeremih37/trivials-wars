"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/lib/store"
import { useOpenLootBox } from "@/hooks/use-game"
import { RARITY_CONFIG, ITEMS_BY_ID } from "@/lib/gacha-catalog"
import type { Rarity } from "@/lib/gacha-catalog"
import { ArrowLeft, Gift, Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type Phase = "idle" | "shaking" | "reveal"

export function LootBoxScreen() {
  const { setScreen } = useGameStore()
  const openMut = useOpenLootBox()
  const [phase, setPhase] = useState<Phase>("idle")
  const [result, setResult] = useState<Awaited<ReturnType<typeof openMut.mutateAsync>> | null>(null)

  const handleOpen = async () => {
    if (openMut.isPending) return
    setPhase("shaking")
    setResult(null)
    // duración del shake y suspenso: 2.5s
    await new Promise((r) => setTimeout(r, 2500))
    try {
      const res = await openMut.mutateAsync()
      setResult(res)
      setPhase("reveal")
    } catch (e) {
      setPhase("idle")
    }
  }

  const handleClose = () => {
    setPhase("idle")
    setResult(null)
  }

  const rarityConfig = result ? RARITY_CONFIG[result.rarity as Rarity] : null

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setScreen("welcome")}
            className="p-2 rounded-xl bg-card/60 border border-border/60 hover:bg-card transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight">Loot Box</h1>
            <p className="text-[10px] text-muted-foreground">Rareza y suerte definieron tu recompensa</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* ===== IDLE / SHAKING ===== */}
          {phase !== "reveal" && (
            <motion.div
              key="box"
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {/* Probabilidades */}
              <div className="grid grid-cols-5 gap-2 w-full mb-8">
                {(Object.keys(RARITY_CONFIG) as Rarity[]).map((r) => {
                  const cfg = RARITY_CONFIG[r]
                  return (
                    <div key={r} className="text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: cfg.hex }}>{cfg.label}</div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-muted/40">
                        <div className="h-full" style={{ width: `${cfg.probability * 100}%`, background: cfg.hex }} />
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-1 font-mono">{(cfg.probability * 100).toFixed(0)}%</div>
                    </div>
                  )
                })}
              </div>

              {/* Caja */}
              <motion.div
                animate={
                  phase === "shaking"
                    ? { x: [0, -8, 8, -8, 8, -4, 4, 0], rotate: [0, -3, 3, -3, 3, -2, 2, 0] }
                    : { y: [0, -10, 0] }
                }
                transition={
                  phase === "shaking"
                    ? { duration: 0.4, repeat: 6, ease: "easeInOut" }
                    : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative mb-8"
              >
                {phase === "shaking" && (
                  <>
                    {/* Anillos de energía durante el shake */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-amber-400"
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      className="absolute inset-0 rounded-full border-2 border-purple-400"
                    />
                  </>
                )}
                <div
                  className={cn(
                    "relative w-48 h-48 rounded-3xl flex items-center justify-center text-8xl",
                    "bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-pink-500/20",
                    "border-2 border-amber-400/50",
                    phase === "shaking" ? "glow-gold" : "shadow-2xl"
                  )}
                >
                  🎁
                  <Sparkles className="absolute top-2 right-2 w-6 h-6 text-amber-300 animate-pulse" />
                  <Sparkles className="absolute bottom-2 left-2 w-4 h-4 text-purple-300 animate-pulse" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-black uppercase tracking-widest mb-2">
                {phase === "shaking" ? "Abriendo…" : "Tu recompensa espera"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                {phase === "shaking"
                  ? "La caja está reaccionando… la rareza se revela pronto"
                  : "Pulsa para liberar el contenido. Suerte, jugador."}
              </p>

              <button
                onClick={handleOpen}
                disabled={openMut.isPending || phase === "shaking"}
                className={cn(
                  "px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all",
                  openMut.isPending || phase === "shaking"
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-black hover:scale-[1.02] active:scale-[0.98] glow-gold"
                )}
              >
                {phase === "shaking" ? "..." : "🎁 ABRIR CAJA"}
              </button>

              {openMut.isError && (
                <p className="text-xs text-red-400 mt-3">{(openMut.error as Error)?.message || "Error al abrir caja"}</p>
              )}
            </motion.div>
          )}

          {/* ===== REVEAL ===== */}
          {phase === "reveal" && result && rarityConfig && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="flex flex-col items-center"
            >
              {/* Explosión de luz + partículas */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute pointer-events-none"
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${rarityConfig.hex} 0%, transparent 70%)`,
                }}
              />

              {/* Partículas para épico/legendario */}
              {(result.rarity === "Epico" || result.rarity === "Legendario") && (
                <div className="absolute pointer-events-none w-[500px] h-[500px] flex items-center justify-center -z-10">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * Math.PI * 2
                    const distance = 120 + Math.random() * 60
                    return (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos(angle) * distance,
                          y: Math.sin(angle) * distance,
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={{ duration: 1.5, delay: 0.1 + Math.random() * 0.3 }}
                        className="absolute w-2 h-2 rounded-full"
                        style={{ background: rarityConfig.hex, boxShadow: `0 0 10px ${rarityConfig.hex}` }}
                      />
                    )
                  })}
                </div>
              )}

              {/* Item */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className={cn(
                  "relative w-48 h-48 rounded-3xl flex items-center justify-center mb-4 p-3",
                  "bg-gradient-to-br",
                  rarityConfig.color,
                  "border-2"
                )}
                style={{
                  borderColor: rarityConfig.hex,
                  boxShadow: `0 0 40px ${rarityConfig.hex}, 0 0 80px ${rarityConfig.hex}60`,
                }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {ITEMS_BY_ID[result.item.id]?.render({ skinTone: "#f4c2a1" })}
                </svg>
                {result.rarity === "Legendario" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 rounded-3xl"
                    style={{
                      background: `conic-gradient(from 0deg, transparent, ${rarityConfig.hex}, transparent, ${rarityConfig.hex}, transparent)`,
                      zIndex: -1,
                      filter: "blur(8px)",
                      opacity: 0.5,
                    }}
                  />
                )}
              </motion.div>

              {/* Rarity label */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xs uppercase tracking-widest font-bold mb-1"
                style={{ color: rarityConfig.hex }}
              >
                {rarityConfig.label}
              </motion.div>
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-3xl font-black mb-1"
                style={{ color: rarityConfig.hex, textShadow: `0 0 20px ${rarityConfig.hex}80` }}
              >
                {result.item.name}
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-muted-foreground mb-2 text-center max-w-sm"
              >
                {result.item.description}
              </motion.p>

              {result.isDuplicate && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-200 text-xs mb-4"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Duplicado · +{result.xpBonus} XP de compensación
                </motion.div>
              )}

              {result.levelUp && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="mb-4 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-sm font-bold"
                >
                  ⬆ ¡Subiste al nivel {result.newLevel}! +1 Loot Box
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="flex gap-3"
              >
                <button
                  onClick={handleClose}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-card/60 border border-border/60 hover:bg-card transition"
                >
                  Cerrar
                </button>
                {result.boxesRemaining > 0 && (
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-pink-500 text-black hover:scale-[1.02] transition glow-gold flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4" /> Abrir otra ({result.boxesRemaining})
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
