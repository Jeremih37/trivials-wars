"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Music, Music2, Volume1 } from "lucide-react"
import { useAudio } from "@/hooks/use-audio"
import { setMasterVolume, getMasterVolume } from "@/lib/audio"
import { cn } from "@/lib/utils"

/**
 * AudioToggle V3.0 — GDD Frutiger Aero Brillante
 * - SFX toggle (FX de botones)
 * - Música ambiental toggle
 * - Slider de volumen sutil
 * Controles compactos para la esquina superior.
 */
export function AudioToggle({ compact = false }: { compact?: boolean }) {
  const { sfxEnabled, musicEnabled, toggleSfx, toggleMusic, sfx } = useAudio()
  const [showVolume, setShowVolume] = useState(false)
  const [volume, setVolume] = useState(getMasterVolume())
  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar el panel de volumen al hacer click fuera
  useEffect(() => {
    if (!showVolume) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowVolume(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showVolume])

  const handleVolumeChange = (v: number) => {
    setVolume(v)
    setMasterVolume(v)
  }

  return (
    <div ref={containerRef} className={cn("relative flex items-center gap-1", compact ? "scale-90" : "")}>
      {/* Botón de volumen con popover */}
      <button
        onClick={() => setShowVolume((v) => !v)}
        title="Volumen"
        className={cn(
          "p-1.5 rounded-lg border transition-colors",
          showVolume
            ? "bg-sky-400/15 border-sky-400/50 text-sky-700"
            : "bg-white/60 border-cyan-200/60 text-sky-700 hover:bg-white/90",
        )}
      >
        {volume === 0 ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : volume < 0.5 ? (
          <Volume1 className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Popover con slider de volumen */}
      {showVolume && (
        <div className="absolute top-full right-0 mt-2 z-50 rounded-2xl glass-strong p-3 shadow-xl min-w-[180px]">
          <div className="text-[10px] uppercase tracking-wider text-sky-700/80 font-bold mb-2">
            Volumen Ambiental
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
            className="w-full accent-sky-500 cursor-pointer"
            style={{ cursor: "pointer" }}
          />
          <div className="flex justify-between text-[9px] text-sky-700/70 mt-1 font-mono">
            <span>0%</span>
            <span className="font-bold">{Math.round(volume * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Botón SFX */}
      <button
        onClick={() => {
          toggleSfx()
          setTimeout(() => {}, 50)
        }}
        title={sfxEnabled ? "Silenciar efectos" : "Activar efectos"}
        className={cn(
          "p-1.5 rounded-lg border transition-colors",
          sfxEnabled
            ? "bg-emerald-400/15 border-emerald-400/50 text-emerald-700 hover:bg-emerald-400/25"
            : "bg-white/40 border-cyan-200/40 text-slate-400 hover:bg-white/60",
        )}
      >
        {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
      </button>

      {/* Botón Música */}
      <button
        onClick={() => {
          toggleMusic()
          sfx.waterDrop()
        }}
        title={musicEnabled ? "Silenciar música" : "Activar música"}
        className={cn(
          "p-1.5 rounded-lg border transition-colors",
          musicEnabled
            ? "bg-sky-400/15 border-sky-400/50 text-sky-700 hover:bg-sky-400/25"
            : "bg-white/40 border-cyan-200/40 text-slate-400 hover:bg-white/60",
        )}
      >
        {musicEnabled ? <Music className="w-3.5 h-3.5" /> : <Music2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
