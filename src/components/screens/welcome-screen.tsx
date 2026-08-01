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

const FACT_COLOR = {
  ciencia: "#00E5FF",
  historia: "#FFEA00",
  cultura: "#FF4D6D",
  naturaleza: "#39FF14",
  geografia: "#7DD3FC",
  videojuegos: "#a855f7",
  deporte: "#f97316",
  espacio: "#C084FC",
  arte: "#F472B6",
  musica: "#34D399",
  tecnologia: "#60A5FA",
  idiomas: "#FBBF24",
  ocean: "#22D3EE",
  cuerpo: "#FB7185",
  inventos: "#A78BFA",
  literatura: "#FCD34D",
  mitologia: "#F87171",
  mariposas: "#F59E0B",
} as const

const FUN_FACTS: FunFact[] = [
  {
    id: 1,
    emoji: "🐙",
    category: "Ciencia",
    color: FACT_COLOR.ciencia,
    title: "El pulpo tiene tres corazones",
    description:
      "Dos corazones bombean sangre a las branquias y el tercero al resto del cuerpo. Cuando nada, el corazón principal se detiene, por eso prefieren caminar.",
  },
  {
    id: 2,
    emoji: "🧱",
    category: "Historia",
    color: FACT_COLOR.historia,
    title: "La Gran Muralla China mide +21,000 km",
    description:
      "No es una sola pared, sino una red de tramos construidos a lo largo de 2,000 años. Se dice que es visible desde la órbita baja terrestre.",
  },
  {
    id: 3,
    emoji: "🎭",
    category: "Cultura",
    color: FACT_COLOR.cultura,
    title: "Shakespeare inventó +1,700 palabras",
    description:
      "Palabras como 'lonely', 'bedroom' y 'eyeball' aparecieron por primera vez en sus obras. Su vocabulario superaba los 29,000 términos.",
  },
  {
    id: 4,
    emoji: "🧠",
    category: "Ciencia",
    color: FACT_COLOR.ciencia,
    title: "El cerebro usa el 20% de tu energía",
    description:
      "Pesa apenas 1.4 kg pero consume el 20% del oxígeno y calorías. Genera energía suficiente para encender una bombilla de bajo consumo.",
  },
  {
    id: 5,
    emoji: "🐜",
    category: "Naturaleza",
    color: FACT_COLOR.naturaleza,
    title: "Las hormigas pueden cargar 50x su peso",
    description:
      "Si un humano tuviera esa fuerza proporcional, levantaría un automóvil. Existen más de 12,000 especies de hormigas en el planeta.",
  },
  {
    id: 6,
    emoji: "🏔️",
    category: "Geografía",
    color: FACT_COLOR.geografia,
    title: "El Everest crece 4 mm cada año",
    description:
      "La colisión de placas tectónicas entre India y Asia empuja la montaña hacia arriba. Hace 50 millones de años esta zona estaba bajo el mar.",
  },
  {
    id: 7,
    emoji: "🏓",
    category: "Videojuegos",
    color: FACT_COLOR.videojuegos,
    title: "El primer videojuego es de 1958",
    description:
      "'Tennis for Two' fue creado por el físico William Higinbotham en un osciloscopio. Se creó para entretener a los visitantes de un laboratorio.",
  },
  {
    id: 8,
    emoji: "🏀",
    category: "Deporte",
    color: FACT_COLOR.deporte,
    title: "El basketball se inventó en 1891",
    description:
      "James Naismith usó canastas de melocotones y un balón de fútbol. El primer partido terminó 1-0. Hoy se juega en más de 200 países.",
  },
  // ====== NUEVOS DATOS (22 más, total 30) ======
  {
    id: 9,
    emoji: "🌍",
    category: "Espacio",
    color: FACT_COLOR.espacio,
    title: "La Tierra rotó más rápido en 2020",
    description:
      "El 19 de julio de 2020 fue el día más corto jamás medido: 1.46 ms menos de 24 horas. El clima, los océanos y el núcleo afectan la rotación planetaria.",
  },
  {
    id: 10,
    emoji: "🎨",
    category: "Arte",
    color: FACT_COLOR.arte,
    title: "Van Gogh vendió un solo cuadro en vida",
    description:
      "'La viña roja' se vendió por 400 francos en 1890, meses antes de su muerte. Hoy sus obras superan los 100 millones de dólares.",
  },
  {
    id: 11,
    emoji: "🎵",
    category: "Música",
    color: FACT_COLOR.musica,
    title: "Mozart compuso a los 5 años",
    description:
      "Su primera pieza, un minueto para clavecín, la escribió a los 5 años. A los 12 ya había compuesto su primera ópera. Murió a los 35 con más de 600 obras.",
  },
  {
    id: 12,
    emoji: "💻",
    category: "Tecnología",
    color: FACT_COLOR.tecnologia,
    title: "El primer SMS decía 'Merry Christmas'",
    description:
      "Neil Papworth lo envió el 3 de diciembre de 1992 desde un PC a un móvil Orbitel 901. Nadie imaginaba que iniciaría una revolución de mensajería.",
  },
  {
    id: 13,
    emoji: "🗣️",
    category: "Idiomas",
    color: FACT_COLOR.idiomas,
    title: "Existen +7,000 idiomas en el mundo",
    description:
      "Pero el 40% está en peligro de extinción. El papamiento, el silbo gomero y el pirahã son algunos de los más fascinantes del planeta.",
  },
  {
    id: 14,
    emoji: "🐋",
    category: "Océano",
    color: FACT_COLOR.ocean,
    title: "La ballena azul es el animal más grande jamás existente",
    description:
      "Mide hasta 30 m y pesa 180 toneladas. Su corazón es del tamaño de un coche pequeño y su lengua pesa tanto como un elefante.",
  },
  {
    id: 15,
    emoji: "❤️",
    category: "Cuerpo humano",
    color: FACT_COLOR.cuerpo,
    title: "Tus vasos sanguíneos darían 2.5 vueltas a la Tierra",
    description:
      "Puestos en línea miden ~100,000 km. El corazón bombea 7,500 litros de sangre al día a través de esta red, sin parar ni un segundo.",
  },
  {
    id: 16,
    emoji: "💡",
    category: "Inventos",
    color: FACT_COLOR.inventos,
    title: "La bombilla led dura 25,000 horas",
    description:
      "Frente a las 1,200 de una incandescente. El primer LED visible lo creó Nick Holonyak en 1962; hoy iluminan el 60% de los hogares del mundo.",
  },
  {
    id: 17,
    emoji: "📚",
    category: "Literatura",
    color: FACT_COLOR.literatura,
    title: "El Quijote se tradujo a +50 idiomas",
    description:
      "Publicada en 1605, es la segunda obra más traducida de la historia después de la Biblia. Cervantes murió el mismo día que Shakespeare: 23 de abril de 1616.",
  },
  {
    id: 18,
    emoji: "⚡",
    category: "Mitología",
    color: FACT_COLOR.mitologia,
    title: "Zeus no siempre gobernó el Olimpo",
    description:
      "En la mitología griega, derrocó a su padre Crono, quien a su vez había derrocado a Urano. La guerra de los Titanes duró 10 años antes de su victoria.",
  },
  {
    id: 19,
    emoji: "🦋",
    category: "Naturaleza",
    color: FACT_COLOR.mariposas,
    title: "La mariposa monarca viaja 4,500 km",
    description:
      "Cada otoño migra de Canadá a México, pero la hace en 4 generaciones: las que llegan nunca han estado allí, pero saben exactamente dónde ir.",
  },
  {
    id: 20,
    emoji: "🪐",
    category: "Espacio",
    color: FACT_COLOR.espacio,
    title: "Saturno flotaría en agua",
    description:
      "Su densidad es de 0.687 g/cm³, menor que la del agua (1). Si existiera una bañera suficientemente grande, el planeta entero flotaría en su superficie.",
  },
  {
    id: 21,
    emoji: "🏛️",
    category: "Historia",
    color: FACT_COLOR.historia,
    title: "Los romanos usaban orina para lavar ropa",
    description:
      "El amoníaco de la orina era un detergente natural. El emperador Vespasiano incluso cobraba impuestos por la recolección de orina pública.",
  },
  {
    id: 22,
    emoji: "🔬",
    category: "Ciencia",
    color: FACT_COLOR.ciencia,
    title: "El agua puede hervir y congelarse a la vez",
    description:
      "En el 'punto triple' (0.01°C y 611 Pa) el agua existe simultáneamente como sólido, líquido y gas. Es así como se calibran los termómetros exactos.",
  },
  {
    id: 23,
    emoji: "🗽",
    category: "Geografía",
    color: FACT_COLOR.geografia,
    title: "La Estatua de la Libertad fue un regalo francés",
    description:
      "Inaugurada en 1886, fue diseñada por Frédéric Auguste Bartholdi con estructura interna de Gustave Eiffel. Su color verde es por la oxidación natural del cobre.",
  },
  {
    id: 24,
    emoji: "🕹️",
    category: "Videojuegos",
    color: FACT_COLOR.videojuegos,
    title: "Pac-Man tenía nombre japonés",
    description:
      "Se llamaba 'Puck-Man' (por 'paku', comer). En EE.UU. lo cambiaron a Pac-Man para evitar que los graffiteros convirtieran la P en una F en los arcades.",
  },
  {
    id: 25,
    emoji: "⚽",
    category: "Deporte",
    color: FACT_COLOR.deporte,
    title: "El fútbol se juega en 200+ países",
    description:
      "Es el deporte más popular del mundo: más de 250 millones de jugadores activos. La FIFA tiene más federaciones miembro que la ONU tiene países.",
  },
  {
    id: 26,
    emoji: "🐼",
    category: "Naturaleza",
    color: FACT_COLOR.naturaleza,
    title: "El panda pasa 14 horas al día comiendo",
    description:
      "Su dieta es 99% bambú, pero su estómago es de carnívoro. Para nutrirse debe ingerir entre 12 y 38 kg diarios de bambú.",
  },
  {
    id: 27,
    emoji: "🦈",
    category: "Océano",
    color: FACT_COLOR.ocean,
    title: "Los tiburones existían antes que los árboles",
    description:
      "Aparecieron hace 400 millones de años; los árboles aparecieron hace 350 millones. Sobrevivieron a 4 extinciones masivas sin cambiar casi su diseño.",
  },
  {
    id: 28,
    emoji: "👁️",
    category: "Cuerpo humano",
    color: FACT_COLOR.cuerpo,
    title: "El ojo humano distingue 10 millones de colores",
    description:
      "Tenemos ~6 millones de conos (color) y 120 millones de bastones (luz). Las mujeres, en promedio, distinguen más tonos que los hombres.",
  },
  {
    id: 29,
    emoji: "🚀",
    category: "Tecnología",
    color: FACT_COLOR.tecnologia,
    title: "Tu smartphone es millones de veces más potente que el Apollo 11",
    description:
      "El iPhone moderno tiene ~100,000x la memoria y procesadores millones de veces más rápidos. El Apollo 11 llevó al hombre a la Luna con apenas 4 KB de RAM.",
  },
  {
    id: 30,
    emoji: "🌌",
    category: "Espacio",
    color: FACT_COLOR.espacio,
    title: "Hay más estrellas que granos de arena",
    description:
      "El universo observable tiene ~10²⁴ estrellas. Todas las playas de la Tierra suman ~10¹⁹ granos de arena. Por cada grano, hay 100,000 estrellas.",
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
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#131838]/50 border-b border-[#8090C0]/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="text-3xl"
              style={{ filter: "drop-shadow(0 0 14px rgba(0, 229, 255, 0.75))" }}
            >
              🧠
            </motion.div>
            <div>
              <h1 className="text-xl font-fancy italic font-bold tracking-tight text-gradient-neon">Trivials Wars</h1>
              <p className="text-[10px] text-[#8090C0] -mt-1 tracking-widest uppercase">El conocimiento es poder</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AudioToggle compact />
            <button
              onClick={() => setScreen("lootbox")}
              className="relative px-3 py-2 rounded-xl bg-[#1A1F4A]/40 border border-[#FFEA00]/50 text-[#FFEA00] hover:bg-[#FFEA00]/30 transition glow-gold"
              title="Abrir Loot Box"
            >
              <Gift className="w-5 h-5" />
              {profile?.user.boxes ? (
                <span className="absolute -top-1 -right-1 bg-[#FFEA00] text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {profile.user.boxes}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setScreen("profile")}
              className="relative p-1 rounded-xl bg-[#131838]/70 border border-[#8090C0]/60 hover:border-[#00E5FF]/60 transition"
              title="Perfil"
            >
              {profile && frame ? (
                <div className="relative w-10 h-10">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    {frame.render()}
                  </svg>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#00E5FF]/30 to-[#00FFB3]/30 flex items-center justify-center text-base">
                    {profile.user.profileIconEmoji}
                  </div>
                </div>
              ) : (
                <div className="p-2"><User className="w-5 h-5 text-[#8090C0]" /></div>
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
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#00FFB3]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#00FFB3]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                {/* Avatar + marco */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/40 to-[#00FFB3]/40 blur-2xl rounded-full" />
                    <div
                      className="relative w-28 h-28 rounded-full bg-[#131838]/80 border-2 flex items-center justify-center overflow-hidden"
                      style={{ borderColor: frame?.hex ?? "#00E5FF", boxShadow: `0 0 25px ${frame?.hex ?? "#00E5FF"}80` }}
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
                    <div className="text-[10px] uppercase tracking-widest text-[#8090C0] font-bold">Nivel</div>
                    <div className="text-lg font-fancy italic font-bold text-gradient-neon leading-none">{profile?.user.level ?? 1}</div>
                  </div>
                </div>

                {/* Saludo + edición de nombre */}
                <div className="flex-1 space-y-3 min-w-0 w-full">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8090C0] font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> ¡Bienvenido!
                  </div>

                  {!editingName ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-fancy italic font-bold leading-tight">
                        Hola, <span className="text-gradient-neon">{displayName}</span> 👋
                      </h2>
                      <button
                        onClick={startEditName}
                        className="p-2 rounded-xl bg-[#131838]/80 border border-[#8090C0]/60 hover:border-[#00E5FF]/60 transition shrink-0"
                        title="Editar nombre"
                      >
                        <Pencil className="w-4 h-4 text-[#8090C0]" />
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
                        className="px-4 py-3 rounded-xl bg-[#131838]/90 border border-[#8090C0]/60 text-lg font-bold focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-slate-500/40 w-full sm:w-auto sm:min-w-[280px]"
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
                        className="px-4 py-3 rounded-xl bg-[#131838]/80 border border-[#8090C0]/60 hover:bg-[#131838]/90 transition text-sm font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  <p className="text-[#8090C0] text-sm">
                    Cada partida es una nueva oportunidad para aprender algo increíble, ganar XP y subir de nivel.
                  </p>

                  {/* Mini stats en fila */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <MiniStat icon={<Trophy className="w-3.5 h-3.5" />} label="Nivel" value={profile?.user.level ?? 1} color="text-[#FFEA00]" />
                    <MiniStat icon={<Zap className="w-3.5 h-3.5" />} label="XP" value={profile?.user.xp ?? 0} color="text-[#39FF14]" />
                    <MiniStat icon={<Swords className="w-3.5 h-3.5" />} label="Victorias" value={profile?.user.wins ?? 0} color="text-[#00B377]" />
                    <MiniStat icon={<Flame className="w-3.5 h-3.5" />} label="Racha" value={profile?.user.currentStreak ?? 0} color="text-[#FFB300]" />
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
                  color="#00E5FF"
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
                  color="#FFEA00"
                  onClick={() => {
                    useGameStore.getState().setMode("suddendeath")
                    setScreen("home")
                  }}
                />
              </div>
              <p className="text-center text-[11px] text-[#8090C0]">
                Elegí categoría y dificultad · Acumula XP · Sube de nivel · Desbloquea accesorios
              </p>
            </motion.section>
          </div>

          {/* ====== COLUMNA DERECHA — Datos curiosos + Wisdom ====== */}
          <div className="space-y-5">
            {/* Carrusel de datos curiosos — ocupa toda la columna derecha */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#8090C0]/15 border border-[#00E5FF]/30 text-[#8090C0] flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-fancy italic font-semibold text-lg sm:text-xl text-[#C8D0F0]">¿Sabías que…?</h3>
                    <p className="text-xs text-[#8090C0]">Datos curiosos de cultura general</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoPlay((v) => !v)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold border transition",
                    autoPlay
                      ? "bg-[#8090C0]/15 border-[#00E5FF]/30 text-[#8090C0]"
                      : "bg-[#131838]/60 border-[#8090C0]/40 text-[#8090C0]"
                  )}
                >
                  {autoPlay ? "Auto: ON" : "Auto: OFF"}
                </button>
              </div>

              {/* Card principal del dato — layout 2 lados */}
              <div
                className="relative overflow-hidden rounded-3xl border bg-[#131838]/70 backdrop-blur-md"
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
                        <h4 className="text-lg sm:text-xl font-fancy italic font-semibold leading-tight text-[#C8D0F0]">{currentFact.title}</h4>
                        <p className="text-sm text-[#8090C0] leading-relaxed mt-1.5">
                          {currentFact.description}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Controles */}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                      {/* Ventana deslizante de puntos (máx 9 visibles) */}
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const total = FUN_FACTS.length
                          const visible = Math.min(total, 9)
                          const half = Math.floor(visible / 2)
                          let start = Math.max(0, factIdx - half)
                          const end = Math.min(total, start + visible)
                          if (end - start < visible) start = Math.max(0, end - visible)
                          const dots: React.ReactNode[] = []
                          if (start > 0) {
                            dots.push(
                              <button
                                key="first"
                                onClick={() => setFactIdx(0)}
                                className="h-1.5 w-1.5 rounded-full bg-[#8090C0]/40 hover:bg-[#8090C0] transition"
                                aria-label="Ir al primer dato"
                              />
                            )
                            dots.push(
                              <span key="ellipsis1" className="text-[10px] text-[#8090C0] leading-none -mt-0.5">…</span>
                            )
                          }
                          for (let i = start; i < end; i++) {
                            const isCurrent = i === factIdx
                            dots.push(
                              <button
                                key={FUN_FACTS[i].id}
                                onClick={() => setFactIdx(i)}
                                className={cn(
                                  "h-1.5 rounded-full transition-all",
                                  isCurrent
                                    ? "w-6 bg-[#00E5FF]"
                                    : "w-1.5 bg-[#8090C0]/40 hover:bg-[#8090C0]"
                                )}
                                aria-label={`Ir al dato ${i + 1}`}
                                aria-current={isCurrent ? "true" : undefined}
                              />
                            )
                          }
                          if (end < total) {
                            dots.push(
                              <span key="ellipsis2" className="text-[10px] text-[#8090C0] leading-none -mt-0.5">…</span>
                            )
                            dots.push(
                              <button
                                key="last"
                                onClick={() => setFactIdx(total - 1)}
                                className="h-1.5 w-1.5 rounded-full bg-[#8090C0]/40 hover:bg-[#8090C0] transition"
                                aria-label="Ir al último dato"
                              />
                            )
                          }
                          return dots
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={goPrev}
                          className="p-2 rounded-xl bg-[#131838]/80 border border-[#8090C0]/60 hover:border-[#00E5FF]/60 hover:bg-[#131838] transition"
                          aria-label="Dato anterior"
                        >
                          <ChevronLeft className="w-4 h-4 text-[#8090C0]" />
                        </button>
                        <span className="text-xs font-mono text-[#8090C0] tabular-nums">
                          {factIdx + 1} / {FUN_FACTS.length}
                        </span>
                        <button
                          onClick={goNext}
                          className="p-2 rounded-xl bg-[#131838]/80 border border-[#8090C0]/60 hover:border-[#00E5FF]/60 hover:bg-[#131838] transition"
                          aria-label="Dato siguiente"
                        >
                          <ChevronRight className="w-4 h-4 text-[#8090C0]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        {/* ============================================================
            CÁPSULAS DE SABIDURÍA — Bloque ancho abajo, bien organizado
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5 lg:mt-6"
        >
          <WisdomCapsule />
        </motion.section>
      </main>

      <footer className="relative z-10 mt-auto text-center text-xs text-[#8090C0] py-4">
        Trivials Wars · {profile?.user.provider === "google" ? "Cuenta Google" : "Modo Invitado"}
      </footer>
    </div>
  )
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#131838]/70 border border-[#8090C0]/40">
      <span className={color}>{icon}</span>
      <span className="text-[9px] uppercase text-[#8090C0] tracking-wider">{label}</span>
      <span className="text-xs font-bold text-[#F0F4FF]">{value}</span>
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
      className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border bg-[#131838]/70 transition hover:scale-[1.03] active:scale-[0.98]"
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
