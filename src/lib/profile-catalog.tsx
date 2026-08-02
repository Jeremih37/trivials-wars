// Catálogo de marcos desbloqueables (cada 10 niveles)
// y de iconos de perfil (varias opciones)

import type { ReactNode } from "react"

export interface Frame {
  id: string
  name: string
  description: string
  unlockLevel: number
  render: () => ReactNode // SVG del marco, viewBox 0..100
  hex: string
}

export const FRAMES: Frame[] = [
  {
    id: "frame_basic",
    name: "Marco Básico",
    description: "Marco inicial disponible para todos.",
    unlockLevel: 1,
    hex: "#a1a1aa",
    render: () => (
      <circle cx="50" cy="50" r="48" fill="none" stroke="#a1a1aa" strokeWidth="2" />
    ),
  },
  {
    id: "frame_bronze",
    name: "Marco Bronce",
    description: "Desbloqueado al nivel 10. Tu primera medalla.",
    unlockLevel: 10,
    hex: "#cd7f32",
    render: () => (
      <>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#cd7f32" strokeWidth="3" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#cd7f32" strokeWidth="1" strokeDasharray="2 3" />
        <polygon points="50,4 52,8 56,8 53,11 54,15 50,13 46,15 47,11 44,8 48,8" fill="#cd7f32" />
      </>
    ),
  },
  {
    id: "frame_silver",
    name: "Marco Plata",
    description: "Desbloqueado al nivel 20. Brillo helado.",
    unlockLevel: 20,
    hex: "#c0c0c0",
    render: () => (
      <>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#c0c0c0" strokeWidth="3" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e5e5" strokeWidth="1.5" />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x = 50 + Math.cos(rad) * 47
          const y = 50 + Math.sin(rad) * 47
          return <circle key={deg} cx={x} cy={y} r="2" fill="#fff5e6" />
        })}
      </>
    ),
  },
  {
    id: "frame_gold",
    name: "Marco Oro",
    description: "Desbloqueado al nivel 30. Para verdaderos campeones.",
    unlockLevel: 30,
    hex: "#ffd60a",
    render: () => (
      <>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#ffd60a" strokeWidth="4" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#ff8a00" strokeWidth="1.5" />
        {/* Coronas en los 4 puntos cardinales */}
        <text x="46" y="10" fontSize="8" fill="#ffd60a"></text>
        <text x="46" y="96" fontSize="8" fill="#ffd60a"></text>
        <text x="2" y="54" fontSize="8" fill="#ffd60a"></text>
        <text x="92" y="54" fontSize="8" fill="#ffd60a"></text>
      </>
    ),
  },
  {
    id: "frame_diamond",
    name: "Marco Diamante",
    description: "Desbloqueado al nivel 40. Pureza cristalina.",
    unlockLevel: 40,
    hex: "#06b6d4",
    render: () => (
      <>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#06b6d4" strokeWidth="3" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#67e8f9" strokeWidth="1.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x = 50 + Math.cos(rad) * 47
          const y = 50 + Math.sin(rad) * 47
          return (
            <polygon
              key={deg}
              points={`${x},${y - 2} ${x + 2},${y} ${x},${y + 2} ${x - 2},${y}`}
              fill="#67e8f9"
            />
          )
        })}
      </>
    ),
  },
  {
    id: "frame_legendary",
    name: "Marco Legendario",
    description: "Desbloqueado al nivel 50. Para los elegidos.",
    unlockLevel: 50,
    hex: "#d946ef",
    render: () => (
      <>
        <circle cx="50" cy="50" r="49" fill="none" stroke="url(#legGrad)" strokeWidth="5" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#ffd60a" strokeWidth="1" strokeDasharray="3 2" />
        {/* Llamas en 8 puntos */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x = 50 + Math.cos(rad) * 47
          const y = 50 + Math.sin(rad) * 47
          return <text key={deg} x={x - 4} y={y + 3} fontSize="8" fill="#ffd60a"></text>
        })}
        <defs>
          <linearGradient id="legGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff2d2d" />
            <stop offset="50%" stopColor="#ffd60a" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </>
    ),
  },
]

export const FRAMES_BY_ID: Record<string, Frame> = Object.fromEntries(
  FRAMES.map((f) => [f.id, f])
)

// ===== ICONOS DE PERFIL =====
export interface ProfileIcon {
  id: string
  emoji: string
  name: string
  unlockLevel: number
}

export const PROFILE_ICONS: ProfileIcon[] = [
  // Nivel 1
  { id: "icon_brain", emoji: "BR", name: "Cerebro", unlockLevel: 1 },
  { id: "icon_fire", emoji: "FR", name: "Fuego", unlockLevel: 1 },
  { id: "icon_star", emoji: "⭐", name: "Estrella", unlockLevel: 1 },
  { id: "icon_trophy", emoji: "TR", name: "Trofeo", unlockLevel: 1 },
  // Nivel 5
  { id: "icon_crown", emoji: "CR", name: "Corona", unlockLevel: 5 },
  { id: "icon_diamond", emoji: "DI", name: "Diamante", unlockLevel: 5 },
  { id: "icon_lightning", emoji: "LT", name: "Rayo", unlockLevel: 5 },
  // Nivel 15
  { id: "icon_dragon", emoji: "DR", name: "Dragón", unlockLevel: 15 },
  { id: "icon_phoenix", emoji: "PH", name: "Fénix", unlockLevel: 15 },
  // Nivel 25
  { id: "icon_skull", emoji: "SK", name: "Calavera", unlockLevel: 25 },
  { id: "icon_ninja", emoji: "NJ", name: "Ninja", unlockLevel: 25 },
  // Nivel 35
  { id: "icon_robot", emoji: "RB", name: "Robot", unlockLevel: 35 },
  { id: "icon_alien", emoji: "AL", name: "Alien", unlockLevel: 35 },
  // Nivel 45
  { id: "icon_wizard", emoji: "WG", name: "Mago", unlockLevel: 45 },
  // Nivel 50+
  { id: "icon_galaxy", emoji: "GA", name: "Galaxia", unlockLevel: 50 },
  { id: "icon_volcano", emoji: "VO", name: "Volcán", unlockLevel: 50 },
]

export const ICONS_BY_ID: Record<string, ProfileIcon> = Object.fromEntries(
  PROFILE_ICONS.map((i) => [i.id, i])
)

// Devuelve el emoji a partir del id guardado, o el emoji por defecto
export function getIconEmoji(id: string): string {
  // Si el id coincide con un icono conocido, devuelve su emoji
  if (ICONS_BY_ID[id]) return ICONS_BY_ID[id].emoji
  // Si ya es un emoji suelto (compat con versión anterior)
  if (id && [...id].length <= 2) return id
  return ""
}
