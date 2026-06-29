"use client"

import { motion } from "framer-motion"
import { CATEGORIES, DIFFICULTIES, type CategoryId, type DifficultyId } from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useProfile, useStartGame } from "@/hooks/use-game"
import { AvatarSvg, buildAvatarFromIds } from "@/components/avatar-svg"
import { FRAMES_BY_ID } from "@/lib/profile-catalog"
import { Sparkles, Zap, Trophy, Gift, User, ChevronRight, Flame, Swords } from "lucide-react"
import { cn } from "@/lib/utils"

export function HomeScreen() {
  const { setScreen, setCategory, setDifficulty, selectedCategory, selectedDifficulty, startGame } = useGameStore()
  const { data: profile } = useProfile()
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

  const avatarData = profile ? buildAvatarFromIds(
    profile.user.avatarBase,
    profile.user.skinTone,
    profile.user.equipped
  ) : null
  const frame = profile ? FRAMES_BY_ID[profile.user.equippedFrame] : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="text-3xl"
              style={{ filter: "drop-shadow(0 0 8px rgba(255,45,45,0.6))" }}
            >
              🧠
            </motion.div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gradient-neon">TRIVIALS WARS</h1>
              <p className="text-[10px] text-muted-foreground -mt-1 tracking-widest uppercase">El conocimiento es poder</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreen("lootbox")}
              className="relative px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition glow-gold"
              title="Abrir Loot Box"
            >
              <Gift className="w-5 h-5" />
              {profile?.user.boxes ? (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {profile.user.boxes}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setScreen("profile")}
              className="relative p-1 rounded-xl bg-card/80 border border-border hover:border-primary/60 transition"
              title="Perfil"
            >
              {profile && frame ? (
                <div className="relative w-10 h-10">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    {frame.render()}
                  </svg>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-base">
                    {profile.user.profileIconEmoji}
                  </div>
                </div>
              ) : (
                <div className="p-2"><User className="w-5 h-5 text-primary" /></div>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-8">
        {/* Hero / Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/40 to-background p-6 sm:p-8 glow-red"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
                <Swords className="w-3.5 h-3.5" /> {profile?.user.provider === "google" ? `Conectado como ${profile.user.email}` : "Bienvenido, Jugador"}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                ¿Listo para la <span className="text-gradient-neon">batalla mental</span>?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Elige una categoría, elige tu nivel de riesgo y gana XP para desbloquear accesorios legendarios.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <StatChip icon={<Trophy className="w-4 h-4" />} label="Nivel" value={profile?.user.level ?? 1} color="text-amber-300" />
                <StatChip icon={<Zap className="w-4 h-4" />} label="XP total" value={profile?.user.xp ?? 0} color="text-red-300" />
                <StatChip icon={<Swords className="w-4 h-4" />} label="Victorias" value={profile?.user.wins ?? 0} color="text-green-400" />
                <StatChip icon={<Flame className="w-4 h-4" />} label="Racha" value={profile?.user.currentStreak ?? 0} color="text-orange-400" />
              </div>
            </div>

            {/* Avatar preview con marco */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 blur-2xl rounded-full" />
                <div className="relative w-32 h-32 rounded-full bg-card border-2 flex items-center justify-center overflow-hidden"
                  style={{ borderColor: frame?.hex ?? "#ff2d2d", boxShadow: `0 0 25px ${frame?.hex ?? "#ff2d2d"}80` }}
                >
                  {avatarData && <AvatarSvg {...avatarData} size={110} />}
                </div>
                {/* Marco decorativo */}
                {frame && (
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                    {frame.render()}
                  </svg>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Lvl {profile?.user.level ?? 1}</div>
                <div className="text-[10px] text-muted-foreground/70">{profile?.user.inventoryCount ?? 0} accesorios</div>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="relative mt-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>XP del nivel</span>
              <span>{profile?.user.xpIntoLevel ?? 0} / {profile?.user.xpForNextLevel ?? 100}</span>
            </div>
            <div className="h-3 rounded-full bg-muted/50 overflow-hidden border border-border/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile?.user.progressPct ?? 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 relative"
              >
                <div className="absolute inset-0 opacity-50 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[pulse-glow:1.5s_ease-in-out_infinite]" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Selección de categoría */}
        <section className="space-y-3">
          <SectionTitle step={1} title="Elige tu campo de batalla" subtitle="6 categorías. Cada una con su propio banco de preguntas." />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat, i) => {
              const isSelected = selectedCategory === cat.id
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  onClick={() => setCategory(cat.id as CategoryId)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                    isSelected
                      ? "border-transparent scale-[1.02]"
                      : "border-border/60 bg-card/40 hover:bg-card/70"
                  )}
                  style={
                    isSelected
                      ? { boxShadow: `0 0 24px ${cat.color}50, 0 0 50px ${cat.color}25`, borderColor: cat.color }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{cat.icon}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: cat.color, color: "#000" }}>
                        SELECCIONADO
                      </span>
                    )}
                  </div>
                  <div className="mt-2 font-bold" style={{ color: isSelected ? cat.color : undefined }}>
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">10 preguntas</div>
                  <div
                    className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition"
                    style={{ background: cat.color }}
                  />
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Selección de dificultad */}
        <section className="space-y-3">
          <SectionTitle step={2} title="Elige tu nivel de riesgo" subtitle="Menos tiempo = más XP. Más riesgo = más recompensa." />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DIFFICULTIES.map((d, i) => {
              const isSelected = selectedDifficulty === d.id
              return (
                <motion.button
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  onClick={() => setDifficulty(d.id as DifficultyId)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                    isSelected ? "scale-[1.02]" : "border-border/60 bg-card/40 hover:bg-card/70"
                  )}
                  style={
                    isSelected
                      ? { boxShadow: `0 0 24px ${d.color}50`, borderColor: d.color, background: `${d.color}10` }
                      : undefined
                  }
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: d.color }}>{d.name}</span>
                    <span className="text-2xl font-black" style={{ color: d.color }}>{d.time}s</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{d.desc}</div>
                  <div className="text-[10px] mt-2 font-mono">
                    <span className="text-amber-300">+{d.xpBase} XP</span>
                    <span className="text-muted-foreground"> · ×{d.multiplier}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="sticky bottom-3 z-30">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="rounded-2xl border border-primary/40 bg-background/80 backdrop-blur-xl p-3 shadow-2xl glow-red"
          >
            <button
              onClick={handleStart}
              disabled={!selectedCategory || !selectedDifficulty || startGameMut.isPending}
              className={cn(
                "w-full py-4 rounded-xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                !selectedCategory || !selectedDifficulty || startGameMut.isPending
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-[1.01] active:scale-[0.99]"
              )}
            >
              {startGameMut.isPending ? (
                <>Iniciando…</>
              ) : !selectedCategory || !selectedDifficulty ? (
                "Selecciona categoría y dificultad"
              ) : (
                <>
                  <Swords className="w-5 h-5" /> ¡COMENZAR BATALLA!
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        </section>
      </main>

      <footer className="mt-auto text-center text-xs text-muted-foreground/60 py-4">
        Trivials Wars · MVP · {profile?.user.provider === "google" ? "Cuenta Google" : "Modo Invitado"}
      </footer>
    </div>
  )
}

function StatChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/60 border border-border/60">
      <span className={color}>{icon}</span>
      <div className="leading-none">
        <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
        <div className="text-sm font-bold">{value}</div>
      </div>
    </div>
  )
}

function SectionTitle({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/40 text-primary text-sm font-bold flex items-center justify-center">
        {step}
      </div>
      <div>
        <h3 className="font-bold text-base">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
