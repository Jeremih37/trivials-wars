// Catálogo de items para el sistema Gacha
// Cada item tiene: id, name, type, rarity, emoji/visual

export type Rarity = "Comun" | "Inusual" | "Raro" | "Epico" | "Legendario"
export type ItemType = "hat" | "top" | "aura"
export type ItemSlot = "hat" | "top" | "aura"

export interface GachaItem {
  id: string
  name: string
  type: ItemType
  rarity: Rarity
  emoji: string
  description: string
}

export const RARITY_CONFIG: Record<Rarity, {
  probability: number
  color: string // tailwind classes
  hex: string
  glow: string
  label: string
  particle: string
}> = {
  Comun: {
    probability: 0.55,
    color: "border-zinc-400 text-zinc-200 bg-zinc-700/30",
    hex: "#a1a1aa",
    glow: "shadow-zinc-500/30",
    label: "Común",
    particle: "none",
  },
  Inusual: {
    probability: 0.25,
    color: "border-green-400 text-green-200 bg-green-700/20",
    hex: "#22c55e",
    glow: "shadow-green-500/40",
    label: "Inusual",
    particle: "none",
  },
  Raro: {
    probability: 0.12,
    color: "border-blue-400 text-blue-200 bg-blue-700/20",
    hex: "#3b82f6",
    glow: "shadow-blue-500/50",
    label: "Raro",
    particle: "sparkle",
  },
  Epico: {
    probability: 0.06,
    color: "border-purple-400 text-purple-200 bg-purple-700/20",
    hex: "#a855f7",
    glow: "shadow-purple-500/60",
    label: "Épico",
    particle: "aura",
  },
  Legendario: {
    probability: 0.02,
    color: "border-amber-300 text-amber-100 bg-amber-600/20",
    hex: "#fbbf24",
    glow: "shadow-amber-400/70",
    label: "Legendario",
    particle: "explosion",
  },
}

export const GACHA_ITEMS: GachaItem[] = [
  // ===== COMUNES (Gris) =====
  // Hats
  { id: "hat_cap_basic", name: "Gorra básica", type: "hat", rarity: "Comun", emoji: "🧢", description: "Una gorra simple y cómoda." },
  { id: "hat_beanie", name: "Gorro de lana", type: "hat", rarity: "Comun", emoji: "🎩", description: "Para los días fríos." },
  // Tops
  { id: "top_tshirt_white", name: "Camiseta blanca", type: "top", rarity: "Comun", emoji: "👕", description: "Clásica, versátil." },
  { id: "top_tshirt_red", name: "Camiseta roja", type: "top", rarity: "Comun", emoji: "👕", description: "Llamativa y atrevida." },
  // Auras
  { id: "aura_none", name: "Sin aura", type: "aura", rarity: "Comun", emoji: "✨", description: "Aún no desbloqueas auras." },

  // ===== INUSUALES (Verde) =====
  { id: "hat_sunglasses", name: "Gafas de sol", type: "hat", rarity: "Inusual", emoji: "🕶️", description: "Estilo en su máxima expresión." },
  { id: "hat_headphones", name: "Auriculares", type: "hat", rarity: "Inusual", emoji: "🎧", description: "Siempre con música." },
  { id: "top_jersey", name: "Camiseta deportiva", type: "top", rarity: "Inusual", emoji: "🎽", description: "Para entrenar y competir." },
  { id: "aura_leaf", name: "Hojas verdes", type: "aura", rarity: "Inusual", emoji: "🍃", description: "Conexión natural." },

  // ===== RAROS (Azul) =====
  { id: "hat_top_hat", name: "Sombrero de copa", type: "hat", rarity: "Raro", emoji: "🎩", description: "Elegancia histórica." },
  { id: "hat_crown_simple", name: "Corona antigua", type: "hat", rarity: "Raro", emoji: "👑", description: "Para verdaderos reyes." },
  { id: "top_scientist_coat", name: "Bata de científico", type: "top", rarity: "Raro", emoji: "🥼", description: "Pura curiosidad científica." },
  { id: "top_historic_robe", name: "Túnica histórica", type: "top", rarity: "Raro", emoji: "👘", description: "Sabiduría de épocas pasadas." },
  { id: "aura_flame", name: "Llama azul", type: "aura", rarity: "Raro", emoji: "🔥", description: "Fuego intelectual." },

  // ===== ÉPICOS (Morado) =====
  { id: "hat_wizard_hat", name: "Sombrero de mago", type: "hat", rarity: "Epico", emoji: "🧙", description: "Poder arcano encarnado." },
  { id: "hat_helmet", name: "Casco espacial", type: "hat", rarity: "Epico", emoji: "👨‍🚀", description: "Para conquistar galaxias." },
  { id: "top_armor", name: "Armadura legendaria", type: "top", rarity: "Epico", emoji: "🛡️", description: "Protección absoluta." },
  { id: "aura_electric", name: "Tormenta eléctrica", type: "aura", rarity: "Epico", emoji: "⚡", description: "Energía que rodea el avatar." },

  // ===== LEGENDARIOS (Dorado) =====
  { id: "hat_phoenix_crown", name: "Corona del fénix", type: "hat", rarity: "Legendario", emoji: "🔥", description: "Renace de las cenizas." },
  { id: "top_dragon_armor", name: "Armadura del dragón", type: "top", rarity: "Legendario", emoji: "🐲", description: "Escamas de mil batallas." },
  { id: "aura_cosmic", name: "Aura cósmica", type: "aura", rarity: "Legendario", emoji: "🌌", description: "El universo entero te acompaña." },
]

export const ITEMS_BY_ID: Record<string, GachaItem> = Object.fromEntries(
  GACHA_ITEMS.map((item) => [item.id, item])
)

export function getItemsByRarity(rarity: Rarity): GachaItem[] {
  return GACHA_ITEMS.filter((i) => i.rarity === rarity)
}
