"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { useGameStore } from "@/lib/store"
import { useProfile, useUpdateName } from "@/hooks/use-game"
import { AvatarSvg, buildAvatarFromIds } from "@/components/avatar-svg"
import { FRAMES_BY_ID } from "@/lib/profile-catalog"
import { WisdomCapsule } from "@/components/wisdom-capsule"
import { BubblesBackground } from "@/components/bubbles-background"
import { AudioToggle } from "@/components/audio-toggle"
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
  Play,
  Heart,
  Skull,
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
    color: "#6E82A0",
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
    color: "#FF4D6D",
    title: "Shakespeare inventó +1,700 palabras",
    description:
      "Palabras como 'lonely', 'bedroom' y 'eyeball' aparecieron por primera vez en sus obras. Su vocabulario superaba los 29,000 términos.",
  },
  {
    id: 4,
    emoji: "🧠",
    category: "Ciencia",
    color: "#A4B3C8",
    title: "El cerebro usa el 20% de tu energía",
    description:
      "Pesa apenas 1.4 kg pero consume el 20% del oxígeno y calorías. Genera energía suficiente para encender una bombilla de bajo consumo.",
  },
  {
    id: 5,
    emoji: "🐜",
    category: "Naturaleza",
    color: "#8AA088",
    title: "Las hormigas pueden cargar 50x su peso",
    description:
      "Si un humano tuviera esa fuerza proporcional, levantaría un automóvil. Existen más de 12,000 especies de hormigas en el planeta.",
  },
  {
    id: 6,
    emoji: "🏔️",
    category: "Geografía",
    color: "#6E82A0",
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
  const colorId = color.replace(/[^a-zA-Z0-9]/g, "")
  return (
    <div className="relative">
      {/* Halo gradient */}
      <div
        className="absolute inset-0 blur-2xl opacity-70 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}80 0%, transparent 70%)`,
        }}
      />
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
        <g className="animate-spin" style={{ transformOrigin: "100px 100px", animationDuration: "20s" }}>
          <circle cx="100" cy="30" r="3" fill={color} opacity="0.8" />
          <circle cx="170" cy="100" r="2" fill={color} opacity="0.6" />
          <circle cx="100" cy="170" r="2.5" fill="#ffffff" opacity="0.6" />
          <circle cx="30" cy="100" r="2" fill={color} opacity="0.5" />
        </g>
        <g opacity="0.7">
          <circle cx="50" cy="60" r="1.5" fill="#ffffff" />
          <circle cx="150" cy="50" r="1" fill="#ffffff" />
          <circle cx="60" cy="150" r="1.2" fill="#ffffff" />
          <circle cx="155" cy="140" r="1.5" fill="#ffffff" />
        </g>
      </svg>
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
    <div className="relative min-h-screen flex flex-col">
      <BubblesBackground count={28} />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/50 border-b border-slate-300/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="text-3xl"
              style={{ filter: "drop-shadow(0 0 12px rgba(110, 130, 160,0.6))" }}
            >
              🧠
            </motion.div>
            <div>
              <h1 className="text-xl font-fancy italic font-bold tracking-tight text-gradient-neon">Trivials Wars</h1>
              <p className="text-[10px] text-slate-600 -mt-1 tracking-widest uppercase">El conocimiento es poder</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AudioToggle compact />
            <button
              onClick={() => setScreen("lootbox")}
              className="relative px-3 py-2 rounded-xl bg-amber-200/40 border border-amber-400/50 text-amber-700 hover:bg-amber-300/40 transition glow-gold"
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
              className="relative p-1 rounded-xl bg-white/70 border border-slate-300/60 hover:border-slate-500/60 transition"
              title="Perfil"
            >
              {profile && frame ? (
                <div className="relative w-10 h-10">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    {frame.render()}
                  </svg>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#6E82A0]/30 to-[#B0BFAE]/30 flex items-center justify-center text-base">
                    {profile.user.profileIconEmoji}
                  </div>
                </div>
              ) : (
                <div className="p-2"><User className="w-5 h-5 text-slate-600" /></div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== LAYOUT DE 2 COLUMNAS — Estilo juego, no documento ===== */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-5 lg:py-6">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5 lg:gap-6">

          {/* ====== COLUMNA IZQUIERDA — Hero card + Stats + CTA ====== */}
          <div className="space-y-5">
            {/* Hero card con saludo + avatar */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative overflow-hidden rounded-3xl glass-frutiger p-5 sm:p-6"
            >
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#B0BFAE]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#B0BFAE]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                {/* Avatar + marco */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6E82A0]/40 to-[#B0BFAE]/40 blur-2xl rounded-full" />
                    <div
                      className="relative w-28 h-28 rounded-full bg-white/80 border-2 flex items-center justify-center overflow-hidden"
                      style={{ borderColor: frame?.hex ?? "#6E82A0", boxShadow: `0 0 25px ${frame?.hex ?? "#6E82A0"}80` }}
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
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Nivel</div>
                    <div className="text-lg font-fancy italic font-bold text-gradient-neon leading-none">{profile?.user.level ?? 1}</div>
                  </div>
                </div>

                {/* Saludo + edición de nombre */}
                <div className="flex-1 space-y-3 min-w-0 w-full">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-600 font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> ¡Bienvenido!
                  </div>

                  {!editingName ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-fancy italic font-bold leading-tight">
                        Hola, <span className="text-gradient-neon">{displayName}</span> 👋
                      </h2>
                      <button
                        onClick={startEditName}
                        className="p-2 rounded-xl bg-white/80 border border-slate-300/60 hover:border-slate-500/60 transition shrink-0"
                        title="Editar nombre"
                      >
                        <Pencil className="w-4 h-4 text-slate-600" />
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
                        className="px-4 py-3 rounded-xl bg-white/90 border border-slate-300/60 text-lg font-bold focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/40 w-full sm:w-auto sm:min-w-[280px]"
                      />
                      <button
                        onClick={saveName}
                        disabled={updateNameMut.isPending}
                        className="px-4 py-3 rounded-xl bg-slate-600 text-white hover:bg-slate-700 transition flex items-center gap-2 font-bold"
                      >
                        <Check className="w-4 h-4" />
                        {updateNameMut.isPending ? "Guardando…" : "Guardar"}
                      </button>
                      <button
                        onClick={() => setEditingName(false)}
                        className="px-4 py-3 rounded-xl bg-white/80 border border-slate-300/60 hover:bg-white/90 transition text-sm font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  <p className="text-slate-600 text-sm">
                    Cada partida es una nueva oportunidad para aprender algo increíble, ganar XP y subir de nivel.
                  </p>

                  {/* Mini stats en fila */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <MiniStat icon={<Trophy className="w-3.5 h-3.5" />} label="Nivel" value={profile?.user.level ?? 1} color="text-amber-700" />
                    <MiniStat icon={<Zap className="w-3.5 h-3.5" />} label="XP" value={profile?.user.xp ?? 0} color="text-[#8AA088]" />
                    <MiniStat icon={<Swords className="w-3.5 h-3.5" />} label="Victorias" value={profile?.user.wins ?? 0} color="text-sage-700" />
                    <MiniStat icon={<Flame className="w-3.5 h-3.5" />} label="Racha" value={profile?.user.currentStreak ?? 0} color="text-orange-500" />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* CTA principal — JUGAR (en columna izq para que esté siempre visible) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <button
                onClick={() => setScreen("home")}
                className="w-full py-5 rounded-3xl font-fancy italic font-bold text-lg sm:text-xl tracking-wide transition-all flex items-center justify-center gap-3 crystal-bubble text-white hover:scale-[1.01] active:scale-[0.99] animate-cta-pulse"
              >
                <Play className="w-6 h-6 relative z-10 fill-white" />
                <span className="relative z-10">Jugar ahora</span>
                <ChevronRight className="w-6 h-6 relative z-10" />
              </button>

              {/* Atajos rápidos a modos */}
              <div className="grid grid-cols-3 gap-2">
                <QuickMode
                  icon={<Swords className="w-4 h-4" />}
                  label="Reto"
                  color="#6E82A0"
                  onClick={() => {
                    useGameStore.getState().setMode("classic")
                    setScreen("home")
                  }}
                />
                <QuickMode
                  icon={<Heart className="w-4 h-4" />}
                  label="Abismo"
                  color="#FF4D6D"
                  onClick={() => {
                    useGameStore.getState().setMode("survival")
                    setScreen("home")
                  }}
                />
                <QuickMode
                  icon={<Skull className="w-4 h-4" />}
                  label="Muerte Súbita"
                  color="#fbbf24"
                  onClick={() => {
                    useGameStore.getState().setMode("suddendeath")
                    setScreen("home")
                  }}
                />
              </div>
              <p className="text-center text-[11px] text-slate-500">
                Elegí categoría y dificultad · Acumula XP · Sube de nivel · Desbloquea accesorios
              </p>
            </motion.section>
          </div>

          {/* ====== COLUMNA DERECHA — Datos curiosos + Wisdom ====== */}
          <div className="space-y-5">
            {/* Carrusel de datos curiosos */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-400/15 border border-slate-500/30 text-slate-600 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-fancy italic font-semibold text-lg sm:text-xl text-slate-700">¿Sabías que…?</h3>
                    <p className="text-xs text-slate-500">Datos curiosos de cultura general</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoPlay((v) => !v)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold border transition",
                    autoPlay
                      ? "bg-slate-400/15 border-slate-500/30 text-slate-600"
                      : "bg-white/60 border-slate-300/40 text-slate-500"
                  )}
                >
                  {autoPlay ? "Auto: ON" : "Auto: OFF"}
                </button>
              </div>

              {/* Card principal del dato — layout 2 lados */}
              <div
                className="relative overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-md"
                style={{ borderColor: `${currentFact.color}50`, boxShadow: `0 0 30px ${currentFact.color}25` }}
                onPointerEnter={() => setAutoPlay(false)}
                onPointerLeave={() => setAutoPlay(true)}
              >
                <div className="grid sm:grid-cols-[140px_1fr] gap-3 p-4 sm:p-5">
                  {/* Ilustración compacta */}
                  <div className="relative w-full aspect-square max-w-[140px] mx-auto sm:mx-0">
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
                  <div className="flex flex-col min-w-0">
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
                        className="mt-2"
                      >
                        <h4 className="text-lg sm:text-xl font-fancy italic font-semibold leading-tight text-slate-700">{currentFact.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed mt-1.5">
                          {currentFact.description}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Controles */}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        {FUN_FACTS.map((f, i) => (
                          <button
                            key={f.id}
                            onClick={() => setFactIdx(i)}
                            className={cn(
                              "h-1.5 rounded-full transition-all",
                              i === factIdx ? "w-6 bg-blue-500" : "w-1.5 bg-blue-200/70 hover:bg-blue-400/70"
                            )}
                            aria-label={`Ir al dato ${i + 1}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={goPrev}
                          className="p-2 rounded-xl bg-white/80 border border-slate-300/60 hover:border-slate-500/60 hover:bg-white transition"
                          aria-label="Dato anterior"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="text-xs font-mono text-slate-500 tabular-nums">
                          {factIdx + 1} / {FUN_FACTS.length}
                        </span>
                        <button
                          onClick={goNext}
                          className="p-2 rounded-xl bg-white/80 border border-slate-300/60 hover:border-slate-500/60 hover:bg-white transition"
                          aria-label="Dato siguiente"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Cápsulas de Sabiduría */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <WisdomCapsule />
            </motion.section>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-auto text-center text-xs text-slate-500 py-4">
        Trivials Wars · {profile?.user.provider === "google" ? "Cuenta Google" : "Modo Invitado"}
      </footer>
    </div>
  )
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 border border-slate-300/40">
      <span className={color}>{icon}</span>
      <span className="text-[9px] uppercase text-slate-500 tracking-wider">{label}</span>
      <span className="text-xs font-bold text-slate-800">{value}</span>
    </div>
  )
}

function QuickMode({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border bg-white/70 transition hover:scale-[1.03] active:scale-[0.98]"
      style={{
        borderColor: `${color}50`,
        boxShadow: `0 2px 8px ${color}15`,
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </button>
  )
}
