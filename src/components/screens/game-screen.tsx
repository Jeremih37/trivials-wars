"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CATEGORIES, DIFFICULTIES, SURVIVAL_CONFIG } from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useAnswerQuestion, useEndSession } from "@/hooks/use-game"
import { useAudio } from "@/hooks/use-audio"
import { Check, X, Zap, Flame, ChevronRight, ChevronLeft, Clock, Heart, Info } from "lucide-react"
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
  const isMix = activeGame?.category === "mix"

  // Tiempo total de la pregunta actual:
  // - Classic: activeGame.timePerQuestion (puede ser 0 = sin tiempo)
  // - Survival: tiempo decreciente según correctCount (GDD: cada 5 aciertos -1s, min 5s)
  const totalTime = isSurvival
    ? SURVIVAL_CONFIG.currentTime(correctCount)
    : activeGame?.timePerQuestion ?? 30
  const hasTimer = totalTime > 0

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
        },
        {
          onSuccess: (resp) => {
            setLastAnswer(resp)
            if (resp.isCorrect) {
              addCorrect()
              const newStreak = currentStreak + 1
              setStreak(newStreak)
              setBestStreak(newStreak)
              // FX: chime de correcto
              sfx.correct()
              // Combo animation + sound when reaching 3 or 5 streak (GDD triggers)
              if (newStreak === 3 || newStreak === 5) {
                setShowCombo(true)
                sfx.combo()
                setTimeout(() => setShowCombo(false), 1500)
              }
            } else {
              setStreak(0)
              // FX: buzz de incorrecto
              sfx.wrong()
              // Survival: lose a life, only end when lives=0
              if (activeGame.mode === "survival") {
                setHeartLostIndex(lives - 1)
                sfx.heartBreak()
                loseLife()
                // Si era la última vida, marcar fin
                if (lives - 1 <= 0) {
                  setSurvivalEnded(true)
                  sfx.gameOver()
                }
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
    [activeGame, currentQuestion, phase, timeLeft, totalTime, currentStreak, lives, answerMut, addCorrect, addXp, setBestStreak, setLastAnswer, setStreak, setSurvivalEnded, loseLife, sfx]
  )

  // Ref para que el timer siempre llame a la última versión de handleAnswer
  const handleAnswerRef = useRef(handleAnswer)
  useEffect(() => {
    handleAnswerRef.current = handleAnswer
  }, [handleAnswer])

  useEffect(() => {
    if (!currentQuestion || phase !== "question") return
    // Reset del estado al cambiar de pregunta
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
    // En supervivencia, si ya terminó por vidas=0, ir a resultados
    if (activeGame.mode === "survival" && survivalEnded) {
      endSessionMut.mutate(activeGame.sessionId, {
        onSuccess: (data) => {
          setLastSessionResult(data)
        },
      })
      endGame()
      return
    }
    const nextIdx = currentQuestionIndex + 1
    if (nextIdx >= activeGame.questions.length) {
      endSessionMut.mutate(activeGame.sessionId, {
        onSuccess: (data) => {
          setLastSessionResult(data)
        },
      })
      endGame()
    } else {
      setCurrentQuestionIndex(nextIdx)
      setPhase("question")
    }
  }

  const handleAbort = () => {
    if (activeGame) {
      endSessionMut.mutate(activeGame.sessionId, {
        onSuccess: (data) => {
          setLastSessionResult(data)
        },
      })
    }
    endGame()
  }

  if (!activeGame || !currentQuestion || !diff) {
    return <div className="p-8 text-center text-muted-foreground">Cargando partida…</div>
  }

  // Mix: usa un color cyan por defecto
  const catColor = isMix ? "#00F5D4" : (cat?.color ?? "#00B4D8")
  const catIcon = isMix ? "🔀" : (cat?.icon ?? "🎯")
  const catName = isMix ? "Mix Aleatorio" : (cat?.name ?? "—")

  const ratio = hasTimer ? timeLeft / totalTime : 1
  const timerColor = !hasTimer ? "#00F5D4" : ratio > 0.6 ? "#10b981" : ratio > 0.3 ? "#fbbf24" : "#FF4D6D"
  const isUrgent = hasTimer && ratio <= 0.3

  // Combo multiplier actual para display
  const currentCombo = isSurvival ? SURVIVAL_CONFIG.comboMultiplier(currentStreak) : 1

  // En supervivencia, mostrar "pregunta N" en vez de progreso porcentual
  const progressPct = isSurvival
    ? Math.min(100, ((currentQuestionIndex + (phase === "feedback" ? 1 : 0)) / Math.max(activeGame.questions.length, 1)) * 100)
    : ((currentQuestionIndex + (phase === "feedback" ? 1 : 0)) / activeGame.questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header compacto */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleAbort}
              className="p-1.5 rounded-lg hover:bg-card/80 transition"
              title="Salir"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Center: category + progress */}
            <div className="flex-1 flex items-center justify-center gap-2">
              <span className="text-xl">{catIcon}</span>
              <div className="leading-tight">
                <div className="text-xs font-bold" style={{ color: catColor }}>{catName}</div>
                <div className="text-[9px] text-muted-foreground">
                  {isSurvival
                    ? `Sobreviviendo: ${currentQuestionIndex + 1}`
                    : `${currentQuestionIndex + 1} / ${activeGame.questions.length}`}
                </div>
              </div>
            </div>

            {/* Right: XP + streak */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Zap className="w-3 h-3 text-cyan-300" />
                <span className="text-xs font-bold text-cyan-300 tabular-nums">{totalXpEarned}</span>
              </div>
              {currentStreak >= 2 && (
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg border",
                    currentCombo >= 3
                      ? "bg-[#00F5D4]/15 border-[#00F5D4]/50 animate-bioluminescent"
                      : currentCombo === 2
                        ? "bg-[#00B4D8]/15 border-[#00B4D8]/50"
                        : "bg-orange-500/10 border-orange-500/30"
                  )}
                >
                  <Flame className="w-3 h-3" style={{ color: currentCombo >= 2 ? "#00F5D4" : "#fb923c" }} />
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: currentCombo >= 2 ? "#00F5D4" : "#fb923c" }}
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
                        color: isAlive ? "#FF4D6D" : "#3a2030",
                        fill: isAlive ? "#FF4D6D" : "transparent",
                        filter: isAlive ? "drop-shadow(0 0 6px rgba(255,77,109,0.65))" : "none",
                      }}
                    />
                  </motion.div>
                )
              })}
              <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">Vidas</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isSurvival
                  ? "linear-gradient(90deg, #FF4D6D, #00F5D4)"
                  : "linear-gradient(90deg, #00F5D4, #00B4D8, #2dd4bf)",
              }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 flex flex-col">
        {/* Timer compacto */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Tiempo</span>
          </div>
          <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden border border-border/60">
            {hasTimer && (
              <motion.div
                className="h-full rounded-full"
                style={{ background: timerColor, boxShadow: `0 0 8px ${timerColor}` }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            )}
            {!hasTimer && (
              <div className="h-full w-full rounded-full bg-gradient-to-r from-[#00F5D4]/40 to-[#00B4D8]/40" />
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
            className="rounded-2xl border bg-card/60 backdrop-blur-sm p-5 sm:p-7 mb-5 glass"
            style={{ borderColor: `${catColor}40`, boxShadow: `0 0 25px ${catColor}15` }}
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mb-3 justify-center">
              <span
                className="px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40` }}
              >
                {isSurvival ? `Abismo · ${totalTime}s` : `${diff.name} · ${hasTimer ? `${totalTime}s` : "sin tiempo"}`}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-center leading-snug">
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
                  phase === "question" && "border-border/60 bg-card/40 hover:bg-card/70 hover:border-primary/50 cursor-pointer",
                  showCorrect && "border-[#00F5D4] bg-[#00F5D4]/15 glow-bioluminescent",
                  showWrong && "border-[#FF4D6D] bg-[#FF4D6D]/15",
                  phase === "feedback" && !showCorrect && !showWrong && "border-border/40 bg-card/30 opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 font-black text-sm border",
                    phase === "question" && "border-border/60 bg-muted/40 text-muted-foreground",
                    showCorrect && "border-[#00F5D4] bg-[#00F5D4]/30 text-[#070F1E]",
                    showWrong && "border-[#FF4D6D] bg-[#FF4D6D]/30 text-white",
                    phase === "feedback" && !showCorrect && !showWrong && "border-border/40 bg-muted/20 text-muted-foreground/60"
                  )}
                >
                  {showCorrect ? <Check className="w-4 h-4" /> : showWrong ? <X className="w-4 h-4" /> : letter}
                </span>
                <span className="font-medium text-sm sm:text-base break-words flex-1">{option}</span>
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
                  ? "border-[#00F5D4]/50 bg-[#00F5D4]/8"
                  : "border-[#FF4D6D]/50 bg-[#FF4D6D]/8"
              )}>
                <div className="flex items-center gap-2">
                  {lastAnswer.isCorrect ? (
                    <><Check className="w-4 h-4" style={{ color: "#00F5D4" }} /><span className="font-bold text-sm" style={{ color: "#00F5D4" }}>¡Correcto!</span></>
                  ) : (
                    <><X className="w-4 h-4" style={{ color: "#FF4D6D" }} /><span className="font-bold text-sm" style={{ color: "#FF4D6D" }}>Incorrecto</span></>
                  )}
                  {lastAnswer.xpGained > 0 && (
                    <span className="ml-auto text-sm font-mono font-bold text-amber-300">+{lastAnswer.xpGained} XP{lastAnswer.xpBreakdown.combo && lastAnswer.xpBreakdown.combo > 1 ? ` ×${lastAnswer.xpBreakdown.combo}` : ""}</span>
                  )}
                </div>
                {!lastAnswer.isCorrect && (
                  <div className="text-xs text-muted-foreground mt-1.5">
                    Respuesta: <span className="font-bold text-foreground">{lastAnswer.correctAnswer}</span>
                  </div>
                )}
                {/* Explicación del dato (GDD: pregunta con explicación) */}
                {lastAnswer.explanation && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground bg-card/40 border border-border/40 rounded-lg p-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan-400" />
                    <span className="leading-snug">{lastAnswer.explanation}</span>
                  </div>
                )}
                {lastAnswer.xpBreakdown && lastAnswer.isCorrect && (lastAnswer.xpBreakdown.timeBonus > 0 || lastAnswer.xpBreakdown.streakBonus > 0 || lastAnswer.xpBreakdown.difficultyBonus > 0) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground mt-2 font-mono">
                    <span>Base: +{lastAnswer.xpBreakdown.base}</span>
                    {lastAnswer.xpBreakdown.timeBonus > 0 && <span className="text-cyan-300">+{lastAnswer.xpBreakdown.timeBonus} tiempo</span>}
                    {lastAnswer.xpBreakdown.streakBonus > 0 && <span style={{ color: "#00F5D4" }}>+{lastAnswer.xpBreakdown.streakBonus} combo</span>}
                    {lastAnswer.xpBreakdown.difficultyBonus > 0 && <span className="text-purple-300">+{lastAnswer.xpBreakdown.difficultyBonus} dificultad</span>}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  sfx.waterDrop()
                  handleNext()
                }}
                className="w-full py-3.5 rounded-2xl font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-[#00F5D4] via-[#00B4D8] to-[#2dd4bf] text-[#070F1E] hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 glow-bioluminescent"
              >
                {(isSurvival && survivalEnded) || currentQuestionIndex + 1 >= activeGame.questions.length
                  ? "Ver resultados"
                  : "Siguiente"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Combo bioluminiscent toast (3 streak → x2, 5 streak → x3) */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div
              className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-lg animate-bioluminescent"
              style={{
                background: "linear-gradient(135deg, #00F5D4, #00B4D8)",
                color: "#070F1E",
                border: "2px solid rgba(0,245,212,0.8)",
              }}
            >
              ⚡ COMBO ×{SURVIVAL_CONFIG.comboMultiplier(currentStreak)}! ⚡
            </div>
            <div className="text-center mt-1 text-xs" style={{ color: "#00F5D4" }}>
              ¡Bioluminiscencia activada!
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
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-lg glow-gold">
              ⬆ ¡NIVEL {lastAnswer?.newLevel}!
            </div>
            <div className="text-center mt-1 text-xs text-amber-200/80">+1 Loot Box disponible</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
