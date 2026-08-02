"use client"

import { GACHA_ITEMS, RARITY_CONFIG, AVATAR_BASES, type Rarity } from "@/lib/gacha-catalog"
import { AvatarSvg } from "@/components/avatar-svg"

const RARITY_ORDER: Rarity[] = ["Comun", "Normal", "Raro", "Epico", "Legendario"]

export default function WeaponPreviewPage() {
  const weapons = GACHA_ITEMS.filter((i) => i.type === "weapon")

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="font-fancy italic text-3xl font-bold mb-2">Vista previa de armas mágicas (spec v4.0)</h1>
        <p className="text-zinc-400 text-sm">10 armas · 2 por rareza · SVG rico con gradientes, runas y partículas</p>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        {RARITY_ORDER.map((rarity) => {
          const cfg = RARITY_CONFIG[rarity]
          const items = weapons.filter((w) => w.rarity === rarity)
          return (
            <section key={rarity}>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="font-fancy italic text-2xl font-bold" style={{ color: cfg.hex }}>
                  {cfg.label}
                </h2>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  {(cfg.probability * 100).toFixed(0)}% drop rate
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((weapon) => (
                  <div
                    key={weapon.id}
                    className="relative rounded-xl border p-4 flex flex-col items-center gap-3"
                    style={{
                      borderColor: cfg.hex + "60",
                      background: `linear-gradient(135deg, ${cfg.hex}10, transparent)`,
                    }}
                  >
                    {/* Avatar con el arma equipada */}
                    <div
                      className="rounded-lg p-2 flex items-center justify-center"
                      style={{ background: `${cfg.hex}08` }}
                    >
                      <AvatarSvg base="warrior" weapon={weapon} size={180} />
                    </div>
                    <div className="text-center">
                      <div className="font-fancy italic font-bold text-sm" style={{ color: cfg.hex }}>
                        {weapon.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1 leading-tight">
                        {weapon.description}
                      </div>
                      {weapon.lorePlaceholder && (
                        <div className="text-[9px] text-zinc-600 italic mt-1">
                          &ldquo;{weapon.lorePlaceholder}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        {/* Comparación de bases (warrior / mage / archer) con un arma legendaria */}
        <section>
          <h2 className="font-fancy italic text-2xl font-bold mb-4 text-amber-400">
            Prueba con cada base de avatar
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {AVATAR_BASES.map((base) => {
              const celestialSword = GACHA_ITEMS.find((i) => i.id === "weapon_celestial_sword")!
              return (
                <div
                  key={base.id}
                  className="rounded-xl border border-amber-400/40 p-4 flex flex-col items-center gap-2 bg-amber-400/5"
                >
                  <AvatarSvg base={base.id} weapon={celestialSword} size={180} />
                  <div className="text-sm font-fancy italic font-bold text-amber-400">{base.name}</div>
                  <div className="text-[10px] text-zinc-500">con Espada Celestial</div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
