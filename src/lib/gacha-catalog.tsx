// Catálogo de items para el sistema Gacha (v2 - con SVG)
// Cada item tiene: id, name, type, rarity, y un renderer SVG

import type { ReactNode } from "react"

export type Rarity = "Comun" | "Inusual" | "Raro" | "Epico" | "Legendario"
export type ItemType = "hat" | "top" | "aura"

export interface GachaItem {
  id: string
  name: string
  type: ItemType
  rarity: Rarity
  description: string
  /** Render SVG del item, en coordenadas locales 0..200 (avatar canvas) */
  render: (props: { skinTone: string }) => ReactNode
}

export const RARITY_CONFIG: Record<Rarity, {
  probability: number
  color: string // tailwind classes
  hex: string
  glow: string
  label: string
  particle: string
  gradient: string
}> = {
  Comun: {
    probability: 0.55,
    color: "border-zinc-400 text-zinc-200 bg-zinc-700/30",
    hex: "#a1a1aa",
    glow: "glow-cyan",
    label: "Común",
    particle: "none",
    gradient: "from-zinc-600 to-zinc-800",
  },
  Inusual: {
    probability: 0.25,
    color: "border-[#39FF14]/60 text-green-200 bg-green-700/20",
    hex: "#22c55e",
    glow: "glow-green",
    label: "Inusual",
    particle: "none",
    gradient: "from-green-500 to-emerald-700",
  },
  Raro: {
    probability: 0.12,
    color: "border-[#00E5FF]/60 text-cyan-200 bg-cyan-700/20",
    hex: "#06b6d4",
    glow: "glow-cyan",
    label: "Raro",
    particle: "sparkle",
    gradient: "from-cyan-500 to-blue-700",
  },
  Epico: {
    probability: 0.06,
    color: "border-fuchsia-400 text-fuchsia-200 bg-fuchsia-700/20",
    hex: "#d946ef",
    glow: "glow-magenta",
    label: "Épico",
    particle: "aura",
    gradient: "from-fuchsia-500 to-purple-700",
  },
  Legendario: {
    probability: 0.02,
    color: "border-[#FFEA00]/60 text-[#FFEA00] bg-[#FFEA00]/20",
    hex: "#ffd60a",
    glow: "glow-gold",
    label: "Legendario",
    particle: "explosion",
    gradient: "from-amber-300 via-orange-500 to-red-600",
  },
}

// Helper para crear paths SVG
const P = (d: string) => <path d={d} />

// ===== AVATAR BASES (cuerpos) =====
export interface AvatarBase {
  id: string
  name: string
  description: string
  /** Render del cuerpo completo en coords 0..200 */
  render: (props: { skinTone: string }) => ReactNode
}

