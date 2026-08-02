"use client"

import { AVATAR_BASES, ITEMS_BY_ID, type GachaItem } from "@/lib/gacha-catalog"

interface AvatarSvgProps {
  base: string // warrior | mage | archer
  skinTone?: string
  hat?: GachaItem | null
  top?: GachaItem | null
  aura?: GachaItem | null
  weapon?: GachaItem | null
  size?: number // px
  className?: string
}

export function AvatarSvg({ base, skinTone = "#f4c2a1", hat, top, aura, weapon, size = 200, className }: AvatarSvgProps) {
  const baseConfig = AVATAR_BASES.find((b) => b.id === base) ?? AVATAR_BASES[0]

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Aura (capa más al fondo) */}
      {aura?.render({ skinTone })}

      {/* Cuerpo base (sin top) */}
      {baseConfig.render({ skinTone })}

      {/* Top sobrepuesto al cuerpo */}
      {top?.render({ skinTone })}

      {/* Hat al frente */}
      {hat?.render({ skinTone })}

      {/* Weapon en la mano derecha (capa superior, al frente de todo) */}
      {weapon?.render({ skinTone })}
    </svg>
  )
}

// Helper para construir el avatar desde ids del inventario
export function buildAvatarFromIds(
  base: string,
  skinTone: string,
  equipped: { hat: string | null; top: string | null; aura: string | null; weapon?: string | null }
) {
  return {
    base,
    skinTone,
    hat: equipped.hat ? ITEMS_BY_ID[equipped.hat] ?? null : null,
    top: equipped.top ? ITEMS_BY_ID[equipped.top] ?? null : null,
    aura: equipped.aura ? ITEMS_BY_ID[equipped.aura] ?? null : null,
    weapon: equipped.weapon ? ITEMS_BY_ID[equipped.weapon] ?? null : null,
  }
}
