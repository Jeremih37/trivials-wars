"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CATEGORIES, DIFFICULTIES } from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useAnswerQuestion, useEndSession } from "@/hooks/use-game"
import { Check, X, Zap, Flame, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Phase = "question" | "feedback" | "transition"

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
    lastAnswer,
    setLastAnswer,
    endGame,
    setScreen,
  } = useGameStore()

  const answerMut = useAnswerQuestion()
  const endSessionMut = useEndSession()

  const [timeLeft, setTimeLeft] = useState(0)
  const [phase, setPhase] = useState<Phase>("question")
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeAtAnswer = useRef(0)

  const currentQuestion = activeGame?.questions[currentQuestionIndex]
  const diff = DIFFICULTIES.find((d) => d.id === activeGame?.difficulty)
  const cat = CATEGORIES.find((c) => c.id === activeGame?.category)
  const totalTime = activeGame?.timePerQuestion ?? 30

  // Iniciar temporizador para la pregunta actual
  useEffect(() => {
    if (!currentQuestion || phase !== "question") return
    setTimeLeft(totalTime)
    setSelectedAnswer(null)
    setPhase("question")

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current)
          // tiempo agotado: cuenta como respuesta incorrecta con selectedAnswer vacío
          handleAnswer("")
          return 0
        }
        return t - 0.1
      })
    }, 100)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, activeGame])

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!activeGame || !currentQuestion || phase !== "question") return
      if (timerRef.current) clearInterval(timerRef.current)
      timeAtAnswer.current = timeLeft
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
        },
        {
          onSuccess: (resp) => {
            setLastAnswer(resp)
            if (resp.isCorrect) {
              addCorrect()
              const newStreak = currentStreak + 1
              setStreak(newStreak)
              setBestStreak(newStreak)
            } else {
              setStreak(0)
            }
            addXp(resp.xpGained)
            if (resp.levelUp) {
              setShowLevelUp(true)
              setTimeout(() => setShowLevelUp(false), 2500)
            }
          },
        }
      )
    },
    [activeGame, currentQuestion, phase, timeLeft, totalTime, currentStreak, answerMut, addCorrect, addXp, setBestStreak, setLastAnswer, setStreak]
  )

  const handleNext = () => {
    if (!activeGame) return
    const nextIdx = currentQuestionIndex + 1
    if (nextIdx >= activeGame.questions.length) {
      // fin del juego
      endSessionMut.mutate(activeGame.sessionId)
      endGame()
    } else {
      setCurrentQuestionIndex(nextIdx)
      setPhase("question")
    }
  }

  if (!activeGame || !currentQuestion || !diff || !cat) {
    return <div className="p-8 text-center text-muted-foreground">Cargando partida…</div>
  }

  // Cálculo de color del temporizador
  const ratio = timeLeft / totalTime
  const timerColor = ratio > 0.6 ? "#22c55e" : ratio > 0.3 ? "#f59e0b" : "#ef4444"
  const isUrgent = ratio <= 0.3

  const progressPct = ((currentQuestionIndex + (phase === "feedback" ? 1 : 0)) / activeGame.questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cat.icon}</span>
              <div className="leading-tight">
                <div className="text-xs font-bold" style={{ color: cat.color }}>{cat.name}</div>
                <div className="text-[10px] text-muted-foreground">{diff.name} · {diff.time}s</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Zap className="w-3 h-3 text-cyan-300" />
                <span className="font-bold text-cyan-300">{totalXpEarned} XP</span>
              </div>
              {currentStreak >= 2 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="font-bold text-orange-400">{currentStreak}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 text-center">
            Pregunta {currentQuestionIndex + 1} / {activeGame.questions.length}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col">
        {/* Timer */}
        <div className="relative mx-auto mb-6 w-full max-w-xs">
          <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden border border-border/60">
            <motion.div
              className="h-full rounded-full relative"
              style={{ background: timerColor }}
              animate={{ width: `${ratio * 100}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              <div className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] animate-[pulse-glow:1s_ease-in-out_infinite]" />
            </motion.div>
          </div>
          <div className={cn("mt-2 text-center font-mono font-black tabular-nums", isUrgent && "animate-pulse")} style={{ color: timerColor, fontSize: isUrgent ? "2.5rem" : "1.75rem" }}>
            {timeLeft.toFixed(1)}s
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 sm:p-8 mb-6"
            style={{ boxShadow: `0 0 30px ${cat.color}15` }}
          >
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 text-center">Pregunta</div>
            <h2 className="text-xl sm:text-2xl font-bold text-center leading-snug">
              {currentQuestion.question}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isCorrectAnswer = lastAnswer?.isCorrect !== undefined && option === lastAnswer.correctAnswer
            const isSelected = selectedAnswer === option
            const showCorrect = phase === "feedback" && isCorrectAnswer
            const showWrong = phase === "feedback" && isSelected && !isCorrectAnswer

            return (
              <motion.button
                key={option + idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                disabled={phase !== "question"}
                onClick={() => handleAnswer(option)}
                className={cn(
                  "relative text-left rounded-2xl border p-4 transition-all overflow-hidden",
                  phase === "question" && "border-border/60 bg-card/40 hover:bg-card/70 hover:border-primary/50 cursor-pointer",
                  showCorrect && "border-green-400 bg-green-500/15 glow-green",
                  showWrong && "border-red-400 bg-red-500/15",
                  phase === "feedback" && !showCorrect && !showWrong && "border-border/40 bg-card/30 opacity-50"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm sm:text-base break-words">{option}</span>
                  {showCorrect && <Check className="w-5 h-5 text-green-400 shrink-0" />}
                  {showWrong && <X className="w-5 h-5 text-red-400 shrink-0" />}
                </div>
                <span className="absolute top-1 left-2 text-[10px] font-mono text-muted-foreground/40">
                  {String.fromCharCode(65 + idx)}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Feedback panel */}
        <AnimatePresence>
          {phase === "feedback" && lastAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mt-6"
            >
              <div className={cn(
                "rounded-2xl border p-4 mb-3",
                lastAnswer.isCorrect
                  ? "border-green-500/40 bg-green-500/10"
                  : "border-red-500/40 bg-red-500/10"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {lastAnswer.isCorrect ? (
                    <><Check className="w-5 h-5 text-green-400" /><span className="font-bold text-green-300">¡Correcto!</span></>
                  ) : (
                    <><X className="w-5 h-5 text-red-400" /><span className="font-bold text-red-300">Incorrecto</span></>
                  )}
                  {lastAnswer.xpGained > 0 && (
                    <span className="ml-auto text-sm font-mono font-bold text-amber-300">+{lastAnswer.xpGained} XP</span>
                  )}
                </div>
                {!lastAnswer.isCorrect && (
                  <div className="text-xs text-muted-foreground">
                    Respuesta correcta: <span className="font-bold text-foreground">{lastAnswer.correctAnswer}</span>
                  </div>
                )}
                {lastAnswer.xpBreakdown && lastAnswer.isCorrect && (
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground mt-2 font-mono">
                    <span>Base: +{lastAnswer.xpBreakdown.base}</span>
                    {lastAnswer.xpBreakdown.timeBonus > 0 && <span className="text-cyan-300">Bonus tiempo: +{lastAnswer.xpBreakdown.timeBonus}</span>}
                    {lastAnswer.xpBreakdown.streakBonus > 0 && <span className="text-orange-300">Bonus racha: +{lastAnswer.xpBreakdown.streakBonus}</span>}
                    {lastAnswer.xpBreakdown.difficultyBonus > 0 && <span className="text-purple-300">Dificultad: +{lastAnswer.xpBreakdown.difficultyBonus}</span>}
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                {currentQuestionIndex + 1 >= activeGame.questions.length ? "Ver resultados" : "Siguiente"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
