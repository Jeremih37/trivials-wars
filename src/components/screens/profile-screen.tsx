"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/lib/store"
import { useProfile, useInventory, useEquipItem, useUnequipItem } from "@/hooks/use-game"
import { ArrowLeft, Trophy, Zap, Gift, Target, Flame, Sparkles } from "lucide-react"
import { RARITY_CONFIG } from "@/lib/gacha-catalog"
import type { Rarity } from "@/lib/gacha-catalog"
import { CATEGORIES, DIFFICULTIES } from "@/lib/game"
import { cn } from "@/lib/utils"
import { useState } from "react"

const RARITY_ORDER: Rarity[] = ["Legendario", "Epico", "Raro", "Inusual", "Comun"]

export function ProfileScreen() {
  const { setScreen } = useGameStore()
  const { data: profile, isLoading } = useProfile()
  const { data: inventory } = useInventory()
  const equipMut = useEquipItem()
  const unequipMut = useUnequipItem()
  const [filter, setFilter] = useState<Rarity | "all" | "owned">("owned")

  if (isLoading || !profile) {
    return <div className="p-8 text-center text-muted-foreground">Cargando perfil…</div>
  }

  const u = profile.user

  const items = inventory?.items ?? []
  const filteredItems = items.filter((it) => {
    if (filter === "all") return true
    if (filter === "owned") return it.owned
    return it.rarity === filter
  })

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setScreen("home")}
            className="p-2 rounded-xl bg-card/60 border border-border/60 hover:bg-card transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight">Perfil</h1>
            <p className="text-[10px] text-muted-foreground">Tu progreso e inventario</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Hero perfil */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 to-background p-6"
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid sm:grid-cols-[auto_1fr] gap-6 items-center">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 blur-2xl rounded-full" />
                <div className="relative w-32 h-32 rounded-full bg-card border-2 border-primary/40 flex items-center justify-center text-6xl glow-cyan">
                  {u.avatarString}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-black">
                  LVL {u.level}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Jugador</div>
                <div className="text-2xl font-black">{u.name}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MiniStat icon={<Trophy className="w-4 h-4" />} label="Nivel" value={u.level} color="text-amber-300" />
                <MiniStat icon={<Zap className="w-4 h-4" />} label="XP total" value={u.xp} color="text-cyan-300" />
                <MiniStat icon={<Gift className="w-4 h-4" />} label="Cajas" value={u.boxes} color="text-pink-300" />
                <MiniStat icon={<Sparkles className="w-4 h-4" />} label="Items" value={u.inventoryCount} color="text-purple-300" />
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progreso al nivel {u.level + 1}</span>
                  <span>{u.xpIntoLevel} / {u.xpForNextLevel} XP</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${u.progressPct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-primary via-accent to-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats por categoría */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Progreso por categoría</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const rows = profile.progress.filter((p) => p.category === cat.id)
              const total = rows.reduce((s, p) => s + p.total, 0)
              const correct = rows.reduce((s, p) => s + p.correct, 0)
              const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
              const bestStreak = rows.reduce((s, p) => Math.max(s, p.bestStreak), 0)

              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-border/60 bg-card/40 p-4"
                  style={{ boxShadow: `0 0 18px ${cat.color}10` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="font-bold text-sm" style={{ color: cat.color }}>{cat.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground text-[10px] uppercase">Jugadas</div>
                      <div className="font-bold">{total}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px] uppercase">Aciertos</div>
                      <div className="font-bold text-cyan-300">{correct}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px] uppercase">Precisión</div>
                      <div className="font-bold text-amber-300">{accuracy}%</div>
                    </div>
                  </div>
                  {bestStreak > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-orange-300">
                      <Flame className="w-3 h-3" /> Mejor racha: {bestStreak}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Inventario */}
        <section>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Inventario de accesorios</h2>
            <div className="text-xs text-muted-foreground">
              {u.inventoryCount} / {inventory?.totalCount ?? 0} desbloqueados
            </div>
          </div>

          {/* Filtros por rareza */}
          <div className="flex flex-wrap gap-2 mb-4">
            <FilterChip label="Owned" color="#22d3ee" active={filter === "owned"} onClick={() => setFilter("owned")} />
            <FilterChip label="Todos" color="#a1a1aa" active={filter === "all"} onClick={() => setFilter("all")} />
            {RARITY_ORDER.map((r) => (
              <FilterChip
                key={r}
                label={RARITY_CONFIG[r].label}
                color={RARITY_CONFIG[r].hex}
                active={filter === r}
                onClick={() => setFilter(r)}
              />
            ))}
          </div>

          {/* Grid de items */}
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              No hay items para mostrar en este filtro. ¡Abre loot boxes para coleccionarlos!
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredItems.map((it) => {
                const cfg = RARITY_CONFIG[it.rarity]
                return (
                  <motion.button
                    key={it.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: it.owned ? 1.05 : 1 }}
                    disabled={!it.owned || equipMut.isPending || unequipMut.isPending}
                    onClick={() => {
                      if (it.equipped) {
                        unequipMut.mutate({ slot: it.type })
                      } else {
                        equipMut.mutate({ itemId: it.id })
                      }
                    }}
                    className={cn(
                      "relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all",
                      it.equipped && cfg.color,
                      it.owned && !it.equipped && "bg-card/40 hover:bg-card/70",
                      !it.owned && "bg-card/20 opacity-30 grayscale"
                    )}
                    style={{
                      borderColor: it.owned ? cfg.hex : undefined,
                      boxShadow: it.equipped ? `0 0 20px ${cfg.hex}60` : undefined,
                    }}
                  >
                    <span className={cn("text-3xl", !it.owned && "blur-sm")}>{it.emoji}</span>
                    <span className="text-[9px] text-center font-medium leading-tight mt-1 line-clamp-2">{it.name}</span>
                    <span className="absolute top-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded" style={{ background: cfg.hex, color: "#000" }}>
                      {cfg.label[0]}
                    </span>
                    {it.equipped && (
                      <span className="absolute top-1 left-1 text-[8px] font-bold px-1 py-0.5 rounded bg-green-500 text-black">
                        ✓
                      </span>
                    )}
                    {it.owned && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground uppercase">
                        {it.equipped ? "Quitar" : "Equipar"}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          )}
        </section>

        {/* Info de probabilidades */}
        <section className="rounded-2xl border border-border/60 bg-card/30 p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Probabilidades de Loot Box</div>
          <div className="grid grid-cols-5 gap-2">
            {RARITY_ORDER.map((r) => {
              const cfg = RARITY_CONFIG[r]
              return (
                <div key={r} className="text-center">
                  <div className="text-[10px] font-bold uppercase" style={{ color: cfg.hex }}>{cfg.label}</div>
                  <div className="text-sm font-mono font-bold" style={{ color: cfg.hex }}>{(cfg.probability * 100).toFixed(0)}%</div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="rounded-xl bg-card/60 border border-border/60 p-2 text-center">
      <div className={cn("flex justify-center mb-1", color)}>{icon}</div>
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
    </div>
  )
}

function FilterChip({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition",
        active ? "text-black" : "text-foreground hover:bg-card/60"
      )}
      style={{
        background: active ? color : "transparent",
        borderColor: color,
      }}
    >
      {label}
    </button>
  )
}
