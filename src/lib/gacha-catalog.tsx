// Catálogo de items para el sistema Gacha (v4 - con armas mágicas)
// Cada item tiene: id, name, type, rarity, y un renderer SVG

import type { ReactNode } from "react"

export type Rarity = "Comun" | "Normal" | "Raro" | "Epico" | "Legendario"
export type ItemType = "hat" | "top" | "aura" | "weapon"

export interface GachaItem {
  id: string
  name: string
  type: ItemType
  rarity: Rarity
  description: string
  /** Texto de lore reservado para futura expansión narrativa (spec v4.0). */
  lorePlaceholder?: string
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
    probability: 0.50,
    color: "border-zinc-400 text-zinc-200 bg-zinc-700/30",
    hex: "#a1a1aa",
    glow: "glow-cyan",
    label: "Común",
    particle: "none",
    gradient: "from-zinc-600 to-zinc-800",
  },
  Normal: {
    probability: 0.30,
    color: "border-[#39FF14]/60 text-green-200 bg-green-700/20",
    hex: "#22c55e",
    glow: "glow-green",
    label: "Normal",
    particle: "none",
    gradient: "from-green-500 to-emerald-700",
  },
  Raro: {
    probability: 0.13,
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
    hex: "#a855f7",
    glow: "glow-magenta",
    label: "Épico",
    particle: "aura",
    gradient: "from-fuchsia-500 to-purple-700",
  },
  Legendario: {
    probability: 0.01,
    color: "border-[#FFEA00]/60 text-[#FFEA00] bg-[#FFEA00]/20",
    hex: "#f59e0b",
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
        <text x="70" y="155" fill="#ffd60a" fontSize="10"></text>
        <text x="120" y="170" fill="#ffd60a" fontSize="8"></text>
        <text x="90" y="180" fill="#a855f7" fontSize="9"></text>
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
  // Normales (renombrado de Inusual según spec v4.0)
  {
    id: "hat_sunglasses",
    name: "Gafas de Sol",
    type: "hat",
    rarity: "Normal",
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
    rarity: "Normal",
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
        <text x="92" y="55" fill="#ffd60a" fontSize="14"></text>
        <text x="98" y="40" fill="#d946ef" fontSize="8"></text>
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
        <text x="90" y="155" fill="#ffd60a" fontSize="14" fontWeight="bold"></text>
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
  // Normales
  {
    id: "top_jersey",
    name: "Camiseta Deportiva",
    type: "top",
    rarity: "Normal",
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
        <text x="92" y="180" fill="#ffd60a" fontSize="10"></text>
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
        <text x="93" y="165" fontSize="14" fill="#ffd60a"></text>
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
        <text x="93" y="167" fontSize="14" fill="#ffd60a"></text>
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
  // Normal
  {
    id: "aura_leaf",
    name: "Hojas Verdes",
    type: "aura",
    rarity: "Normal",
    description: "Conexión natural con el entorno.",
    render: () => (
      <g opacity="0.6">
        <circle cx="100" cy="100" r="95" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 6" />
        <text x="20" y="50" fontSize="14" fill="#22c55e"></text>
        <text x="170" y="50" fontSize="14" fill="#22c55e"></text>
        <text x="20" y="160" fontSize="14" fill="#22c55e"></text>
        <text x="170" y="160" fontSize="14" fill="#22c55e"></text>
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
          <text key={i} x={x - 5} y={y + 5} fontSize="10" fill="#ffd60a"></text>
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

// ===== WEAPONS (armas mágicas — spec v4.0) =====
// 10 armas: 2 por rareza. SVG rico con gradientes, runas y detalles.
// Todas se renderizan en la mano derecha del avatar (alrededor de x=151, y=180).
const WEAPON_ITEMS: GachaItem[] = [
  // ----- COMUNES (2) -----
  {
    id: "weapon_oak_staff",
    name: "Palo de Roble",
    type: "weapon",
    rarity: "Comun",
    description: "Un simple bastón de roble tallado a mano. Resistente y confiable.",
    lorePlaceholder: "Forjado por los leñadores del Valle Antiguo.",
    render: () => (
      <g>
        {/* Mango de madera */}
        <line x1="151" y1="180" x2="172" y2="105" stroke="#6b3410" strokeWidth="5" strokeLinecap="round" />
        <line x1="151" y1="180" x2="172" y2="105" stroke="#8b4513" strokeWidth="3" strokeLinecap="round" />
        {/* Nudos de la madera */}
        <circle cx="160" cy="155" r="1.5" fill="#4a2208" />
        <circle cx="166" cy="135" r="1.2" fill="#4a2208" />
        <circle cx="170" cy="118" r="1" fill="#4a2208" />
        {/* Punta desgastada */}
        <circle cx="172" cy="105" r="3" fill="#4a2208" stroke="#6b3410" strokeWidth="1" />
        {/* Sombra */}
        <line x1="155" y1="180" x2="175" y2="108" stroke="#00000020" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
      </g>
    ),
  },
  {
    id: "weapon_rusty_dagger",
    name: "Daga Oxidada",
    type: "weapon",
    rarity: "Comun",
    description: "Una daga corta con la hoja oxidada. Aún corta, pero apenas.",
    lorePlaceholder: "Herramienta de cazadores furtivos olvidados.",
    render: () => (
      <g>
        {/* Hoja oxidada */}
        <path d="M 151 175 L 168 140 L 172 142 L 155 177 Z" fill="#8a7a5a" stroke="#5a4a2a" strokeWidth="0.8" />
        {/* Mancha de óxido */}
        <ellipse cx="162" cy="160" rx="3" ry="2" fill="#a05a2a" opacity="0.5" />
        <ellipse cx="165" cy="155" rx="2" ry="1.5" fill="#7a3a1a" opacity="0.4" />
        {/* Guarda */}
        <rect x="148" y="174" width="10" height="3" rx="1" fill="#3a2a1a" />
        {/* Mango de cuero */}
        <rect x="149" y="177" width="7" height="12" rx="1.5" fill="#4a2a0a" />
        {/* Detalles del envoltorio de cuero */}
        <line x1="149" y1="180" x2="156" y2="180" stroke="#2a1a05" strokeWidth="0.6" />
        <line x1="149" y1="183" x2="156" y2="183" stroke="#2a1a05" strokeWidth="0.6" />
        <line x1="149" y1="186" x2="156" y2="186" stroke="#2a1a05" strokeWidth="0.6" />
        {/* Pomo */}
        <circle cx="152" cy="191" r="2.5" fill="#5a3a1a" stroke="#2a1a05" strokeWidth="0.8" />
      </g>
    ),
  },
  // ----- NORMALES (2) -----
  {
    id: "weapon_steel_sword",
    name: "Espada Corta de Acero",
    type: "weapon",
    rarity: "Normal",
    description: "Espada de acero pulido con brillo verdoso tenue. Equilibrada y letal.",
    lorePlaceholder: "Acero forjado en las herrerías de Bronce.",
    render: () => (
      <g>
        {/* Hoja de acero con degradado */}
        <defs>
          <linearGradient id="steelBladeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="50%" stopColor="#c0c0c0" />
            <stop offset="100%" stopColor="#7a7a7a" />
          </linearGradient>
        </defs>
        <path d="M 152 175 L 180 100 L 184 102 L 156 177 Z" fill="url(#steelBladeGrad)" stroke="#3a3a3a" strokeWidth="0.8" />
        {/* Filo brillante */}
        <line x1="153" y1="174" x2="181" y2="101" stroke="#e0e0e0" strokeWidth="0.6" />
        {/* Brillo verdoso tenue */}
        <line x1="155" y1="170" x2="178" y2="108" stroke="#22c55e" strokeWidth="0.8" opacity="0.3" />
        {/* Guarda */}
        <rect x="146" y="173" width="14" height="3.5" rx="1" fill="#5a4a2a" stroke="#3a2a1a" strokeWidth="0.6" />
        {/* Mango de cuero trenzado */}
        <rect x="148" y="177" width="9" height="13" rx="1.5" fill="#3a2a1a" />
        <line x1="148" y1="180" x2="157" y2="180" stroke="#1a0a05" strokeWidth="0.5" />
        <line x1="148" y1="183" x2="157" y2="183" stroke="#1a0a05" strokeWidth="0.5" />
        <line x1="148" y1="186" x2="157" y2="186" stroke="#1a0a05" strokeWidth="0.5" />
        {/* Pomo metálico */}
        <circle cx="152" cy="192" r="3" fill="#5a4a2a" stroke="#3a2a1a" strokeWidth="0.8" />
        <circle cx="151" cy="191" r="1" fill="#8a6a4a" />
      </g>
    ),
  },
  {
    id: "weapon_hunter_spear",
    name: "Lanza de Cazador",
    type: "weapon",
    rarity: "Normal",
    description: "Lanza larga de madera con punta de bronce. Alcance y precisión.",
    lorePlaceholder: "Arma favorita de los cazadores de las llanuras.",
    render: () => (
      <g>
        {/* Mango largo */}
        <line x1="151" y1="185" x2="178" y2="95" stroke="#5a3a1a" strokeWidth="4" strokeLinecap="round" />
        <line x1="151" y1="185" x2="178" y2="95" stroke="#7a5a2a" strokeWidth="2.5" strokeLinecap="round" />
        {/* Envoltura de cuero en el mango */}
        <rect x="156" y="155" width="3" height="14" fill="#3a2a0a" opacity="0.6" transform="rotate(-72 156 155)" />
        {/* Punta de bronce */}
        <path d="M 175 100 L 184 88 L 182 102 Z" fill="#b87333" stroke="#7a4a1a" strokeWidth="0.8" />
        {/* Brillo del bronce */}
        <path d="M 177 96 L 181 92" stroke="#e0a050" strokeWidth="0.8" />
        {/* Conecctor mango-punta */}
        <rect x="174" y="98" width="6" height="4" rx="1" fill="#5a3a1a" stroke="#3a2a0a" strokeWidth="0.5" transform="rotate(-72 174 98)" />
        {/* Sombra */}
        <line x1="155" y1="185" x2="180" y2="98" stroke="#00000020" strokeWidth="5" strokeLinecap="round" opacity="0.3" />
      </g>
    ),
  },
  // ----- RAROS (2) -----
  {
    id: "weapon_rune_sword",
    name: "Espada Rúnica del Viento",
    type: "weapon",
    rarity: "Raro",
    description: "Acero templado con runas cian grabadas. Aura azul resplandeciente.",
    lorePlaceholder: "Forjada por los templarios del Dragón de Viento.",
    render: () => (
      <g>
        <defs>
          <linearGradient id="runeBladeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a4a6a" />
            <stop offset="50%" stopColor="#a0d0f0" />
            <stop offset="100%" stopColor="#4a7aaa" />
          </linearGradient>
          <radialGradient id="runeGlowGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Aura cian resplandeciente */}
        <ellipse cx="170" cy="140" rx="14" ry="40" fill="url(#runeGlowGrad)" />
        {/* Hoja */}
        <path d="M 152 175 L 185 95 L 189 97 L 156 177 Z" fill="url(#runeBladeGrad)" stroke="#1a3a5a" strokeWidth="0.8" />
        {/* Filo brillante */}
        <line x1="153" y1="174" x2="186" y2="96" stroke="#e0f0ff" strokeWidth="0.7" />
        {/* Grabados rúnicos cian */}
        <text x="167" y="148" fontSize="5" fill="#00E5FF" fontWeight="bold" transform="rotate(-72 167 148)">ᚱ</text>
        <text x="172" y="128" fontSize="5" fill="#00E5FF" fontWeight="bold" transform="rotate(-72 172 128)">ᚦ</text>
        <text x="176" y="112" fontSize="5" fill="#00E5FF" fontWeight="bold" transform="rotate(-72 176 112)">ᚷ</text>
        {/* Guarda decorada */}
        <path d="M 144 172 L 162 172 L 160 178 L 146 178 Z" fill="#1a3a5a" stroke="#00E5FF" strokeWidth="0.8" />
        <circle cx="153" cy="175" r="1.5" fill="#00E5FF" />
        {/* Mango de cuero azul */}
        <rect x="148" y="178" width="9" height="13" rx="1.5" fill="#1a2a4a" />
        <line x1="148" y1="181" x2="157" y2="181" stroke="#00E5FF" strokeWidth="0.5" opacity="0.7" />
        <line x1="148" y1="184" x2="157" y2="184" stroke="#00E5FF" strokeWidth="0.5" opacity="0.7" />
        <line x1="148" y1="187" x2="157" y2="187" stroke="#00E5FF" strokeWidth="0.5" opacity="0.7" />
        {/* Pomo con gema cian */}
        <circle cx="152" cy="193" r="3" fill="#1a3a5a" stroke="#00E5FF" strokeWidth="0.8" />
        <circle cx="152" cy="193" r="1.5" fill="#00E5FF" />
      </g>
    ),
  },
  {
    id: "weapon_guardian_greatsword",
    name: "Mandoble Guardián del Viento",
    type: "weapon",
    rarity: "Raro",
    description: "Gran espada a dos manos con grabados rúnicos. Solo para guardianes.",
    lorePlaceholder: "El mandoble pasó de guardián en guardián por mil años.",
    render: () => (
      <g>
        <defs>
          <linearGradient id="greatswordGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="50%" stopColor="#d0d0d0" />
            <stop offset="100%" stopColor="#5a5a5a" />
          </linearGradient>
        </defs>
        {/* Hoja ancha del mandoble */}
        <path d="M 150 175 L 190 80 L 196 84 L 158 178 Z" fill="url(#greatswordGrad)" stroke="#2a2a2a" strokeWidth="0.8" />
        {/* Surco central (fuller) */}
        <line x1="154" y1="172" x2="192" y2="84" stroke="#3a3a3a" strokeWidth="1.5" />
        <line x1="156" y1="170" x2="194" y2="82" stroke="#8a8a8a" strokeWidth="0.5" />
        {/* Grabados rúnicos cian */}
        <text x="170" y="135" fontSize="6" fill="#00E5FF" fontWeight="bold" transform="rotate(-72 170 135)">ᛟ</text>
        <text x="178" y="105" fontSize="6" fill="#00E5FF" fontWeight="bold" transform="rotate(-72 178 105)">ᛞ</text>
        {/* Guarda grande curva */}
        <path d="M 138 170 Q 152 168 166 170 L 164 178 Q 152 176 140 178 Z" fill="#2a2a2a" stroke="#00E5FF" strokeWidth="0.8" />
        {/* Detalles de la guarda */}
        <circle cx="146" cy="174" r="1.2" fill="#00E5FF" opacity="0.7" />
        <circle cx="158" cy="174" r="1.2" fill="#00E5FF" opacity="0.7" />
        {/* Mango largo para dos manos */}
        <rect x="148" y="178" width="9" height="16" rx="1.5" fill="#1a2a4a" />
        <line x1="148" y1="182" x2="157" y2="182" stroke="#00E5FF" strokeWidth="0.4" opacity="0.6" />
        <line x1="148" y1="186" x2="157" y2="186" stroke="#00E5FF" strokeWidth="0.4" opacity="0.6" />
        <line x1="148" y1="190" x2="157" y2="190" stroke="#00E5FF" strokeWidth="0.4" opacity="0.6" />
        {/* Pomo grande */}
        <ellipse cx="152" cy="197" rx="3.5" ry="2.5" fill="#2a2a2a" stroke="#00E5FF" strokeWidth="0.8" />
        <circle cx="152" cy="197" r="1.5" fill="#00E5FF" opacity="0.7" />
      </g>
    ),
  },
  // ----- ÉPICOS (2) — aura violeta #a855f7 -----
  {
    id: "weapon_crystal_sword",
    name: "Espada de Cristal Morada",
    type: "weapon",
    rarity: "Epico",
    description: "Hoja translúcida de cristal abisal con partículas estelares flotantes.",
    lorePlaceholder: "Forjada con cristales de las minas Umbrías.",
    render: () => (
      <g>
        <defs>
          <linearGradient id="crystalBladeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a0a6a" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6a1a9a" />
          </linearGradient>
          <radialGradient id="epicWeaponGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Aura morada/violeta profunda */}
        <ellipse cx="172" cy="135" rx="18" ry="45" fill="url(#epicWeaponGlow)" />
        {/* Hoja de cristal morada translúcida */}
        <path d="M 151 175 L 188 88 L 193 90 L 156 178 Z" fill="url(#crystalBladeGrad)" stroke="#4a0a6a" strokeWidth="0.8" opacity="0.92" />
        {/* Brillos del cristal */}
        <line x1="153" y1="172" x2="189" y2="90" stroke="#e0a0ff" strokeWidth="0.8" opacity="0.8" />
        <line x1="156" y1="170" x2="184" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.6" />
        {/* Partículas estelares flotantes en la hoja */}
        <circle cx="170" cy="140" r="0.8" fill="#ffffff" opacity="0.9" />
        <circle cx="178" cy="115" r="0.6" fill="#ffffff" opacity="0.8" />
        <circle cx="174" cy="128" r="0.5" fill="#ffd0ff" opacity="0.9" />
        <circle cx="182" cy="100" r="0.7" fill="#ffffff" opacity="0.7" />
        <circle cx="168" cy="155" r="0.5" fill="#e0a0ff" opacity="0.8" />
        {/* Destellos mágicos */}
        <path d="M 170 140 L 172 138 L 170 136 L 168 138 Z" fill="#ffffff" opacity="0.7" />
        <path d="M 178 115 L 179.5 113.5 L 178 112 L 176.5 113.5 Z" fill="#ffd0ff" opacity="0.7" />
        {/* Runas moradas grabadas */}
        <text x="172" y="130" fontSize="6" fill="#ffffff" fontWeight="bold" transform="rotate(-72 172 130)" opacity="0.9">✦</text>
        <text x="180" y="100" fontSize="5" fill="#ffffff" fontWeight="bold" transform="rotate(-72 180 100)" opacity="0.8">✦</text>
        {/* Guarda elegante con gema morada */}
        <path d="M 142 172 L 164 172 L 162 180 L 144 180 Z" fill="#2a0a4a" stroke="#a855f7" strokeWidth="1" />
        <path d="M 152 168 L 154 174 L 152 180 L 150 174 Z" fill="#a855f7" />
        {/* Mango oscuro */}
        <rect x="148" y="180" width="9" height="13" rx="1.5" fill="#1a0a2a" />
        <line x1="148" y1="183" x2="157" y2="183" stroke="#a855f7" strokeWidth="0.5" opacity="0.7" />
        <line x1="148" y1="186" x2="157" y2="186" stroke="#a855f7" strokeWidth="0.5" opacity="0.7" />
        <line x1="148" y1="189" x2="157" y2="189" stroke="#a855f7" strokeWidth="0.5" opacity="0.7" />
        {/* Pomo con gran gema morada */}
        <circle cx="152" cy="196" r="3.5" fill="#2a0a4a" stroke="#a855f7" strokeWidth="1" />
        <circle cx="152" cy="196" r="2" fill="#a855f7" />
        <circle cx="151" cy="195" r="0.8" fill="#ffffff" opacity="0.9" />
      </g>
    ),
  },
  {
    id: "weapon_abyssal_katana",
    name: "Katana Abisal Morada",
    type: "weapon",
    rarity: "Epico",
    description: "Katana curva forjada en el abismo. Destellos estelares brotan de su filo.",
    lorePlaceholder: "Forjada en las profundidades del abismo cristalino.",
    render: () => (
      <g>
        <defs>
          <linearGradient id="katanaBladeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a0a4a" />
            <stop offset="50%" stopColor="#c080ff" />
            <stop offset="100%" stopColor="#4a1a7a" />
          </linearGradient>
          <radialGradient id="katanaGlowGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Aura violeta */}
        <ellipse cx="175" cy="125" rx="16" ry="48" fill="url(#katanaGlowGrad)" />
        {/* Hoja curva de la katana */}
        <path
          d="M 152 175 Q 170 130 195 85 L 198 88 Q 175 130 156 178 Z"
          fill="url(#katanaBladeGrad)"
          stroke="#2a0a4a"
          strokeWidth="0.8"
        />
        {/* Filo brillante */}
        <path d="M 154 173 Q 172 130 195 87" stroke="#e0c0ff" strokeWidth="0.7" fill="none" />
        {/* Línea de templado (hamon) */}
        <path d="M 158 168 Q 175 125 193 90" stroke="#ffffff" strokeWidth="0.4" fill="none" opacity="0.6" />
        {/* Partículas estelares brotando del filo */}
        <circle cx="180" cy="110" r="0.7" fill="#ffffff" opacity="0.9" />
        <circle cx="185" cy="98" r="0.6" fill="#e0a0ff" opacity="0.9" />
        <circle cx="190" cy="92" r="0.5" fill="#ffffff" opacity="0.8" />
        <circle cx="175" cy="125" r="0.6" fill="#ffd0ff" opacity="0.8" />
        <circle cx="170" cy="142" r="0.5" fill="#ffffff" opacity="0.7" />
        {/* Destellos mágicos a lo largo del filo */}
        <path d="M 180 110 L 181.5 108 L 180 106 L 178.5 108 Z" fill="#ffffff" opacity="0.8" />
        <path d="M 188 96 L 189 95 L 188 94 L 187 95 Z" fill="#e0a0ff" opacity="0.8" />
        {/* Tsuba (guarda) rectangular tradicional */}
        <rect x="143" y="172" width="14" height="4" rx="0.5" fill="#1a0a2a" stroke="#a855f7" strokeWidth="0.8" />
        <circle cx="150" cy="174" r="1" fill="#a855f7" />
        {/* Mango (tsuka) envuelto en cuero morado */}
        <rect x="148" y="177" width="8" height="15" rx="1" fill="#1a0a2a" />
        {/* Envoltura tradicional diamond pattern */}
        <path d="M 148 180 L 156 183 M 148 183 L 156 180 M 148 186 L 156 189 M 148 189 L 156 186" stroke="#a855f7" strokeWidth="0.6" />
        {/* Kashira (pomo) con gema morada */}
        <ellipse cx="152" cy="195" rx="3" ry="2.5" fill="#1a0a2a" stroke="#a855f7" strokeWidth="0.8" />
        <circle cx="152" cy="195" r="1.3" fill="#a855f7" />
      </g>
    ),
  },
  // ----- LEGENDARIOS (2) — aura dorada #f59e0b -----
  {
    id: "weapon_celestial_sword",
    name: "Espada Celestial de Luz Eterna",
    type: "weapon",
    rarity: "Legendario",
    description: "Forjada con luz solar ancestral. Partículas flamígeras y rayos dorados la envuelven.",
    lorePlaceholder: "La espada del Sol Ancestral, portada por los héroes divinos.",
    render: () => (
      <g>
        <defs>
          <linearGradient id="celestialBladeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7a3a0a" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#fff5a0" />
            <stop offset="100%" stopColor="#ff8a00" />
          </linearGradient>
          <radialGradient id="celestialGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#ffd60a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="celestialCore" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Aura dorada intensa */}
        <ellipse cx="175" cy="130" rx="22" ry="55" fill="url(#celestialGlow)" />
        {/* Rayos de luz dorada radiantes */}
        <g opacity="0.6">
          <line x1="175" y1="80" x2="175" y2="60" stroke="#ffd60a" strokeWidth="1.2" />
          <line x1="190" y1="100" x2="205" y2="92" stroke="#ffd60a" strokeWidth="1" />
          <line x1="195" y1="130" x2="215" y2="130" stroke="#ffd60a" strokeWidth="1" />
          <line x1="160" y1="100" x2="148" y2="92" stroke="#ffd60a" strokeWidth="0.8" />
          <line x1="155" y1="130" x2="138" y2="130" stroke="#ffd60a" strokeWidth="0.8" />
        </g>
        {/* Núcleo de luz blanca detrás de la hoja */}
        <ellipse cx="178" cy="125" rx="6" ry="42" fill="url(#celestialCore)" opacity="0.7" />
        {/* Hoja celestial con degradado dorado-blanco */}
        <path d="M 150 175 L 192 80 L 198 84 L 156 178 Z" fill="url(#celestialBladeGrad)" stroke="#7a3a0a" strokeWidth="0.8" />
        {/* Filo ardiente */}
        <line x1="152" y1="173" x2="194" y2="82" stroke="#ffffff" strokeWidth="0.9" />
        <line x1="154" y1="170" x2="192" y2="86" stroke="#fff5a0" strokeWidth="0.5" opacity="0.9" />
        {/* Runas solares doradas grabadas */}
        <text x="172" y="135" fontSize="7" fill="#ffffff" fontWeight="bold" transform="rotate(-72 172 135)">☀</text>
        <text x="180" y="105" fontSize="6" fill="#ffffff" fontWeight="bold" transform="rotate(-72 180 105)">✦</text>
        <text x="176" y="120" fontSize="5" fill="#ffffff" fontWeight="bold" transform="rotate(-72 176 120)" opacity="0.8">✧</text>
        {/* Partículas flamígeras */}
        <circle cx="178" cy="115" r="1" fill="#ffd60a" opacity="0.95" />
        <circle cx="184" cy="98" r="0.9" fill="#ffffff" opacity="0.9" />
        <circle cx="188" cy="90" r="0.7" fill="#ff8a00" opacity="0.9" />
        <circle cx="172" cy="140" r="0.8" fill="#ffd60a" opacity="0.9" />
        <circle cx="168" cy="155" r="0.6" fill="#fff5a0" opacity="0.8" />
        {/* Destellos grandes */}
        <path d="M 178 115 L 180 112 L 178 109 L 176 112 Z" fill="#ffffff" opacity="0.95" />
        <path d="M 185 100 L 187 98 L 185 96 L 183 98 Z" fill="#ffd60a" opacity="0.95" />
        {/* Guarda divina ornamentada con alas */}
        <path d="M 138 168 L 166 168 L 164 178 L 140 178 Z" fill="#7a3a0a" stroke="#f59e0b" strokeWidth="1.2" />
        {/* Alas laterales */}
        <path d="M 140 170 Q 130 168 128 174 Q 134 174 140 176" fill="#7a3a0a" stroke="#f59e0b" strokeWidth="0.8" />
        <path d="M 164 170 Q 174 168 176 174 Q 170 174 164 176" fill="#7a3a0a" stroke="#f59e0b" strokeWidth="0.8" />
        {/* Gema solar central en la guarda */}
        <circle cx="152" cy="173" r="2.5" fill="#f59e0b" stroke="#fff5a0" strokeWidth="0.8" />
        <circle cx="151" cy="172" r="1" fill="#ffffff" opacity="0.95" />
        {/* Mango de cuero dorado */}
        <rect x="148" y="178" width="9" height="14" rx="1.5" fill="#5a2a0a" />
        <line x1="148" y1="181" x2="157" y2="181" stroke="#f59e0b" strokeWidth="0.5" />
        <line x1="148" y1="184" x2="157" y2="184" stroke="#f59e0b" strokeWidth="0.5" />
        <line x1="148" y1="187" x2="157" y2="187" stroke="#f59e0b" strokeWidth="0.5" />
        <line x1="148" y1="190" x2="157" y2="190" stroke="#f59e0b" strokeWidth="0.5" />
        {/* Pomo con gema solar masiva */}
        <circle cx="152" cy="196" r="4" fill="#7a3a0a" stroke="#f59e0b" strokeWidth="1.2" />
        <circle cx="152" cy="196" r="2.5" fill="#f59e0b" />
        <circle cx="152" cy="196" r="1.5" fill="#fff5a0" />
        <circle cx="151" cy="195" r="0.8" fill="#ffffff" />
      </g>
    ),
  },
  {
    id: "weapon_ancient_staff",
    name: "Palo Ancestral del Sol",
    type: "weapon",
    rarity: "Legendario",
    description: "Bastón de los antiguos guardianes. Corona solar que irradia rayos dorados.",
    lorePlaceholder: "El bastón de los primeros guardianes del conocimiento.",
    render: () => (
      <g>
        <defs>
          <linearGradient id="staffShaftGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3a1a05" />
            <stop offset="50%" stopColor="#8a4a0a" />
            <stop offset="100%" stopColor="#3a1a05" />
          </linearGradient>
          <radialGradient id="solarOrbGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fff5a0" />
            <stop offset="80%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#7a3a0a" />
          </radialGradient>
          <radialGradient id="solarHalo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Halo dorado masivo alrededor del orbe solar */}
        <circle cx="180" cy="80" r="28" fill="url(#solarHalo)" />
        {/* Rayos solares radiantes */}
        <g opacity="0.85">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const x1 = 180 + Math.cos(angle) * 14
            const y1 = 80 + Math.sin(angle) * 14
            const x2 = 180 + Math.cos(angle) * 24
            const y2 = 80 + Math.sin(angle) * 24
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
          })}
        </g>
        {/* Rayos secundarios más pequeños */}
        <g opacity="0.6">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2 + Math.PI / 12
            const x1 = 180 + Math.cos(angle) * 15
            const y1 = 80 + Math.sin(angle) * 15
            const x2 = 180 + Math.cos(angle) * 20
            const y2 = 80 + Math.sin(angle) * 20
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffd60a" strokeWidth="0.8" strokeLinecap="round" />
          })}
        </g>
        {/* Orbe solar principal */}
        <circle cx="180" cy="80" r="11" fill="url(#solarOrbGrad)" stroke="#7a3a0a" strokeWidth="0.8" />
        {/* Brillo interior del orbe */}
        <circle cx="178" cy="78" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="179" cy="79" r="1.5" fill="#ffffff" opacity="0.95" />
        {/* Partículas flamígeras flotantes */}
        <circle cx="168" cy="95" r="0.8" fill="#ffd60a" opacity="0.9" />
        <circle cx="192" cy="100" r="0.7" fill="#ff8a00" opacity="0.9" />
        <circle cx="195" cy="75" r="0.6" fill="#fff5a0" opacity="0.85" />
        <circle cx="165" cy="65" r="0.7" fill="#ffd60a" opacity="0.85" />
        {/* Mango del bastón (madera antigua con dorado) */}
        <line x1="151" y1="180" x2="180" y2="85" stroke="url(#staffShaftGrad)" strokeWidth="6" strokeLinecap="round" />
        <line x1="151" y1="180" x2="180" y2="85" stroke="#5a2a0a" strokeWidth="3" strokeLinecap="round" />
        {/* Nudos del bastón con detalles dorados */}
        <circle cx="158" cy="158" r="2" fill="#5a2a0a" stroke="#f59e0b" strokeWidth="0.6" />
        <circle cx="165" cy="135" r="1.8" fill="#5a2a0a" stroke="#f59e0b" strokeWidth="0.6" />
        <circle cx="172" cy="112" r="1.5" fill="#5a2a0a" stroke="#f59e0b" strokeWidth="0.6" />
        {/* Envolturas ornamentales doradas en el mango */}
        <rect x="155" y="152" width="6" height="3" fill="#f59e0b" opacity="0.8" transform="rotate(-72 155 152)" />
        <rect x="162" y="130" width="6" height="3" fill="#f59e0b" opacity="0.8" transform="rotate(-72 162 130)" />
        <rect x="169" y="108" width="6" height="3" fill="#f59e0b" opacity="0.8" transform="rotate(-72 169 108)" />
        {/* Empuñadura con envoltura de cuero dorado */}
        <rect x="148" y="178" width="8" height="14" rx="1.5" fill="#3a1a05" transform="rotate(-15 152 185)" />
        <line x1="150" y1="180" x2="158" y2="190" stroke="#f59e0b" strokeWidth="0.5" opacity="0.8" />
        <line x1="152" y1="178" x2="160" y2="188" stroke="#f59e0b" strokeWidth="0.5" opacity="0.8" />
        <line x1="154" y1="176" x2="162" y2="186" stroke="#f59e0b" strokeWidth="0.5" opacity="0.8" />
        {/* Base del bastón con pomo dorado */}
        <circle cx="152" cy="192" r="3" fill="#5a2a0a" stroke="#f59e0b" strokeWidth="0.8" />
        <circle cx="152" cy="192" r="1.5" fill="#f59e0b" />
      </g>
    ),
  },
]

export const GACHA_ITEMS: GachaItem[] = [...HAT_ITEMS, ...TOP_ITEMS, ...AURA_ITEMS, ...WEAPON_ITEMS]

export const ITEMS_BY_ID: Record<string, GachaItem> = Object.fromEntries(
  GACHA_ITEMS.map((item) => [item.id, item])
)

export function getItemsByRarity(rarity: Rarity): GachaItem[] {
  return GACHA_ITEMS.filter((i) => i.rarity === rarity)
}
