"use client"

// ===============================================================
// Trivials Wars — Sistema de Audio "Aquatic Ambience"
// Síntesis procedural con Web Audio API (sin archivos externos)
//
// FX:
//   - waterDrop     → click de botón / hover sutil
//   - correctChime  → respuesta correcta (arpegio cristalino C-E-G)
//   - wrongBuzz     → respuesta incorrecta (buzz grave descendente)
//   - comboSweep    → combo bioluminiscente (sweep ascendente + shimmer)
//   - levelUp       → subida de nivel (arpegio C-E-G-C con bell)
//   - heartBreak    → pérdida de vida en supervivencia
//   - gameOver      → fin de partida
//
// Música ambiental:
//   - startAmbient  → pad lo-fi/synthwave acuático (loop infinito)
//   - stopAmbient   → detener
// ===============================================================

type AudioState = {
  ctx: AudioContext | null
  masterGain: GainNode | null
  musicGain: GainNode | null
  sfxGain: GainNode | null
  ambientNodes: AudioNode[]
  ambientPlaying: boolean
  enabled: boolean
  musicEnabled: boolean
  masterVolume: number // GDD V3.0: volumen maestro (0..1)
}

const state: AudioState = {
  ctx: null,
  masterGain: null,
  musicGain: null,
  sfxGain: null,
  ambientNodes: [],
  ambientPlaying: false,
  enabled: true,
  musicEnabled: true,
  masterVolume: 1,
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!state.ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      state.ctx = new AC()
      state.masterGain = state.ctx.createGain()
      state.masterGain.gain.value = 0.6
      state.masterGain.connect(state.ctx.destination)

      state.musicGain = state.ctx.createGain()
      state.musicGain.gain.value = 0.18
      state.musicGain.connect(state.masterGain)

      state.sfxGain = state.ctx.createGain()
      state.sfxGain.gain.value = 0.7
      state.sfxGain.connect(state.masterGain)
    } catch (e) {
      console.warn("AudioContext no disponible", e)
      return null
    }
  }
  // Resume if suspended (autoplay policy)
  if (state.ctx && state.ctx.state === "suspended") {
    void state.ctx.resume()
  }
  return state.ctx
}

// ============= UTILIDADES =============

function makeReverb(ctx: AudioContext, seconds = 1.8, decay = 2): ConvolverNode {
  const convolver = ctx.createConvolver()
  const rate = ctx.sampleRate
  const length = Math.floor(rate * seconds)
  const impulse = ctx.createBuffer(2, length, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  convolver.buffer = impulse
  return convolver
}

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  startTime = 0,
  gainPeak = 0.5,
  gainEnd = 0.0001,
  destination?: AudioNode,
) {
  const t0 = ctx.currentTime + startTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.01)
  gain.gain.exponentialRampToValueAtTime(gainEnd, t0 + duration)
  osc.connect(gain)
  gain.connect(destination ?? state.sfxGain ?? ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

// ============= FX (efectos cortos) =============

/** Gota de agua cristalina — click sutil de botón */
export function playWaterDrop(): void {
  if (!state.enabled) return
  const ctx = getCtx()
  if (!ctx || !state.sfxGain) return

  // Pitch sweep descendente con sine (gota)
  const t0 = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(1800, t0)
  osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.18)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25)

  // Reverb sutil
  const reverb = makeReverb(ctx, 0.8, 3)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.4
  osc.connect(gain)
  gain.connect(state.sfxGain)
  gain.connect(reverb)
  reverb.connect(reverbGain)
  reverbGain.connect(state.sfxGain)

  osc.start(t0)
  osc.stop(t0 + 0.3)
}

/** Respuesta correcta — arpegio cristalino C5-E5-G5 + bell */
export function playCorrectChime(): void {
  if (!state.enabled) return
  const ctx = getCtx()
  if (!ctx || !state.sfxGain) return

  // Arpegio C5-E5-G5 con timbre de campana (sine + harmonic)
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    // Tono principal
    playTone(ctx, freq, 0.45, "sine", i * 0.08, 0.3, 0.0001)
    // Armónico (bell timbre)
    playTone(ctx, freq * 2, 0.35, "sine", i * 0.08, 0.1, 0.0001)
  })

  // Reverb tail
  const t0 = ctx.currentTime
  const reverb = makeReverb(ctx, 1.2, 2.5)
  const tail = ctx.createOscillator()
  const tailGain = ctx.createGain()
  tail.type = "sine"
  tail.frequency.value = 1046.5 // C6
  tailGain.gain.setValueAtTime(0.0001, t0 + 0.3)
  tailGain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.32)
  tailGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.3)
  tail.connect(tailGain)
  tailGain.connect(reverb)
  reverb.connect(state.sfxGain)
  tail.start(t0 + 0.3)
  tail.stop(t0 + 1.4)
}