export const AVATAR_BASES: AvatarBase[] = [
  {
    id: "warrior",
    name: "Guerrero",
    description: "Cuerpo robusto y resistente",
    render: ({ skinTone }) => (
      <>
        {/* Cuerpo / armadura */}
        <path d="M 60 130 Q 60 110 100 105 Q 140 110 140 130 L 145 180 Q 145 188 137 188 L 63 188 Q 55 188 55 180 Z" fill="#3a0a0e" stroke="#ff2d2d" strokeWidth="1.5" />
        {/* Detalle armadura pecho */}
        <path d="M 75 130 L 100 145 L 125 130" fill="none" stroke="#ff8a00" strokeWidth="2" />
        <circle cx="100" cy="155" r="4" fill="#ffd60a" />
        {/* Cuello */}
        <rect x="92" y="95" width="16" height="14" fill={skinTone} />
        {/* Cabeza */}
        <circle cx="100" cy="80" r="22" fill={skinTone} stroke="#00000030" strokeWidth="0.5" />
        {/* Ojos */}
        <ellipse cx="92" cy="80" rx="2.5" ry="3" fill="#1a0608" />
        <ellipse cx="108" cy="80" rx="2.5" ry="3" fill="#1a0608" />
        {/* Cejas determinadas */}
        <path d="M 86 73 L 96 75" stroke="#1a0608" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 104 75 L 114 73" stroke="#1a0608" strokeWidth="1.8" strokeLinecap="round" />
        {/* Boca */}
        <path d="M 92 90 Q 100 94 108 90" stroke="#1a0608" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Brazos */}
        <rect x="40" y="130" width="18" height="48" rx="6" fill="#3a0a0e" stroke="#ff2d2d" strokeWidth="1" />
        <rect x="142" y="130" width="18" height="48" rx="6" fill="#3a0a0e" stroke="#ff2d2d" strokeWidth="1" />
        {/* Manos */}
        <circle cx="49" cy="180" r="7" fill={skinTone} />
        <circle cx="151" cy="180" r="7" fill={skinTone} />
      </>
    ),
  },
  {
    id: "mage",
    name: "Mago",
    description: "Túnica larga y mística",
    render: ({ skinTone }) => (
      <>
        {/* Túnica */}
        <path d="M 50 130 Q 60 110 100 105 Q 140 110 150 130 L 165 195 L 35 195 Z" fill="#1a0a2a" stroke="#a855f7" strokeWidth="1.5" />
        {/* Estrellas en túnica */}
        <text x="70" y="155" fill="#ffd60a" fontSize="10">✦</text>
        <text x="120" y="170" fill="#ffd60a" fontSize="8">✦</text>
        <text x="90" y="180" fill="#a855f7" fontSize="9">✧</text>
        {/* Cuello */}
        <rect x="92" y="95" width="16" height="14" fill={skinTone} />
        {/* Cabeza */}
        <circle cx="100" cy="80" r="22" fill={skinTone} stroke="#00000030" strokeWidth="0.5" />
        {/* Barba */}
        <path d="M 88 88 Q 100 110 112 88 L 108 96 Q 100 100 92 96 Z" fill="#e5e5e5" />
        {/* Ojos */}
        <ellipse cx="92" cy="78" rx="2.5" ry="3" fill="#1a0608" />
        <ellipse cx="108" cy="78" rx="2.5" ry="3" fill="#1a0608" />
        {/* Boca */}
        <path d="M 95 90 Q 100 92 105 90" stroke="#1a0608" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Brazos */}
        <path d="M 50 130 Q 35 160 38 180" stroke="#1a0a2a" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M 150 130 Q 165 160 162 180" stroke="#1a0a2a" strokeWidth="14" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "archer",
    name: "Arquero",
    description: "Ágil y veloz",
    render: ({ skinTone }) => (
      <>
        {/* Capa */}
        <path d="M 60 110 L 30 180 L 50 185 L 60 130 Z" fill="#0d3a0d" stroke="#22c55e" strokeWidth="1" />
        <path d="M 140 110 L 170 180 L 150 185 L 140 130 Z" fill="#0d3a0d" stroke="#22c55e" strokeWidth="1" />
        {/* Cuerpo */}
        <path d="M 65 130 Q 65 115 100 110 Q 135 115 135 130 L 140 185 L 60 185 Z" fill="#1a3a1a" stroke="#22c55e" strokeWidth="1.5" />
        {/* Capucha abierta */}
        <path d="M 75 100 Q 100 88 125 100 L 122 110 Q 100 100 78 110 Z" fill="#0d3a0d" stroke="#22c55e" strokeWidth="1" />
        {/* Cuello */}
        <rect x="92" y="98" width="16" height="14" fill={skinTone} />
        {/* Cabeza */}
        <circle cx="100" cy="83" r="20" fill={skinTone} stroke="#00000030" strokeWidth="0.5" />
        {/* Ojos */}
        <ellipse cx="93" cy="82" rx="2.5" ry="3" fill="#1a0608" />
        <ellipse cx="107" cy="82" rx="2.5" ry="3" fill="#1a0608" />
        {/* Cejas concentradas */}
        <path d="M 88 76 L 98 78" stroke="#1a0608" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 102 78 L 112 76" stroke="#1a0608" strokeWidth="1.8" strokeLinecap="round" />
        {/* Boca seria */}
        <line x1="93" y1="92" x2="107" y2="92" stroke="#1a0608" strokeWidth="1.5" strokeLinecap="round" />
        {/* Brazos */}
        <rect x="42" y="125" width="16" height="48" rx="6" fill="#1a3a1a" stroke="#22c55e" strokeWidth="1" />
        <rect x="142" y="125" width="16" height="48" rx="6" fill="#1a3a1a" stroke="#22c55e" strokeWidth="1" />
      </>
    ),
  },
]

