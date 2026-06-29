"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CATEGORIES, DIFFICULTIES } from "@/lib/game"
import { useGameStore } from "@/lib/store"
import { useAnswerQuestion, useEndSession } from "@/hooks/use-game"
import { Check, X, Zap, Flame, ChevronRight, ChevronLeft, Clock } from "lucide-react"
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

  const currentQuestion = activeGame?.questions[currentQuestionIndex]
  const diff = DIFFICULTIES.find((d) => d.id === activeGame?.difficulty)
  const cat = CATEGORIES.find((c) => c.id === activeGame?.category)
  const totalTime = activeGame?.timePerQuestion ?? 30

  useEffect(() => {
    if (!currentQuestion || phase !== "question") return
    setTimeLeft(totalTime)
    setSelectedAnswer(null)
    setPhase("question")

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current)
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
      endSessionMut.mutate(activeGame.sessionId)
      endGame()
    } else {
      setCurrentQuestionIndex(nextIdx)
      setPhase("question")
    }
  }

  const handleAbort = () => {
    if (activeGame) endSessionMut.mutate(activeGame.sessionId)
    endGame()
  }

  if (!activeGame || !currentQuestion || !diff || !cat) {
    return <div className="p-8 text-center text-muted-foreground">Cargando partida…</div>
  }

  const ratio = timeLeft / totalTime
  const timerColor = ratio > 0.6 ? "#22c55e" : ratio > 0.3 ? "#f59e0b" : "#ef4444"
  const isUrgent = ratio <= 0.3

  const progressPct = ((currentQuestionIndex + (phase === "feedback" ? 1 : 0)) / activeGame.questions.length) * 100

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
              <span className="text-xl">{cat.icon}</span>
              <div className="leading-tight">
                <div className="text-xs font-bold" style={{ color: cat.color }}>{cat.name}</div>
                <div className="text-[9px] text-muted-foreground">{currentQuestionIndex + 1} / {activeGame.questions.length}</div>
              </div>
            </div>

            {/* Right: XP + streak */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Zap className="w-3 h-3 text-cyan-300" />
                <span className="text-xs font-bold text-cyan-300 tabular-nums">{totalXpEarned}</span>
              </div>
              {currentStreak >= 2 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-bold text-orange-400 tabular-nums">{currentStreak}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-500"
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
            <motion.div
              className="h-full rounded-full"
              style={{ background: timerColor, boxShadow: `0 0 8px ${timerColor}` }}
              animate={{ width: `${ratio * 100}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
          <div
            className={cn("font-mono font-black tabular-nums w-12 text-right", isUrgent && "animate-pulse")}
            style={{ color: timerColor, fontSize: isUrgent ? "1.4rem" : "1.1rem" }}
          >
            {timeLeft.toFixed(1)}s
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
            className="rounded-2xl border bg-card/60 backdrop-blur-sm p-5 sm:p-7 mb-5"
            style={{ borderColor: `${cat.color}40`, boxShadow: `0 0 25px ${cat.color}15` }}
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mb-3 justify-center">
              <span
                className="px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}
              >
                {diff.name} · {diff.time}s
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
                onClick={() => handleAnswer(option)}
                className={cn(
                  "relative text-left rounded-2xl border p-3.5 transition-all overflow-hidden flex items-center gap-3",
                  phase === "question" && "border-border/60 bg-card/40 hover:bg-card/70 hover:border-primary/50 cursor-pointer",
                  showCorrect && "border-green-400 bg-green-500/15 glow-green",
                  showWrong && "border-red-400 bg-red-500/15",
                  phase === "feedback" && !showCorrect && !showWrong && "border-border/40 bg-card/30 opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 font-black text-sm border",
                    phase === "question" && "border-border/60 bg-muted/40 text-muted-foreground",
                    showCorrect && "border-green-400 bg-green-500/30 text-green-200",
                    showWrong && "border-red-400 bg-red-500/30 text-red-200",
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
                "rounded-2xl border p-3.5 mb-3",
                lastAnswer.isCorrect
                  ? "border-green-500/40 bg-green-500/10"
                  : "border-red-500/40 bg-red-500/10"
              )}>
                <div className="flex items-center gap-2">
                  {lastAnswer.isCorrect ? (
                    <><Check className="w-4 h-4 text-green-400" /><span className="font-bold text-green-300 text-sm">¡Correcto!</span></>
                  ) : (
                    <><X className="w-4 h-4 text-red-400" /><span className="font-bold text-red-300 text-sm">Incorrecto</span></>
                  )}
                  {lastAnswer.xpGained > 0 && (
                    <span className="ml-auto text-sm font-mono font-bold text-amber-300">+{lastAnswer.xpGained} XP</span>
                  )}
                </div>
                {!lastAnswer.isCorrect && (
                  <div className="text-xs text-muted-foreground mt-1.5">
                    Respuesta: <span className="font-bold text-foreground">{lastAnswer.correctAnswer}</span>
                  </div>
                )}
                {lastAnswer.xpBreakdown && lastAnswer.isCorrect && (lastAnswer.xpBreakdown.timeBonus > 0 || lastAnswer.xpBreakdown.streakBonus > 0 || lastAnswer.xpBreakdown.difficultyBonus > 0) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground mt-2 font-mono">
                    <span>Base: +{lastAnswer.xpBreakdown.base}</span>
                    {lastAnswer.xpBreakdown.timeBonus > 0 && <span className="text-cyan-300">+{lastAnswer.xpBreakdown.timeBonus} tiempo</span>}
                    {lastAnswer.xpBreakdown.streakBonus > 0 && <span className="text-orange-300">+{lastAnswer.xpBreakdown.streakBonus} racha</span>}
                    {lastAnswer.xpBreakdown.difficultyBonus > 0 && <span className="text-purple-300">+{lastAnswer.xpBreakdown.difficultyBonus} dificultad</span>}
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-500 text-white hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 glow-pink"
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