/** Respuesta incorrecta — buzz grave descendente */
export function playWrongBuzz(): void {
  if (!state.enabled) return
  const ctx = getCtx()
  if (!ctx || !state.sfxGain) return

  const t0 = ctx.currentTime
  // Tono principal descendente (sawtooth suave)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 600
  osc.type = "triangle"
  osc.frequency.setValueAtTime(220, t0)
  osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.4)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(state.sfxGain)
  osc.start(t0)
  osc.stop(t0 + 0.5)
}

/** Combo bioluminiscente — sweep ascendente + shimmer */
export function playComboSweep(): void {
  if (!state.enabled) return
  const ctx = getCtx()
  if (!ctx || !state.sfxGain) return

  const t0 = ctx.currentTime
  // Sweep principal (sine subiendo de 600 a 2400)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(600, t0)
  osc.frequency.exponentialRampToValueAtTime(2400, t0 + 0.5)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7)
  osc.connect(gain)
  gain.connect(state.sfxGain)
  osc.start(t0)
  osc.stop(t0 + 0.8)

  // Shimmer armónico (altas frecuencias en campana)
  for (let i = 0; i < 4; i++) {
    const freq = 1600 + i * 400
    playTone(ctx, freq, 0.3, "sine", 0.1 + i * 0.05, 0.08, 0.0001)
  }

  // Reverb tail
  const reverb = makeReverb(ctx, 1.5, 2)
  const tail = ctx.createOscillator()
  const tailGain = ctx.createGain()
  tail.type = "sine"
  tail.frequency.value = 3200
  tailGain.gain.setValueAtTime(0.0001, t0 + 0.4)
  tailGain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.42)
  tailGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4)
  tail.connect(tailGain)
  tailGain.connect(reverb)
  reverb.connect(state.sfxGain)
  tail.start(t0 + 0.4)
  tail.stop(t0 + 1.5)
}

/** Level up — arpegio ascendente C-E-G-C con bell */
export function playLevelUp(): void {
  if (!state.enabled) return
  const ctx = getCtx()
  if (!ctx || !state.sfxGain) return

  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    playTone(ctx, freq, 0.5, "sine", i * 0.1, 0.3, 0.0001)
    playTone(ctx, freq * 2, 0.4, "sine", i * 0.1, 0.1, 0.0001)
    playTone(ctx, freq * 3, 0.3, "sine", i * 0.1, 0.04, 0.0001)
  })
}

/** Corazón perdido en supervivencia */
export function playHeartBreak(): void {
  if (!state.enabled) return
  const ctx = getCtx()
  if (!ctx || !state.sfxGain) return

  const t0 = ctx.currentTime
  // Dos tonos cortos descendentes (cristal quebrándose)
  playTone(ctx, 880, 0.12, "triangle", 0, 0.25, 0.0001)
  playTone(ctx, 440, 0.2, "triangle", 0.08, 0.2, 0.0001)
}

/** Game over — cascada descendente */
export function playGameOver(): void {
  if (!state.enabled) return
  const ctx = getCtx()
  if (!ctx || !state.sfxGain) return

  const notes = [783.99, 659.25, 523.25, 392.0]
  notes.forEach((freq, i) => {
    playTone(ctx, freq, 0.4, "sine", i * 0.12, 0.2, 0.0001)
  })
}

// ============= MÚSICA AMBIENTAL (DELEGADA A YOUTUBE) =============
//
// La música ambiental ahora se reproduce desde YouTube (Lofi Girl 24/7
// stream — sin copyright, libre escucha) a través del componente
// <LofiPlayer />. Estas funciones son NO-OP pero se mantienen por
// compatibilidad con el hook useAudio.

export function startAmbientMusic(): void {
  // No-op: la música la controla el componente LofiPlayer
}

export function stopAmbientMusic(): void {
  // No-op: la música la controla el componente LofiPlayer
}

// ============= API pública =============

export function setSfxEnabled(enabled: boolean): void {
  state.enabled = enabled
  if (state.sfxGain && state.ctx) {
    state.sfxGain.gain.setValueAtTime(enabled ? 0.7 : 0, state.ctx.currentTime)
  }
}

export function setMusicEnabled(enabled: boolean): void {
  state.musicEnabled = enabled
  if (enabled) {
    startAmbientMusic()
  } else {
    stopAmbientMusic()
  }
}

// GDD V3.0: control de volumen maestro (0..1)
export function setMasterVolume(volume: number): void {
  const v = Math.max(0, Math.min(1, volume))
  state.masterVolume = v
  if (state.masterGain && state.ctx) {
    state.masterGain.gain.setValueAtTime(v * 0.6, state.ctx.currentTime)
  }
}

export function getMasterVolume(): number {
  return state.masterVolume ?? 1
}

export function isAudioEnabled(): boolean {
  return state.enabled
}

export function isMusicEnabled(): boolean {
  return state.musicEnabled
}

export function isAmbientPlaying(): boolean {
  return state.ambientPlaying
}

/** Inicializar audio tras primer gesto del usuario (autoplay policy) */
export function initAudioOnUserGesture(): void {
  const ctx = getCtx()
  if (ctx && ctx.state === "suspended") {
    void ctx.resume()
  }
}