// Metadata serializable de avatar bases (sin JSX, para uso en cualquier contexto)
export const AVATAR_BASES_INFO = AVATAR_BASES.map((b) => ({
  id: b.id,
  name: b.name,
  description: b.description,
}))

// ===== HATS (sombreros) =====
const HAT_ITEMS: GachaItem[] = [
  // Comunes
  {
    id: "hat_cap_red",
    name: "Gorra Roja",
    type: "hat",
    rarity: "Comun",
    description: "Gorra básica roja, clásica y cómoda.",
    render: () => (
      <g>
        <path d="M 75 60 Q 100 40 125 60 L 130 65 L 70 65 Z" fill="#ff2d2d" stroke="#8a0000" strokeWidth="1" />
        <path d="M 70 65 L 130 65 L 130 68 L 70 68 Z" fill="#8a0000" />
        <circle cx="100" cy="52" r="3" fill="#ffd60a" />
      </g>
    ),
  },
  {
    id: "hat_beanie_dark",
    name: "Gorro Oscuro",
    type: "hat",
    rarity: "Comun",
    description: "Gorro de lana para los días fríos.",
    render: () => (
      <g>
        <path d="M 76 65 Q 76 42 100 42 Q 124 42 124 65 Z" fill="#1a0e11" stroke="#ff8a00" strokeWidth="1.5" />
        <line x1="80" y1="62" x2="120" y2="62" stroke="#ff8a00" strokeWidth="1.2" />
        <circle cx="100" cy="40" r="4" fill="#ff8a00" />
      </g>
    ),
  },
  // Inusuales
  {
    id: "hat_sunglasses",
    name: "Gafas de Sol",
    type: "hat",
    rarity: "Inusual",
    description: "Estilo en su máxima expresión.",
    render: () => (
      <g>
        <rect x="80" y="76" width="16" height="8" rx="2" fill="#0a0608" stroke="#22c55e" strokeWidth="1" />
        <rect x="104" y="76" width="16" height="8" rx="2" fill="#0a0608" stroke="#22c55e" strokeWidth="1" />
        <line x1="96" y1="80" x2="104" y2="80" stroke="#22c55e" strokeWidth="1.5" />
        <line x1="80" y1="80" x2="74" y2="78" stroke="#22c55e" strokeWidth="1.5" />
        <line x1="120" y1="80" x2="126" y2="78" stroke="#22c55e" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    id: "hat_headphones",
    name: "Auriculares",
    type: "hat",
    rarity: "Inusual",
    description: "Siempre con música, siempre en ritmo.",
    render: () => (
      <g>
        <path d="M 72 70 Q 72 42 100 42 Q 128 42 128 70" fill="none" stroke="#22c55e" strokeWidth="3" />
        <rect x="66" y="68" width="12" height="18" rx="4" fill="#0a3a0a" stroke="#22c55e" strokeWidth="1.5" />
        <rect x="122" y="68" width="12" height="18" rx="4" fill="#0a3a0a" stroke="#22c55e" strokeWidth="1.5" />
        <circle cx="72" cy="77" r="2" fill="#22c55e" />
        <circle cx="128" cy="77" r="2" fill="#22c55e" />
      </g>
    ),
  },
  // Raros
  {
    id: "hat_top_hat",
    name: "Sombrero de Copa",
    type: "hat",
    rarity: "Raro",
    description: "Elegancia histórica para verdaderos caballeros.",
    render: () => (
      <g>
        <rect x="78" y="30" width="44" height="35" fill="#0a0608" stroke="#06b6d4" strokeWidth="1.5" />
        <ellipse cx="100" cy="65" rx="32" ry="5" fill="#0a0608" stroke="#06b6d4" strokeWidth="1.5" />
        <rect x="78" y="55" width="44" height="4" fill="#06b6d4" />
        <circle cx="100" cy="42" r="3" fill="#06b6d4" />
      </g>
    ),
  },
  {
    id: "hat_crown_simple",
    name: "Corona Antigua",
    type: "hat",
    rarity: "Raro",
    description: "Para verdaderos reyes del conocimiento.",
    render: () => (
      <g>
        <path d="M 72 60 L 78 38 L 88 55 L 100 35 L 112 55 L 122 38 L 128 60 Z" fill="#ffd60a" stroke="#06b6d4" strokeWidth="1.5" />
        <rect x="72" y="60" width="56" height="6" fill="#ffd60a" stroke="#06b6d4" strokeWidth="1.5" />
        <circle cx="100" cy="48" r="2" fill="#ff2d2d" />
        <circle cx="84" cy="52" r="1.5" fill="#06b6d4" />
        <circle cx="116" cy="52" r="1.5" fill="#06b6d4" />
      </g>
    ),
  },
  // Épicos
  {
    id: "hat_wizard",
    name: "Sombrero de Mago",
    type: "hat",
    rarity: "Epico",
    description: "Poder arcano encarnado en tela púrpura.",
    render: () => (
      <g>
        <path d="M 70 65 L 100 10 L 130 65 Z" fill="#1a0a2a" stroke="#d946ef" strokeWidth="2" />
        <rect x="68" y="63" width="64" height="6" fill="#d946ef" />
        <text x="92" y="55" fill="#ffd60a" fontSize="14">★</text>
        <text x="98" y="40" fill="#d946ef" fontSize="8">✦</text>
        <circle cx="100" cy="14" r="3" fill="#ffd60a" />
      </g>
    ),
  },
  {
    id: "hat_helmet",
    name: "Casco Espacial",
    type: "hat",
    rarity: "Epico",
    description: "Para conquistar galaxias enteras.",
    render: () => (
      <g>
        <path d="M 75 70 Q 75 35 100 35 Q 125 35 125 70 Z" fill="#d946ef" opacity="0.3" stroke="#d946ef" strokeWidth="2" />
        <rect x="78" y="55" width="44" height="8" rx="2" fill="#d946ef" opacity="0.6" />
        <line x1="80" y1="78" x2="120" y2="78" stroke="#d946ef" strokeWidth="1.5" />
        <circle cx="100" cy="40" r="2" fill="#ffd60a" />
      </g>
    ),
  },
  // Legendarios
  {
    id: "hat_phoenix_crown",
    name: "Corona del Fénix",
    type: "hat",
    rarity: "Legendario",
    description: "Renace de las cenizas, ardiente y eterna.",
    render: () => (
      <g>
        <path d="M 60 65 Q 70 20 100 15 Q 130 20 140 65 Z" fill="url(#phoenixGrad)" stroke="#ffd60a" strokeWidth="2" />
        <path d="M 75 60 L 70 30 L 82 50 L 100 18 L 118 50 L 130 30 L 125 60 Z" fill="#ff8a00" stroke="#ffd60a" strokeWidth="1" />
        <circle cx="100" cy="40" r="4" fill="#ffd60a" />
        <path d="M 90 35 L 100 25 L 110 35" stroke="#ffd60a" strokeWidth="1.5" fill="none" />
        <defs>
          <linearGradient id="phoenixGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd60a" />
            <stop offset="50%" stopColor="#ff8a00" />
            <stop offset="100%" stopColor="#ff2d2d" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
]

// ===== TOPS (ropa superior) =====
const TOP_ITEMS: GachaItem[] = [
  // Comunes
  {
    id: "top_tshirt_red",
    name: "Camiseta Roja",
    type: "top",
    rarity: "Comun",
    description: "Llamativa y atrevida, lista para la batalla.",
    render: () => (
      <g>
        <path d="M 60 130 Q 60 115 100 110 Q 140 115 140 130 L 145 188 L 55 188 Z" fill="#ff2d2d" opacity="0.85" stroke="#8a0000" strokeWidth="1.5" />
        <text x="90" y="155" fill="#ffd60a" fontSize="14" fontWeight="bold">★</text>
      </g>
    ),
  },
  {
    id: "top_tshirt_white",
    name: "Camiseta Blanca",
    type: "top",
    rarity: "Comun",
    description: "Clásica, versátil y limpia.",
    render: () => (
      <g>
        <path d="M 60 130 Q 60 115 100 110 Q 140 115 140 130 L 145 188 L 55 188 Z" fill="#f4f4f4" opacity="0.85" stroke="#a1a1aa" strokeWidth="1.5" />
      </g>
    ),
  },
  // Inusuales
  {
    id: "top_jersey",
    name: "Camiseta Deportiva",
    type: "top",
    rarity: "Inusual",
    description: "Para entrenar y competir con estilo.",
    render: () => (
      <g>
        <path d="M 60 130 Q 60 115 100 110 Q 140 115 140 130 L 145 188 L 55 188 Z" fill="#22c55e" opacity="0.9" stroke="#0a3a0a" strokeWidth="1.5" />
        <rect x="55" y="145" width="90" height="3" fill="#fff5e6" />
        <text x="88" y="170" fill="#fff5e6" fontSize="14" fontWeight="bold">07</text>
      </g>
    ),
  },
  // Raros
  {
    id: "top_scientist_coat",
    name: "Bata de Científico",
    type: "top",
    rarity: "Raro",
    description: "Pura curiosidad científica en estado puro.",
    render: () => (
      <g>
        <path d="M 60 130 Q 60 115 100 110 Q 140 115 140 130 L 150 195 L 50 195 Z" fill="#fff5e6" opacity="0.92" stroke="#06b6d4" strokeWidth="1.5" />
        <line x1="100" y1="115" x2="100" y2="190" stroke="#06b6d4" strokeWidth="1.5" />
        <rect x="62" y="125" width="22" height="14" fill="none" stroke="#06b6d4" strokeWidth="1" />
        <circle cx="100" cy="140" r="2" fill="#06b6d4" />
        <text x="65" y="135" fontSize="6" fill="#06b6d4">SCI</text>
      </g>
    ),
  },
  {
    id: "top_historic_robe",
    name: "Túnica Histórica",
    type: "top",
    rarity: "Raro",
    description: "Sabiduría de épocas pasadas, tejida en oro.",
    render: () => (
      <g>
        <path d="M 55 130 Q 60 115 100 110 Q 140 115 145 130 L 160 195 L 40 195 Z" fill="#5a3a0a" opacity="0.95" stroke="#ffd60a" strokeWidth="1.5" />
        <path d="M 50 145 L 150 145" stroke="#ffd60a" strokeWidth="1.5" />
        <path d="M 45 165 L 155 165" stroke="#ffd60a" strokeWidth="1" />
        <text x="92" y="180" fill="#ffd60a" fontSize="10">⚜</text>
      </g>
    ),
  },
  // Épicos
  {
    id: "top_armor",
    name: "Armadura Épica",
    type: "top",
    rarity: "Epico",
    description: "Protección absoluta con placas rúnicas.",
    render: () => (
      <g>
        <path d="M 60 130 Q 60 115 100 110 Q 140 115 140 130 L 145 188 L 55 188 Z" fill="#1a0a2a" stroke="#d946ef" strokeWidth="2" />
        {/* Placas */}
        <path d="M 65 130 L 75 145 L 65 160 L 75 175" stroke="#d946ef" strokeWidth="1.5" fill="none" />
        <path d="M 135 130 L 125 145 L 135 160 L 125 175" stroke="#d946ef" strokeWidth="1.5" fill="none" />
        {/* Pecho central */}
        <path d="M 80 130 L 100 145 L 120 130 L 120 175 L 100 185 L 80 175 Z" fill="#2a1a4a" stroke="#d946ef" strokeWidth="1.5" />
        <text x="93" y="165" fontSize="14" fill="#ffd60a">⚡</text>
      </g>
    ),
  },
  // Legendarios
  {
    id: "top_dragon_armor",
    name: "Armadura del Dragón",
    type: "top",
    rarity: "Legendario",
    description: "Escamas de mil batallas, forjadas en fuego eterno.",
    render: () => (
      <g>
        <path d="M 60 130 Q 60 115 100 110 Q 140 115 140 130 L 145 188 L 55 188 Z" fill="url(#dragonGrad)" stroke="#ffd60a" strokeWidth="2" />
        {/* Escamas */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <path
              key={`${row}-${col}`}
              d={`M ${70 + col * 14} ${140 + row * 14} q 7 -5 14 0 q 7 5 0 10 q -7 5 -14 0 q -7 -5 0 -10 Z`}
              fill="#ff8a00"
              opacity="0.5"
              stroke="#ffd60a"
              strokeWidth="0.5"
            />
          ))
        )}
        {/* Pecho */}
        <path d="M 85 140 L 100 130 L 115 140 L 115 175 L 100 185 L 85 175 Z" fill="#1a0608" stroke="#ffd60a" strokeWidth="1.5" />
        <text x="93" y="167" fontSize="14" fill="#ffd60a">🐲</text>
        <defs>
          <linearGradient id="dragonGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8a00" />
            <stop offset="100%" stopColor="#8a0000" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
]

// ===== AURAS =====
const AURA_ITEMS: GachaItem[] = [
  // Común
  {
    id: "aura_none",
    name: "Sin Aura",
    type: "aura",
    rarity: "Comun",
    description: "Aún no desbloqueas auras. Sigue jugando.",
    render: () => null,
  },
  // Inusual
  {
    id: "aura_leaf",
    name: "Hojas Verdes",
    type: "aura",
    rarity: "Inusual",
    description: "Conexión natural con el entorno.",
    render: () => (
      <g opacity="0.6">
        <circle cx="100" cy="100" r="95" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 6" />
        <text x="20" y="50" fontSize="14" fill="#22c55e">🍃</text>
        <text x="170" y="50" fontSize="14" fill="#22c55e">🍃</text>
        <text x="20" y="160" fontSize="14" fill="#22c55e">🍃</text>
        <text x="170" y="160" fontSize="14" fill="#22c55e">🍃</text>
      </g>
    ),
  },
  // Raro
  {
    id: "aura_flame",
    name: "Llama Azul",
    type: "aura",
    rarity: "Raro",
    description: "Fuego intelectual que envuelve el avatar.",
    render: () => (
      <g opacity="0.7">
        <circle cx="100" cy="100" r="92" fill="none" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 4" />
      </g>
    ),
  },
  // Épico
  {
    id: "aura_electric",
    name: "Tormenta Eléctrica",
    type: "aura",
    rarity: "Epico",
    description: "Energía que rodea el avatar en chispas.",
    render: () => (
      <g opacity="0.8">
        <circle cx="100" cy="100" r="95" fill="none" stroke="#d946ef" strokeWidth="3" strokeDasharray="6 3" />
        <path d="M 100 5 L 95 15 L 105 15 L 100 25" stroke="#d946ef" strokeWidth="2" fill="none" />
        <path d="M 100 195 L 95 185 L 105 185 L 100 175" stroke="#d946ef" strokeWidth="2" fill="none" />
        <path d="M 5 100 L 15 95 L 15 105 L 25 100" stroke="#d946ef" strokeWidth="2" fill="none" />
        <path d="M 195 100 L 185 95 L 185 105 L 175 100" stroke="#d946ef" strokeWidth="2" fill="none" />
      </g>
    ),
  },
  // Legendario
  {
    id: "aura_cosmic",
    name: "Aura Cósmica",
    type: "aura",
    rarity: "Legendario",
    description: "El universo entero te acompaña en cada partida.",
    render: () => (
      <g opacity="0.85">
        <circle cx="100" cy="100" r="98" fill="url(#cosmicGrad)" opacity="0.3" />
        <circle cx="100" cy="100" r="95" fill="none" stroke="#ffd60a" strokeWidth="2" />
        <circle cx="100" cy="100" r="92" fill="none" stroke="#ff8a00" strokeWidth="1" strokeDasharray="3 5" />
        {/* Estrellas */}
        {[
          [30, 30], [170, 30], [30, 170], [170, 170],
          [100, 15], [100, 185], [15, 100], [185, 100],
        ].map(([x, y], i) => (
          <text key={i} x={x - 5} y={y + 5} fontSize="10" fill="#ffd60a">✦</text>
        ))}
        <defs>
          <radialGradient id="cosmicGrad">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="#ffd60a" />
          </radialGradient>
        </defs>
      </g>
    ),
  },
]

export const GACHA_ITEMS: GachaItem[] = [...HAT_ITEMS, ...TOP_ITEMS, ...AURA_ITEMS]

export const ITEMS_BY_ID: Record<string, GachaItem> = Object.fromEntries(
  GACHA_ITEMS.map((item) => [item.id, item])
)

export function getItemsByRarity(rarity: Rarity): GachaItem[] {
  return GACHA_ITEMS.filter((i) => i.rarity === rarity)
}
