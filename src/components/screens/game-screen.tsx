"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CATEGORIES, DIFFICULTIES, SURVIVAL_CONFIG, SUDDEN_DEATH_CONFIG } from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useAnswerQuestion, useEndSession } from "@/hooks/use-game"
import { useAudio } from "@/hooks/use-audio"
import { Check, X, Zap, Flame, ChevronRight, ChevronLeft, Clock, Heart, Info, Skull } from "lucide-react"
import { cn } from "@/lib/utils"

type Phase = "question" | "feedback"

export function GameScreen() {
  const {
    activeGame,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    correctCount,
    addCorrect,
    totalXpEarned,
    addXp,
    currentStreak,
    setStreak,
    bestStreak,
    setBestStreak,
    lives,
    loseLife,
    lastAnswer,
    setLastAnswer,
    survivalEnded,
    setSurvivalEnded,
    suddenDeathEnded,
    setSuddenDeathEnded,
    setLastSessionResult,
    endGame,
    setScreen,
  } = useGameStore()

  const answerMut = useAnswerQuestion()
  const endSessionMut = useEndSession()
  const { sfx } = useAudio()

  const [timeLeft, setTimeLeft] = useState(0)
  const [phase, setPhase] = useState<Phase>("question")
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showCombo, setShowCombo] = useState(false)
  const [heartLostIndex, setHeartLostIndex] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentQuestion = activeGame?.questions[currentQuestionIndex]
  const diff = DIFFICULTIES.find((d) => d.id === activeGame?.difficulty)
  const cat = CATEGORIES.find((c) => c.id === activeGame?.category)
  const isSurvival = activeGame?.mode === "survival"
  const isSuddenDeath = activeGame?.mode === "suddendeath"
  const isEndless = isSurvival || isSuddenDeath
  const isMix = activeGame?.category === "mix"

  // Tiempo total de la pregunta actual:
  // - Classic: activeGame.timePerQuestion (puede ser 0 = sin tiempo)
  // - Survival: tiempo decreciente según correctCount
  // - Sudden Death: tiempo fijo 15s
  const totalTime = isSurvival
    ? SURVIVAL_CONFIG.currentTime(correctCount)
    : isSuddenDeath
      ? SUDDEN_DEATH_CONFIG.timePerQuestion
      : activeGame?.timePerQuestion ?? 30
  const hasTimer = totalTime > 0

  // GDD V3.0: Alerta dorada tras 10 aciertos seguidos en Muerte Súbita
  const isGoldenAlert = isSuddenDeath && correctCount >= SUDDEN_DEATH_CONFIG.alertStreakThreshold

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!activeGame || !currentQuestion || phase !== "question") return
      if (timerRef.current) clearInterval(timerRef.current)
      setSelectedAnswer(answer)
      setPhase("feedback")

      answerMut.mutate(
        {
          sessionId: activeGame.sessionId,
          questionId: currentQuestion.id,
          selectedAnswer: answer,
          timeRemaining: timeLeft,
          totalTime,
          streak: currentStreak,
          lives,
          mode: activeGame.mode,
        },
        {
          onSuccess: (resp) => {
            setLastAnswer(resp)
            if (resp.isCorrect) {
              addCorrect()
              const newStreak = currentStreak + 1
              setStreak(newStreak)
              setBestStreak(newStreak)
              sfx.correct()
              // Combo animation + sound when reaching thresholds
              if (isSuddenDeath) {
                // GDD V3.0: combos sudden death en 5, 10, 15
                if (newStreak === 5 || newStreak === 10 || newStreak === 15) {
                  setShowCombo(true)
                  sfx.combo()
                  setTimeout(() => setShowCombo(false), 1500)
                }
              } else if (isSurvival) {
                if (newStreak === 3 || newStreak === 5) {
                  setShowCombo(true)
                  sfx.combo()
                  setTimeout(() => setShowCombo(false), 1500)
                }
              }
            } else {
              setStreak(0)
              sfx.wrong()
              // Survival: pierde 1 vida, sólo termina si lives=0
              if (isSurvival) {
                setHeartLostIndex(lives - 1)
                sfx.heartBreak()
                loseLife()
                if (lives - 1 <= 0) {
                  setSurvivalEnded(true)
                  sfx.gameOver()
                }
              } else if (isSuddenDeath) {
                // GDD V3.0: 1 fallo = fin inmediato
                setSuddenDeathEnded(true)
                sfx.gameOver()
              }
            }
            addXp(resp.xpGained)
            if (resp.levelUp) {
              setShowLevelUp(true)
              sfx.levelUp()
              setTimeout(() => setShowLevelUp(false), 2500)
            }
          },
        }
      )
    },
    [activeGame, currentQuestion, phase, timeLeft, totalTime, currentStreak, lives, answerMut, addCorrect, addXp, setBestStreak, setLastAnswer, setStreak, setSurvivalEnded, setSuddenDeathEnded, loseLife, sfx, isSurvival, isSuddenDeath]
  )

  // Ref para que el timer siempre llame a la última versión de handleAnswer
  const handleAnswerRef = useRef(handleAnswer)
  useEffect(() => {
    handleAnswerRef.current = handleAnswer
  }, [handleAnswer])

  useEffect(() => {
    if (!currentQuestion || phase !== "question") return
    setTimeLeft(totalTime)
    setSelectedAnswer(null)
    setPhase("question")
    setHeartLostIndex(null)

    if (hasTimer) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 0.1) {
            if (timerRef.current) clearInterval(timerRef.current)
            handleAnswerRef.current("")
            return 0
          }
          return t - 0.1
        })
      }, 100)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentQuestionIndex, activeGame, totalTime, hasTimer])

  const handleNext = () => {
    if (!activeGame) return
    // En modos endless, si ya terminó, ir a resultados
    if ((isSurvival && survivalEnded) || (isSuddenDeath && suddenDeathEnded)) {
      endSessionMut.mutate(
        { sessionId: activeGame.sessionId, mode: activeGame.mode },
        {
          onSuccess: (data) => {
            setLastSessionResult(data)
          },
        }
      )
      endGame()
      return
    }
    const nextIdx = currentQuestionIndex + 1
    if (nextIdx >= activeGame.questions.length) {
      endSessionMut.mutate(
        { sessionId: activeGame.sessionId, mode: activeGame.mode },
        {
          onSuccess: (data) => {
            setLastSessionResult(data)
          },
        }
      )
      endGame()
    } else {
      setCurrentQuestionIndex(nextIdx)
      setPhase("question")
    }
  }

  const handleAbort = () => {
    if (activeGame) {
      endSessionMut.mutate(
        { sessionId: activeGame.sessionId, mode: activeGame.mode },
        {
          onSuccess: (data) => {
            setLastSessionResult(data)
          },
        }
      )
    }
    endGame()
  }

  if (!activeGame || !currentQuestion || !diff) {
    return <div className="p-8 text-center text-[#8090C0]">Cargando partida…</div>
  }

  // Mix: usa un color cian por defecto
  const catColor = isMix ? "#00E5FF" : (cat?.color ?? "#38BDF8")
  const catIcon = isMix ? "🔀" : (cat?.icon ?? "🎯")
  const catName = isMix ? "Mix Aleatorio" : (cat?.name ?? "—")

  const ratio = hasTimer ? timeLeft / totalTime : 1
  const timerColor = !hasTimer
    ? "#00E5FF"
    : isGoldenAlert
      ? "#FFEA00"  // dorado en alerta
      : ratio > 0.6
        ? "#10b981"
        : ratio > 0.3
          ? "#FFEA00"
          : "#fb7185"
  const isUrgent = hasTimer && ratio <= 0.3

  // Combo multiplier actual para display
  const currentCombo = isSuddenDeath
    ? SUDDEN_DEATH_CONFIG.comboMultiplier(currentStreak)
    : isSurvival
      ? SURVIVAL_CONFIG.comboMultiplier(currentStreak)
      : 1

  // En modos endless, mostrar "pregunta N" sin progreso porcentual
  const progressPct = isEndless
    ? Math.min(100, ((currentQuestionIndex + (phase === "feedback" ? 1 : 0)) / Math.max(activeGame.questions.length, 1)) * 100)
    : ((currentQuestionIndex + (phase === "feedback" ? 1 : 0)) / activeGame.questions.length) * 100

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-colors duration-700",
        isGoldenAlert && "sudden-death-alert-bg"
      )}
    >
      {/* Header compacto */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#131838]/60 border-b border-[#252B5C]/50">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleAbort}
              className="p-1.5 rounded-lg hover:bg-[#131838]/80 transition"
              title="Salir"
            >
              <ChevronLeft className="w-4 h-4 text-[#8090C0]" />
            </button>

            {/* Center: category + progress */}
            <div className="flex-1 flex items-center justify-center gap-2">
              <span className="text-xl">{catIcon}</span>
              <div className="leading-tight">
                <div className="text-xs font-bold" style={{ color: catColor }}>{catName}</div>
                <div className="text-[9px] text-[#8090C0]">
                  {isSurvival
                    ? `Sobreviviendo: ${currentQuestionIndex + 1}`
                    : isSuddenDeath
                      ? `Racha: ${correctCount} · ${currentQuestionIndex + 1}`
                      : `${currentQuestionIndex + 1} / ${activeGame.questions.length}`}
                </div>
              </div>
            </div>

            {/* Right: XP + streak */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#8090C0]/10 border border-blue-400/40">
                <Zap className="w-3 h-3 text-[#8090C0]" />
                <span className="text-xs font-bold text-[#8090C0] tabular-nums">{totalXpEarned}</span>
              </div>
              {currentStreak >= 2 && (
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg border",
                    isGoldenAlert
                      ? "bg-[#FFEA00]/20 border-[#FFEA00]/60 animate-gold-pulse"
                      : currentCombo >= 3
                        ? "bg-[#39FF14]/20 border-[#39FF14]/60/60"
                        : currentCombo === 2
                          ? "bg-[#8090C0]/20 border-blue-400/60"
                          : "bg-[#FFB300]/15 border-[#FFB300]/40"
                  )}
                >
                  <Flame
                    className="w-3 h-3"
                    style={{
                      color: isGoldenAlert
                        ? "#FFEA00"
                        : currentCombo >= 2
                          ? "#10b981"
                          : "#fb923c",
                    }}
                  />
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{
                      color: isGoldenAlert
                        ? "#b45309"
                        : currentCombo >= 2
                          ? "#059669"
                          : "#c2410c",
                    }}
                  >
                    {currentStreak}{currentCombo > 1 ? ` ×${currentCombo}` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vidas en modo supervivencia */}
          {isSurvival && (
            <div className="mt-2 flex items-center justify-center gap-1.5">
              {Array.from({ length: SURVIVAL_CONFIG.initialLives }).map((_, i) => {
                const isAlive = i < lives
                const isJustLost = heartLostIndex === i
                return (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={isJustLost ? { scale: [1, 1.4, 0.6], opacity: [1, 0.7, 0.25] } : { scale: 1, opacity: isAlive ? 1 : 0.25 }}
                    transition={{ duration: 0.5 }}
                    className={cn(isAlive && "animate-heart-pulse")}
                  >
                    <Heart
                      className="w-5 h-5"
                      style={{
                        color: isAlive ? "#fb7185" : "#9f1239",
                        fill: isAlive ? "#fb7185" : "transparent",
                        filter: isAlive ? "drop-shadow(0 0 6px rgba(251,113,133,0.65))" : "none",
                      }}
                    />
                  </motion.div>
                )
              })}
              <span className="ml-2 text-[10px] uppercase tracking-wider text-[#8090C0]">Vidas</span>
            </div>
          )}

          {/* Vida en Muerte Súbita — 1 solo cráneo dorado */}
          {isSuddenDeath && (
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <motion.div
                initial={false}
                animate={suddenDeathEnded
                  ? { scale: [1, 1.4, 0.6], opacity: [1, 0.7, 0.25] }
                  : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.5 }}
                className={cn(!suddenDeathEnded && "animate-gold-pulse")}
              >
                <Skull
                  className="w-5 h-5"
                  style={{
                    color: suddenDeathEnded ? "#FFEA00" : "#FFEA00",
                    fill: suddenDeathEnded ? "transparent" : "#FFEA00",
                    filter: suddenDeathEnded ? "none" : "drop-shadow(0 0 6px rgba(255,234,0,0.75))",
                  }}
                />
              </motion.div>
              <span className="ml-2 text-[10px] uppercase tracking-wider text-[#FFEA00]/80">
                {suddenDeathEnded ? "Sin vidas" : "1 vida · 1 fallo = fin"}
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full bg-blue-100/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isSuddenDeath
                  ? "linear-gradient(90deg, #FFEA00, #FFEA00, #FFEA00)"
                  : isSurvival
                    ? "linear-gradient(90deg, #fb7185, #38BDF8)"
                    : "linear-gradient(90deg, #4ADE80, #38BDF8, #2dd4bf)",
              }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 flex flex-col">
        {/* Banner dorado de alerta (Sudden Death tras 10 aciertos) */}
        <AnimatePresence>
          {isGoldenAlert && !suddenDeathEnded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 rounded-2xl border-2 border-[#FFEA00]/70 bg-[#FFEA00]/15 p-3 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-[#FFEA00]">
                <Skull className="w-5 h-5" />
                <span className="font-black text-sm uppercase tracking-widest">¡Zona de Alerta Dorada!</span>
                <Skull className="w-5 h-5" />
              </div>
              <div className="text-[10px] text-[#FFEA00] mt-0.5">
                Llevás {correctCount} aciertos seguidos — un fallo y se acaba la racha
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer compacto */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-[#8090C0]">
            <Clock className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Tiempo</span>
          </div>
          <div className="flex-1 h-2.5 rounded-full bg-blue-100/60 overflow-hidden border border-[#252B5C]/50">
            {hasTimer && (
              <motion.div
                className="h-full rounded-full"
                style={{ background: timerColor, boxShadow: `0 0 8px ${timerColor}` }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            )}
            {!hasTimer && (
              <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400/40 to-sky-400/40" />
            )}
          </div>
          <div
            className={cn("font-mono font-black tabular-nums w-14 text-right", isUrgent && "animate-pulse")}
            style={{ color: timerColor, fontSize: isUrgent ? "1.4rem" : "1.1rem" }}
          >
            {hasTimer ? `${timeLeft.toFixed(1)}s` : "∞"}
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border bg-[#131838]/80 backdrop-blur-sm p-5 sm:p-7 mb-5 glass"
            style={{ borderColor: `${catColor}40`, boxShadow: `0 0 25px ${catColor}15` }}
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8090C0] mb-3 justify-center">
              <span
                className="px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40` }}
              >
                {isSurvival
                  ? `Supervivencia · ${totalTime}s`
                  : isSuddenDeath
                    ? `☠ Muerte Súbita · ${totalTime}s`
                    : `${diff.name} · ${hasTimer ? `${totalTime}s` : "sin tiempo"}`}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-center leading-snug text-[#C8D0F0]">
              {currentQuestion.question}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options grid 2x2 con etiquetas A/B/C/D */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx)
            const isCorrectAnswer = lastAnswer?.isCorrect !== undefined && option === lastAnswer.correctAnswer
            const isSelected = selectedAnswer === option
            const showCorrect = phase === "feedback" && isCorrectAnswer
            const showWrong = phase === "feedback" && isSelected && !isCorrectAnswer

            return (
              <motion.button
                key={option + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * idx }}
                disabled={phase !== "question"}
                onClick={() => {
                  sfx.waterDrop()
                  handleAnswer(option)
                }}
                className={cn(
                  "relative text-left rounded-2xl border p-3.5 transition-all overflow-hidden flex items-center gap-3",
                  phase === "question" && "border-[#252B5C]/60 bg-[#131838]/70 hover:bg-[#131838]/95 hover:border-blue-400/60 cursor-pointer",
                  showCorrect && "border-[#39FF14]/60 bg-emerald-50 glow-emerald",
                  showWrong && "border-[#FF3366]/60 bg-[#FF3366]/10",
                  phase === "feedback" && !showCorrect && !showWrong && "border-[#252B5C]/40 bg-[#131838]/40 opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 font-black text-sm border",
                    phase === "question" && "border-[#252B5C]/60 bg-blue-100/60 text-[#8090C0]",
                    showCorrect && "border-[#39FF14]/60 bg-[#39FF14]/30 text-emerald-900",
                    showWrong && "border-[#FF3366]/60 bg-[#FF3366]/30 text-[#0A0E27]",
                    phase === "feedback" && !showCorrect && !showWrong && "border-[#252B5C]/40 bg-blue-100/30 text-[#4A5BA8]"
                  )}
                >
                  {showCorrect ? <Check className="w-4 h-4" /> : showWrong ? <X className="w-4 h-4" /> : letter}
                </span>
                <span className="font-medium text-sm sm:text-base break-words flex-1 text-[#C8D0F0]">{option}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Feedback panel compacto */}
        <AnimatePresence>
          {phase === "feedback" && lastAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-5"
            >
              <div className={cn(
                "rounded-2xl border p-3.5 mb-3 glass",
                lastAnswer.isCorrect
                  ? "border-emerald-300/60 bg-emerald-50/70"
                  : "border-[#FF3366]/60 bg-[#FF3366]/10"
              )}>
                <div className="flex items-center gap-2">
                  {lastAnswer.isCorrect ? (
                    <><Check className="w-4 h-4 text-[#00B377]" /><span className="font-bold text-sm text-[#00B377]">¡Correcto!</span></>
                  ) : (
                    <><X className="w-4 h-4 text-[#FF3366]" /><span className="font-bold text-sm text-[#FF2D95]">Incorrecto</span></>
                  )}
                  {lastAnswer.xpGained > 0 && (
                    <span className="ml-auto text-sm font-mono font-bold text-[#FFEA00]">+{lastAnswer.xpGained} XP{lastAnswer.xpBreakdown.combo && lastAnswer.xpBreakdown.combo > 1 ? ` ×${lastAnswer.xpBreakdown.combo}` : ""}</span>
                  )}
                </div>
                {!lastAnswer.isCorrect && (
                  <div className="text-xs text-[#8090C0] mt-1.5">
                    Respuesta: <span className="font-bold text-[#C8D0F0]">{lastAnswer.correctAnswer}</span>
                  </div>
                )}
                {/* Explicación del dato */}
                {lastAnswer.explanation && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-[#8090C0] bg-blue-50/70 border border-[#252B5C]/50 rounded-lg p-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#8090C0]" />
                    <span className="leading-snug">{lastAnswer.explanation}</span>
                  </div>
                )}
                {lastAnswer.xpBreakdown && lastAnswer.isCorrect && (lastAnswer.xpBreakdown.timeBonus > 0 || lastAnswer.xpBreakdown.streakBonus > 0 || lastAnswer.xpBreakdown.difficultyBonus > 0) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[#8090C0] mt-2 font-mono">
                    <span>Base: +{lastAnswer.xpBreakdown.base}</span>
                    {lastAnswer.xpBreakdown.timeBonus > 0 && <span className="text-[#8090C0]">+{lastAnswer.xpBreakdown.timeBonus} tiempo</span>}
                    {lastAnswer.xpBreakdown.streakBonus > 0 && <span className="text-[#00B377]">+{lastAnswer.xpBreakdown.streakBonus} combo</span>}
                    {lastAnswer.xpBreakdown.difficultyBonus > 0 && <span className="text-[#B026FF]">+{lastAnswer.xpBreakdown.difficultyBonus} dificultad</span>}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  sfx.waterDrop()
                  handleNext()
                }}
                className="w-full py-3.5 rounded-2xl font-bold uppercase tracking-widest text-sm crystal-bubble text-white hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                {((isSurvival && survivalEnded) || (isSuddenDeath && suddenDeathEnded)) || currentQuestionIndex + 1 >= activeGame.questions.length
                  ? "Ver resultados"
                  : "Siguiente"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Combo toast */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div
              className="px-6 py-3 rounded-2xl font-fancy italic font-bold tracking-wide text-lg"
              style={{
                background: isSuddenDeath
                  ? "linear-gradient(135deg, #FFEA00, #C77D00)"
                  : "linear-gradient(135deg, #00FFB3, #00E5FF)",
                color: isSuddenDeath ? "#0A0E27" : "#0A0E27",
                border: isSuddenDeath
                  ? "2px solid rgba(255,234,0,0.8)"
                  : "2px solid rgba(57,255,20,0.7)",
                boxShadow: isSuddenDeath
                  ? "0 0 30px rgba(255,234,0,0.7)"
                  : "0 0 30px rgba(0,229,255,0.5)",
              }}
            >
              {isSuddenDeath ? "⚡" : "🔥"} COMBO ×{currentCombo}! {isSuddenDeath ? "⚡" : "🔥"}
            </div>
            <div
              className="text-center mt-1 text-xs font-bold"
              style={{ color: isSuddenDeath ? "#b45309" : "#00E5FF" }}
            >
              {isSuddenDeath ? "¡Tensión dorada!" : "¡Combo activado!"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level up toast */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 text-[#FFEA00] px-6 py-3 rounded-2xl font-fancy italic font-bold tracking-wide text-lg glow-gold">
              ⬆ ¡Nivel {lastAnswer?.newLevel}!
            </div>
            <div className="text-center mt-1 text-xs text-[#FFEA00] italic">+1 Loot Box disponible</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
