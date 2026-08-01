"use client"

import { Volume2, VolumeX, Music, Music2 } from "lucide-react"
import { useAudio } from "@/hooks/use-audio"
import { cn } from "@/lib/utils"

/**
 * Toggle de audio para poner en el header.
 * Dos botones: SFX (FX de botones) y Música (ambiental).
 */
export function AudioToggle({ compact = false }: { compact?: boolean }) {
  const { sfxEnabled, musicEnabled, toggleSfx, toggleMusic, sfx } = useAudio()

  return (
    <div className={cn("flex items-center gap-1", compact ? "scale-90" : "")}>
      <button
        onClick={() => {
          toggleSfx()
          // Si después del toggle sigue habilitado, reproducir un drop de confirmación
          setTimeout(() => {
            // El toggle ya reproduce el drop si se habilita
          }, 50)
        }}
        title={sfxEnabled ? "Silenciar efectos" : "Activar efectos"}
        className={cn(
          "p-1.5 rounded-lg border transition-colors",
          sfxEnabled
            ? "bg-[#00F5D4]/10 border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4]/20"
            : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted/60",
        )}
      >
        {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => {
          toggleMusic()
          sfx.waterDrop()
        }}
        title={musicEnabled ? "Silenciar música" : "Activar música"}
        className={cn(
          "p-1.5 rounded-lg border transition-colors",
          musicEnabled
            ? "bg-[#00B4D8]/10 border-[#00B4D8]/40 text-[#00B4D8] hover:bg-[#00B4D8]/20"
            : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted/60",
        )}
      >
        {musicEnabled ? <Music className="w-3.5 h-3.5" /> : <Music2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
