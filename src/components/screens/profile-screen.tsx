"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/lib/store"
import { useProfile, useInventory, useEquipItem, useUnequipItem, useEquipProfile } from "@/hooks/use-game"
import { ArrowLeft, Trophy, Zap, Gift, Target, Flame, Swords, Crown, Lock, Check, Sparkles, Shield } from "lucide-react"
import { RARITY_CONFIG } from "@/lib/gacha-catalog"
import type { Rarity } from "@/lib/gacha-catalog"
import { CATEGORIES, AVATAR_BASES_INFO } from "@/lib/game"
import { AvatarSvg, buildAvatarFromIds } from "@/components/avatar-svg"
import { FRAMES, PROFILE_ICONS, FRAMES_BY_ID } from "@/lib/profile-catalog"
import { cn } from "@/lib/utils"
import { useState } from "react"

const RARITY_ORDER: Rarity[] = ["Legendario", "Epico", "Raro", "Inusual", "Comun"]

export function ProfileScreen() {
  const { setScreen } = useGameStore()
  const { data: profile, isLoading } = useProfile()
  const { data: inventory } = useInventory()
  const equipMut = useEquipItem()
  const unequipMut = useUnequipItem()
  const equipProfileMut = useEquipProfile()
  const [filter, setFilter] = useState<Rarity | "all" | "owned">("owned")
  const [activeTab, setActiveTab] = useState<"stats" | "inventory" | "avatar" | "frames" | "icons">("stats")

  if (isLoading || !profile) {
    return <div className="p-8 text-center text-muted-foreground">Cargando perfil…</div>
  }

  const u = profile.user
  const avatarData = buildAvatarFromIds(u.avatarBase, u.skinTone, u.equipped)
  const frame = FRAMES_BY_ID[u.equippedFrame] ?? FRAMES[0]

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
            onClick={() => setScreen("welcome")}
            className="p-2 rounded-xl bg-card/60 border border-border/60 hover:bg-card transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight">Perfil</h1>
            <p className="text-[10px] text-muted-foreground">Tu progreso, marcos e inventario</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Hero perfil */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 to-background p-6 glow-red"
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid sm:grid-cols-[auto_1fr] gap-6 items-center">
            {/* Avatar con marco + icono */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 blur-2xl rounded-full" />
                <div
                  className="relative w-32 h-32 rounded-full bg-card border-2 flex items-center justify-center overflow-hidden"
                  style={{ borderColor: frame.hex, boxShadow: `0 0 25px ${frame.hex}80` }}
                >
                  <AvatarSvg {...avatarData} size={120} />
                </div>
                {/* Marco decorativo */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                  {frame.render()}
                </svg>
                {/* Icono de perfil (badge abajo derecha) */}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-card border-2 flex items-center justify-center text-xl"
                  style={{ borderColor: frame.hex }}
                >
                  {u.profileIconEmoji}
                </div>
                {/* Nivel arriba */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-xs font-black shadow-lg">
                  LVL {u.level}
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-base font-black">{u.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {u.provider === "google" ? `📧 ${u.email}` : "👤 Invitado"}
                </div>
              </div>
            </div>

            {/* Stats principales */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <StatBlock icon={<Trophy className="w-4 h-4" />} label="Nivel" value={u.level} color="text-amber-300" />
                <StatBlock icon={<Zap className="w-4 h-4" />} label="XP total" value={u.xp} color="text-red-300" />
                <StatBlock icon={<Gift className="w-4 h-4" />} label="Cajas" value={u.boxes} color="text-pink-300" />
                <StatBlock icon={<Swords className="w-4 h-4" />} label="Victorias" value={u.wins} color="text-green-400" />
                <StatBlock icon={<Target className="w-4 h-4" />} label="Derrotas" value={u.losses} color="text-red-400" />
                <StatBlock icon={<Flame className="w-4 h-4" />} label="Racha" value={u.currentStreak} color="text-orange-400" />
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
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                  />
                </div>
              </div>

              {/* Win rate */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-card/40 border border-border/60">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground uppercase tracking-wider">Win Rate</span>
                    <span className="font-bold text-amber-300">{u.winRate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${u.winRate}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-green-500 to-amber-400"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Mejor racha</div>
                  <div className="font-bold text-orange-400 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {u.maxStreak}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sticky top-16 z-30 bg-background/80 backdrop-blur-xl p-2 rounded-xl border border-border/40">
          <TabButton active={activeTab === "stats"} onClick={() => setActiveTab("stats")} icon={<Target className="w-4 h-4" />} label="Categorías" />
          <TabButton active={activeTab === "avatar"} onClick={() => setActiveTab("avatar")} icon={<Sparkles className="w-4 h-4" />} label="Avatar" />
          <TabButton active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")} icon={<Gift className="w-4 h-4" />} label="Inventario" />
          <TabButton active={activeTab === "frames"} onClick={() => setActiveTab("frames")} icon={<Crown className="w-4 h-4" />} label="Marcos" />
          <TabButton active={activeTab === "icons"} onClick={() => setActiveTab("icons")} icon={<Shield className="w-4 h-4" />} label="Iconos" />
        </div>

        {/* === TAB: STATS POR CATEGORÍA === */}
        {activeTab === "stats" && (
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
        )}

        {/* === TAB: AVATAR (base body selector) === */}
        {activeTab === "avatar" && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Cuerpo base del avatar</h2>
            <p className="text-xs text-muted-foreground mb-4">Elige el cuerpo de tu personaje. Los accesorios (sombreros, ropa, auras) se equipan desde Inventario.</p>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_BASES_INFO.map((base) => {
                const isEquipped = u.avatarBase === base.id
                return (
                  <motion.button
                    key={base.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => equipProfileMut.mutate({ type: "base", key: base.id })}
                    disabled={equipProfileMut.isPending}
                    className={cn(
                      "relative rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all",
                      isEquipped ? "bg-primary/15 border-primary" : "bg-card/40 border-border/60 hover:border-primary/40"
                    )}
                    style={isEquipped ? { boxShadow: "0 0 20px rgba(255,45,45,0.4)" } : undefined}
                  >
                    <AvatarSvg base={base.id} skinTone={u.skinTone} size={80} />
                    <div className="text-xs font-bold">{base.name}</div>
                    <div className="text-[9px] text-muted-foreground text-center">{base.description}</div>
                    {isEquipped && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </section>
        )}

        {/* === TAB: INVENTARIO === */}
        {activeTab === "inventory" && (
          <section>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Inventario de accesorios</h2>
              <div className="text-xs text-muted-foreground">
                {u.inventoryCount} / {inventory?.totalCount ?? 0} desbloqueados
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <FilterChip label="Owned" color="#ff2d2d" active={filter === "owned"} onClick={() => setFilter("owned")} />
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

            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                No hay items para mostrar. ¡Abre loot boxes para coleccionarlos!
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
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
                        !it.owned && "bg-card/20 opacity-30"
                      )}
                      style={{
                        borderColor: it.owned ? cfg.hex : undefined,
                        boxShadow: it.equipped ? `0 0 20px ${cfg.hex}60` : undefined,
                      }}
                    >
                      <AvatarSvg
                        base={u.avatarBase}
                        skinTone={u.skinTone}
                        hat={it.type === "hat" ? { id: it.id, name: it.name, type: "hat", rarity: it.rarity, description: it.description, render: (() => null) as any } : undefined}
                        size={50}
                      />
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
        )}

        {/* === TAB: MARCOS === */}
        {activeTab === "frames" && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Marcos de perfil</h2>
            <p className="text-xs text-muted-foreground mb-4">Desbloquea nuevos marcos cada 10 niveles. Equípalos para personalizar tu icono de perfil.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profile.frames.map((f) => {
                const locked = !f.unlocked
                return (
                  <motion.button
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={!locked ? { scale: 1.03 } : {}}
                    disabled={locked || equipProfileMut.isPending}
                    onClick={() => equipProfileMut.mutate({ type: "frame", key: f.id })}
                    className={cn(
                      "relative rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all",
                      f.equipped ? "border-primary bg-primary/15" : locked ? "border-border/40 bg-card/20 opacity-60" : "border-border/60 bg-card/40 hover:border-primary/40"
                    )}
                    style={f.equipped ? { boxShadow: `0 0 20px ${f.hex}80` } : undefined}
                  >
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                        {FRAMES_BY_ID[f.id]?.render()}
                      </svg>
                      <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center text-2xl">
                        {u.profileIconEmoji}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-center" style={{ color: f.hex }}>{f.name}</div>
                    <div className="text-[9px] text-muted-foreground text-center">{f.description}</div>
                    {locked && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-card/80 border border-border/60 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    {locked && (
                      <div className="text-[10px] text-amber-300 mt-1 font-mono">Nivel {f.unlockLevel}</div>
                    )}
                    {f.equipped && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </section>
        )}

        {/* === TAB: ICONOS === */}
        {activeTab === "icons" && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Iconos de perfil</h2>
            <p className="text-xs text-muted-foreground mb-4">Elige el icono que aparecerá en tu perfil. Desbloquea más subiendo de nivel.</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {profile.icons.map((icon) => {
                const locked = !icon.unlocked
                return (
                  <motion.button
                    key={icon.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={!locked ? { scale: 1.1 } : {}}
                    disabled={locked || equipProfileMut.isPending}
                    onClick={() => equipProfileMut.mutate({ type: "icon", key: icon.id })}
                    className={cn(
                      "relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all",
                      icon.equipped ? "border-primary bg-primary/15" : locked ? "border-border/40 bg-card/20 opacity-50" : "border-border/60 bg-card/40 hover:border-primary/40"
                    )}
                    style={icon.equipped ? { boxShadow: "0 0 20px rgba(255,45,45,0.5)" } : undefined}
                  >
                    <span className={cn("text-3xl", locked && "blur-sm grayscale")}>{icon.emoji}</span>
                    <span className="text-[9px] text-center font-medium leading-tight mt-1">{icon.name}</span>
                    {locked && (
                      <>
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-card/80 border border-border/60 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="text-[9px] text-amber-300 mt-0.5 font-mono">Nv {icon.unlockLevel}</div>
                      </>
                    )}
                    {icon.equipped && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function StatBlock({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="rounded-xl bg-card/60 border border-border/60 p-2 text-center">
      <div className={cn("flex justify-center mb-1", color)}>{icon}</div>
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 min-w-[80px] py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5",
        active ? "bg-primary text-primary-foreground" : "bg-card/60 border border-border/60 hover:bg-card"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
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
