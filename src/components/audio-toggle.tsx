"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Music, Music2, Volume1 } from "lucide-react"
import { useAudio } from "@/hooks/use-audio"
import { setMasterVolume, getMasterVolume } from "@/lib/audio"
import { cn } from "@/lib/utils"

/**
 * AudioToggle V4.0 — Paleta Neutra
 * - SFX toggle (FX de botones)
 * - Música lofi toggle (YouTube)
 * - Slider de volumen sutil
 *
 * El widget pequeño de YouTube se muestra en la esquina inferior derecha
 * (gestionado por <GlobalLofiPlayer />). Aquí sólo los controles.
 */
export function AudioToggle({ compact = false }: { compact?: boolean }) {
  const { sfxEnabled, musicEnabled, toggleSfx, toggleMusic, sfx } = useAudio()
  const [showVolume, setShowVolume] = useState(false)
  const [volume, setVolume] = useState(getMasterVolume())
  const containerRef = useRef<HTMLDivElement>(null)

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
    <div ref={containerRef} className={cn("relative flex items-center gap-1.5", compact ? "scale-95" : "")}>
      {/* Botón de volumen con popover */}
      <button
        onClick={() => setShowVolume((v) => !v)}
        title="Volumen"
        className={cn(
          "p-2 rounded-xl border transition-all",
          showVolume
            ? "bg-[#8090C0]/15 border-[#8090C0]/40 text-[#C8D0F0]"
            : "bg-[#131838]/70 border-[#8090C0]/40 text-[#C8D0F0] hover:bg-[#131838]/95 hover:border-[#8090C0]/40",
        )}
      >
        {volume === 0 ? (
          <VolumeX className="w-4 h-4" />
        ) : volume < 0.5 ? (
          <Volume1 className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      {/* Popover con slider de volumen */}
      {showVolume && (
        <div className="absolute top-full right-0 mt-2 z-50 rounded-2xl glass-strong p-4 shadow-xl min-w-[200px]">
          <div className="text-[10px] uppercase tracking-wider text-[#8090C0] font-bold mb-2 flex items-center gap-1.5">
            <Volume2 className="w-3 h-3" />
            Volumen Ambiental
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
            className="w-full accent-slate-500 cursor-pointer"
            style={{ cursor: "pointer" }}
          />
          <div className="flex justify-between text-[9px] text-[#8090C0] mt-1 font-mono">
            <span>0%</span>
            <span className="font-bold text-[#C8D0F0]">{Math.round(volume * 100)}%</span>
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
          "p-2 rounded-xl border transition-all",
          sfxEnabled
            ? "bg-[#39FF14]/20 border-[#39FF14]/40 text-[#00B377] hover:bg-[#39FF14]/30"
            : "bg-[#131838]/40 border-[#8090C0]/40 text-[#4A5BA8] hover:bg-[#131838]/60",
        )}
      >
        {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Botón Música */}
      <button
        onClick={() => {
          toggleMusic()
          sfx.waterDrop()
        }}
        title={musicEnabled ? "Silenciar música lofi" : "Activar música lofi"}
        className={cn(
          "p-2 rounded-xl border transition-all",
          musicEnabled
            ? "bg-[#8090C0]/15 border-[#00E5FF]/40 text-[#C8D0F0] hover:bg-[#8090C0]/25"
            : "bg-[#131838]/40 border-[#8090C0]/40 text-[#4A5BA8] hover:bg-[#131838]/60",
        )}
      >
        {musicEnabled ? <Music className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
      </button>
    </div>
  )
}
