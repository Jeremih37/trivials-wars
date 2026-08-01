"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { useGameStore } from "@/lib/store"
import { useProfile, useUpdateName } from "@/hooks/use-game"
import { AvatarSvg, buildAvatarFromIds } from "@/components/avatar-svg"
import { FRAMES_BY_ID } from "@/lib/profile-catalog"
import {
  Sparkles,
  Trophy,
  Zap,
  Gift,
  User,
  Flame,
  Swords,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Check,
  Brain,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ====== Datos curiosos de cultura general ======
interface FunFact {
  id: number
  emoji: string
  category: string
  color: string
  title: string
  description: string
}

const FUN_FACTS: FunFact[] = [
  {
    id: 1,
    emoji: "🐙",
    category: "Ciencia",
    color: "#a855f7",
    title: "El pulpo tiene tres corazones",
    description:
      "Dos corazones bombean sangre a las branquias y el tercero al resto del cuerpo. Cuando nada, el corazón principal se detiene, por eso prefieren caminar.",
  },
  {
    id: 2,
    emoji: "🧱",
    category: "Historia",
    color: "#f59e0b",
    title: "La Gran Muralla China mide +21,000 km",
    description:
      "No es una sola pared, sino una red de tramos construidos a lo largo de 2,000 años. Se dice que es visible desde la órbita baja terrestre.",
  },
  {
    id: 3,
    emoji: "🎭",
    category: "Cultura",
    color: "#ec4899",
    title: "Shakespeare inventó +1,700 palabras",
    description:
      "Palabras como 'lonely', 'bedroom' y 'eyeball' aparecieron por primera vez en sus obras. Su vocabulario superaba los 29,000 términos.",
  },
  {
    id: 4,
    emoji: "🧠",
    category: "Ciencia",
    color: "#06b6d4",
    title: "El cerebro usa el 20% de tu energía",
    description:
      "Pesa apenas 1.4 kg pero consume el 20% del oxígeno y calorías. Genera energía suficiente para encender una bombilla de bajo consumo.",
  },
  {
    id: 5,
    emoji: "🐜",
    category: "Naturaleza",
    color: "#84cc16",
    title: "Las hormigas pueden cargar 50x su peso",
    description:
      "Si un humano tuviera esa fuerza proporcional, levantaría un automóvil. Existen más de 12,000 especies de hormigas en el planeta.",
  },
  {
    id: 6,
    emoji: "🏔️",
    category: "Geografía",
    color: "#3b82f6",
    title: "El Everest crece 4 mm cada año",
    description:
      "La colisión de placas tectónicas entre India y Asia empuja la montaña hacia arriba. Hace 50 millones de años esta zona estaba bajo el mar.",
  },
  {
    id: 7,
    emoji: "🏓",
    category: "Videojuegos",
    color: "#a855f7",
    title: "El primer videojuego es de 1958",
    description:
      "'Tennis for Two' fue creado por el físico William Higinbotham en un osciloscopio. Se creó para entretener a los visitantes de un laboratorio.",
  },
  {
    id: 8,
    emoji: "🏀",
    category: "Deporte",
    color: "#f97316",
    title: "El basketball se inventó en 1891",
    description:
      "James Naismith usó canastas de melocotones y un balón de fútbol. El primer partido terminó 1-0. Hoy se juega en más de 200 países.",
  },
]

// ====== Ilustración SVG decorativa para cada categoría ======
function FactIllustration({ color, emoji }: { color: string; emoji: string }) {
  // Sanitizar el color para usarlo como id de SVG (quitar el #)
  const colorId = color.replace(/[^a-zA-Z0-9]/g, "")
  return (
    <div className="relative">
      {/* Halo gradient */}
      <div
        className="absolute inset-0 blur-2xl opacity-60 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}80 0%, transparent 70%)`,
        }}
      />
      {/* Decorative concentric rings */}
      <svg viewBox="0 0 200 200" className="relative w-full h-full">
        <defs>
          <radialGradient id={`grad-${colorId}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`ring-${colorId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill={`url(#grad-${colorId})`} />
        <circle cx="100" cy="100" r="70" fill="none" stroke={`url(#ring-${colorId})`} strokeWidth="2" strokeDasharray="4 6" opacity="0.7" />
        <circle cx="100" cy="100" r="58" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
        {/* Orbiting dots */}
        <g className="animate-spin" style={{ transformOrigin: "100px 100px", animationDuration: "20s" }}>
          <circle cx="100" cy="30" r="3" fill={color} opacity="0.8" />
          <circle cx="170" cy="100" r="2" fill={color} opacity="0.6" />
          <circle cx="100" cy="170" r="2.5" fill="#ffffff" opacity="0.6" />
          <circle cx="30" cy="100" r="2" fill={color} opacity="0.5" />
        </g>
        {/* Sparkle accents */}
        <g opacity="0.7">
          <circle cx="50" cy="60" r="1.5" fill="#ffffff" />
          <circle cx="150" cy="50" r="1" fill="#ffffff" />
          <circle cx="60" cy="150" r="1.2" fill="#ffffff" />
          <circle cx="155" cy="140" r="1.5" fill="#ffffff" />
        </g>
      </svg>
      {/* Big emoji on top */}
      <div
        className="absolute inset-0 flex items-center justify-center text-7xl drop-shadow-2xl animate-float-slow"
        style={{ filter: `drop-shadow(0 0 20px ${color})` }}
      >
        {emoji}
      </div>
    </div>
  )
}

export function WelcomeScreen() {
  const { setScreen } = useGameStore()
  const { data: profile } = useProfile()
  const updateNameMut = useUpdateName()

  const [factIdx, setFactIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")

  const currentFact = FUN_FACTS[factIdx]

  // Auto-rotate facts every 6 seconds
  useEffect(() => {
    if (!autoPlay) return
    const t = setInterval(() => {
      setFactIdx((i) => (i + 1) % FUN_FACTS.length)
    }, 6000)
    return () => clearInterval(t)
  }, [autoPlay])

  const goNext = useCallback(() => {
    setFactIdx((i) => (i + 1) % FUN_FACTS.length)
  }, [])
  const goPrev = useCallback(() => {
    setFactIdx((i) => (i - 1 + FUN_FACTS.length) % FUN_FACTS.length)
  }, [])

  const startEditName = () => {
    setNameInput(profile?.user.name ?? "Jugador")
    setEditingName(true)
  }

  const saveName = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    updateNameMut.mutate(
      { name: trimmed },
      {
        onSuccess: () => setEditingName(false),
      }
    )
  }

  const avatarData = profile
    ? buildAvatarFromIds(profile.user.avatarBase, profile.user.skinTone, profile.user.equipped)
    : null
  const frame = profile ? FRAMES_BY_ID[profile.user.equippedFrame] : null

  const displayName = profile?.user.name ?? "Jugador"

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
              style={{ filter: "drop-shadow(0 0 8px rgba(236,72,153,0.6))" }}
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Saludo + Personalización del nombre */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/40 to-background p-6 glow-pink"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
                <Sparkles className="w-3.5 h-3.5" /> ¡Bienvenido!
              </div>

              {!editingName ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                    Hola, <span className="text-gradient-neon">{displayName}</span> 👋
                  </h2>
                  <button
                    onClick={startEditName}
                    className="p-2 rounded-xl bg-card/80 border border-border hover:border-primary/60 transition"
                    title="Editar nombre"
                  >
                    <Pencil className="w-4 h-4 text-primary" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value.slice(0, 20))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName()
                      if (e.key === "Escape") setEditingName(false)
                    }}
                    autoFocus
                    placeholder="Tu nombre de jugador"
                    className="px-4 py-3 rounded-xl bg-input border border-border/60 text-lg font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 w-full sm:w-auto sm:min-w-[280px]"
                  />
                  <button
                    onClick={saveName}
                    disabled={updateNameMut.isPending}
                    className="px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition flex items-center gap-2 font-bold"
                  >
                    <Check className="w-4 h-4" />
                    {updateNameMut.isPending ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-4 py-3 rounded-xl bg-card border border-border hover:bg-card/70 transition text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <p className="text-muted-foreground text-sm sm:text-base">
                Cada partida es una nueva oportunidad para aprender algo increíble, ganar XP y subir de nivel.
              </p>

              {/* Mini stats */}
              <div className="flex flex-wrap gap-2 pt-1">
                <MiniStat icon={<Trophy className="w-3.5 h-3.5" />} label="Nivel" value={profile?.user.level ?? 1} color="text-amber-300" />
                <MiniStat icon={<Zap className="w-3.5 h-3.5" />} label="XP" value={profile?.user.xp ?? 0} color="text-cyan-300" />
                <MiniStat icon={<Swords className="w-3.5 h-3.5" />} label="Victorias" value={profile?.user.wins ?? 0} color="text-green-400" />
                <MiniStat icon={<Flame className="w-3.5 h-3.5" />} label="Racha" value={profile?.user.currentStreak ?? 0} color="text-orange-400" />
              </div>
            </div>

            {/* Avatar preview */}
            <div className="flex flex-col items-center gap-2 mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 blur-2xl rounded-full" />
                <div
                  className="relative w-28 h-28 rounded-full bg-card border-2 flex items-center justify-center overflow-hidden"
                  style={{ borderColor: frame?.hex ?? "#ec4899", boxShadow: `0 0 25px ${frame?.hex ?? "#ec4899"}80` }}
                >
                  {avatarData && <AvatarSvg {...avatarData} size={100} />}
                </div>
                {frame && (
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                    {frame.render()}
                  </svg>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Lvl {profile?.user.level ?? 1}</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Carrusel de datos curiosos */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/40 text-primary flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg">¿Sabías que…?</h3>
                <p className="text-xs text-muted-foreground">Datos curiosos de cultura general</p>
              </div>
            </div>
            <button
              onClick={() => setAutoPlay((v) => !v)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition",
                autoPlay
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-card/60 border-border text-muted-foreground"
              )}
            >
              {autoPlay ? "Auto: ON" : "Auto: OFF"}
            </button>
          </div>

          {/* Card principal del dato */}
          <div
            className="relative overflow-hidden rounded-3xl border bg-card/50 backdrop-blur-sm"
            style={{ borderColor: `${currentFact.color}50`, boxShadow: `0 0 30px ${currentFact.color}25` }}
            onPointerEnter={() => setAutoPlay(false)}
            onPointerLeave={() => setAutoPlay(true)}
          >
            <div className="grid sm:grid-cols-[200px_1fr] gap-4 p-5 sm:p-7">
              {/* Ilustración */}
              <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFact.id}
                    initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6, rotate: 10 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full"
                  >
                    <FactIllustration color={currentFact.color} emoji={currentFact.emoji} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Contenido textual */}
              <div className="flex flex-col">
                <div
                  className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `${currentFact.color}20`, color: currentFact.color, border: `1px solid ${currentFact.color}50` }}
                >
                  <Lightbulb className="w-3 h-3" /> {currentFact.category}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFact.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3"
                  >
                    <h4 className="text-xl sm:text-2xl font-black leading-tight">{currentFact.title}</h4>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-2">
                      {currentFact.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Controles */}
                <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {FUN_FACTS.map((f, i) => (
                      <button
                        key={f.id}
                        onClick={() => setFactIdx(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === factIdx ? "w-6 bg-primary" : "w-1.5 bg-muted hover:bg-muted-foreground/50"
                        )}
                        aria-label={`Ir al dato ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goPrev}
                      className="p-2 rounded-xl bg-card border border-border hover:border-primary/60 hover:bg-card/70 transition"
                      aria-label="Dato anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {factIdx + 1} / {FUN_FACTS.length}
                    </span>
                    <button
                      onClick={goNext}
                      className="p-2 rounded-xl bg-card border border-border hover:border-primary/60 hover:bg-card/70 transition"
                      aria-label="Dato siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA principal — JUGAR */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setScreen("home")}
            className="w-full py-5 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-500 text-white hover:scale-[1.01] active:scale-[0.99] glow-pink"
          >
            <Swords className="w-6 h-6" /> ¡JUGAR AHORA!
            <ChevronRight className="w-6 h-6" />
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Elige categoría y dificultad · Acumula XP · Sube de nivel · Desbloquea accesorios
          </p>
        </motion.section>
      </main>

      <footer className="mt-auto text-center text-xs text-muted-foreground/60 py-4">
        Trivials Wars · {profile?.user.provider === "google" ? "Cuenta Google" : "Modo Invitado"}
      </footer>
    </div>
  )
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/60 border border-border/60">
      <span className={color}>{icon}</span>
      <span className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  )
}
