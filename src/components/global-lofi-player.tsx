"use client"

import { useEffect, useState } from "react"
import { LofiPlayer } from "@/components/lofi-player"
import { useAudio } from "@/hooks/use-audio"
import { getMasterVolume } from "@/lib/audio"

/**
 * GlobalLofiPlayer — Monta el reproductor de lofi de YouTube a nivel global.
 * Lee `musicEnabled` y `volume` del hook useAudio + audio.ts.
 *
 * IMPORTANTE: Browsers bloquean autoplay con sonido. El reproductor se crea
 * en mount, pero YouTube no respetará playVideo() hasta que el usuario haya
 * interactuado con la página. Una vez interactuado, se re-intenta el play.
 */
export function GlobalLofiPlayer() {
  const { musicEnabled } = useAudio()
  const [volume, setVolume] = useState(getMasterVolume())
  const [userInteracted, setUserInteracted] = useState(false)

  // Listen for first user gesture (autoplay policy)
  useEffect(() => {
    const onGesture = () => {
      setUserInteracted(true)
      window.removeEventListener("pointerdown", onGesture)
      window.removeEventListener("keydown", onGesture)
    }
    window.addEventListener("pointerdown", onGesture)
    window.addEventListener("keydown", onGesture)
    return () => {
      window.removeEventListener("pointerdown", onGesture)
      window.removeEventListener("keydown", onGesture)
    }
  }, [])

  // Poll master volume (setMasterVolume is called from audio-toggle slider)
  useEffect(() => {
    const i = setInterval(() => {
      const v = getMasterVolume()
      setVolume((prev) => (prev !== v ? v : prev))
    }, 600)
    return () => clearInterval(i)
  }, [])

  // Only render when user has interacted (so YouTube can autoplay)
  if (!userInteracted) return null

  return (
    <LofiPlayer
      enabled={musicEnabled}
      volume={volume}
    />
  )
}
