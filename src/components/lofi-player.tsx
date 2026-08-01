"use client"

/**
 * LofiPlayer — Reproductor de música lofi desde YouTube (IFrame API)
 *
 * Sustituye al "pitido" procedural anterior por una transmisión real de lofi
 * sin copyright desde YouTube. El widget se muestra como thumbnail pequeño
 * en la esquina inferior derecha, expandible al hacer hover.
 *
 * IDs de referencia (todos son streams/videos de lofi sin copyright o de libre
 * escucha en YouTube):
 *   - jfKfPfyJRdk → Lofi Girl 24/7 (estable, years online)
 *   - 4xDzrJKXOOY → Lofi Girl "beats to sleep/chill"
 *   - rUxyKA_-grg → Lofi canon (no copyright lofi)
 *
 * Usamos por defecto el stream Lofi Girl 24/7 (jfKfPfyJRdk) por ser el más estable.
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

// ID del video de YouTube — Lofi Girl 24/7 stream
const LOFI_VIDEO_ID = "jfKfPfyJRdk"

// Tipos mínimos para YT API
declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

type PlayerState = "loading" | "ready" | "playing" | "paused" | "error"

let apiLoadPromise: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.YT && window.YT.Player) return Promise.resolve()
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise<void>((resolve) => {
    const existing = document.getElementById("yt-iframe-api")
    if (!existing) {
      const tag = document.createElement("script")
      tag.id = "yt-iframe-api"
      tag.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(tag)
    }
    // Poll until YT.Player exists
    const check = () => {
      if (window.YT && window.YT.Player) {
        resolve()
      } else {
        setTimeout(check, 80)
      }
    }
    check()
  })
  return apiLoadPromise
}

export type LofiPlayerHandle = {
  play: () => void
  pause: () => void
  setVolume: (v: number) => void
  isPlaying: () => boolean
}

type LofiPlayerProps = {
  enabled: boolean
  volume: number // 0..1
  onStateChange?: (state: PlayerState) => void
  className?: string
}

export function LofiPlayer({ enabled, volume, onStateChange, className }: LofiPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<any>(null)
  const [state, setState] = useState<PlayerState>("loading")
  const [expanded, setExpanded] = useState(false)
  const readyRef = useRef(false)

  const updateState = useCallback(
    (s: PlayerState) => {
      setState(s)
      onStateChange?.(s)
    },
    [onStateChange],
  )

  // Init player once
  useEffect(() => {
    let cancelled = false
    loadYouTubeAPI().then(() => {
      if (cancelled || !containerRef.current) return
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: LOFI_VIDEO_ID,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            loop: 1,
            playlist: LOFI_VIDEO_ID,
            playsinline: 1,
            rel: 0,
            iv_load_policy: 3,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: () => {
              readyRef.current = true
              updateState("ready")
              // Set initial volume
              try {
                playerRef.current?.setVolume?.(Math.round(volume * 100))
              } catch {
                // noop
              }
            },
            onStateChange: (e: any) => {
              const YT = window.YT
              if (!YT) return
              if (e.data === YT.PlayerState.PLAYING) updateState("playing")
              else if (e.data === YT.PlayerState.PAUSED) updateState("paused")
              else if (e.data === YT.PlayerState.ENDED) {
                // loop manually (loop=1 should handle but safety)
                try {
                  playerRef.current?.seekTo?.(0)
                  playerRef.current?.playVideo?.()
                } catch {
                  // noop
                }
              }
            },
            onError: () => updateState("error"),
          },
        })
      } catch (e) {
        console.warn("LofiPlayer init error", e)
        updateState("error")
      }
    })

    return () => {
      cancelled = true
      try {
        if (playerRef.current && typeof playerRef.current.destroy === "function") {
          playerRef.current.destroy()
        }
      } catch {
        // noop
      }
      playerRef.current = null
      readyRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to `enabled` toggling
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return
    try {
      if (enabled) {
        playerRef.current.playVideo?.()
      } else {
        playerRef.current.pauseVideo?.()
      }
    } catch {
      // noop
    }
  }, [enabled])

  // React to volume changes (0..1 → 0..100)
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return
    try {
      // Volume 0 also mutes; otherwise unmute and set
      const v = Math.round(Math.max(0, Math.min(1, volume)) * 100)
      if (v === 0) {
        playerRef.current.mute?.()
      } else {
        playerRef.current.unMute?.()
        playerRef.current.setVolume?.(v)
      }
    } catch {
      // noop
    }
  }, [volume])

  return (
    <div
      className={cn(
        "yt-lofi-widget",
        expanded && "yt-lofi-widgetExpanded",
        !enabled && "opacity-50",
        className,
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={(e) => {
        e.stopPropagation()
        setExpanded((v) => !v)
      }}
      title="Música Lofi · YouTube (sin copyright)"
      aria-label="Reproductor de música lofi"
    >
      <div ref={containerRef} />
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white text-[9px] font-bold uppercase tracking-wider">
          cargando…
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#5C0A1F] text-white text-[9px] font-bold uppercase tracking-wider">
          error
        </div>
      )}
      {state === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[9px] font-bold uppercase tracking-wider pointer-events-none">
          pausa
        </div>
      )}
    </div>
  )
}
