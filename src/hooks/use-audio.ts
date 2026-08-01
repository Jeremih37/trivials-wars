"use client"

import { useEffect, useState, useCallback } from "react"
import {
  playWaterDrop,
  playCorrectChime,
  playWrongBuzz,
  playComboSweep,
  playLevelUp,
  playHeartBreak,
  playGameOver,
  setSfxEnabled,
  setMusicEnabled,
  initAudioOnUserGesture,
  isAudioEnabled,
  isMusicEnabled,
} from "@/lib/audio"

const SFX_KEY = "tw:sfxEnabled"
const MUSIC_KEY = "tw:musicEnabled"

/**
 * Hook principal para audio del juego.
 * Persiste preferencias en localStorage y expone funciones de FX.
 *
 * La música ambiental la controla el componente <LofiPlayer /> que se
 * monta en el layout. Este hook sólo persiste el flag `musicEnabled`
 * y `volume` para que el LofiPlayer pueda leerlos.
 */
export function useAudio() {
  const [sfxEnabled, setSfxEnabledState] = useState(true)
  const [musicEnabled, setMusicEnabledState] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Cargar preferencias de localStorage al montar
  useEffect(() => {
    setMounted(true)
    try {
      const sfx = localStorage.getItem(SFX_KEY)
      const music = localStorage.getItem(MUSIC_KEY)
      if (sfx !== null) {
        const v = sfx === "true"
        setSfxEnabledState(v)
        setSfxEnabled(v)
      }
      if (music !== null) {
        const v = music === "true"
        setMusicEnabledState(v)
        setMusicEnabled(v)
      }
    } catch {
      // noop
    }
  }, [])

  // Inicializar audio (SFX) en el primer gesto del usuario (autoplay policy)
  useEffect(() => {
    if (!mounted) return
    const onGesture = () => {
      initAudioOnUserGesture()
      window.removeEventListener("pointerdown", onGesture)
      window.removeEventListener("keydown", onGesture)
    }
    window.addEventListener("pointerdown", onGesture)
    window.addEventListener("keydown", onGesture)
    return () => {
      window.removeEventListener("pointerdown", onGesture)
      window.removeEventListener("keydown", onGesture)
    }
  }, [mounted])

  const toggleSfx = useCallback(() => {
    const next = !isAudioEnabled()
    setSfxEnabled(next)
    setSfxEnabledState(next)
    try {
      localStorage.setItem(SFX_KEY, String(next))
    } catch {
      // noop
    }
    if (next) playWaterDrop()
  }, [])

  const toggleMusic = useCallback(() => {
    const next = !isMusicEnabled()
    setMusicEnabled(next)
    setMusicEnabledState(next)
    try {
      localStorage.setItem(MUSIC_KEY, String(next))
    } catch {
      // noop
    }
  }, [])

  return {
    sfxEnabled,
    musicEnabled,
    toggleSfx,
    toggleMusic,
    // FX directos
    sfx: {
      waterDrop: playWaterDrop,
      correct: playCorrectChime,
      wrong: playWrongBuzz,
      combo: playComboSweep,
      levelUp: playLevelUp,
      heartBreak: playHeartBreak,
      gameOver: playGameOver,
    },
  }
}
