import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  computeAnswerXp,
  computeSurvivalXp,
  computeLevelFromXp,
  computeSessionResult,
  DIFFICULTIES,
  type DifficultyId,
} from "@/lib/game"
import { autoUnlockByLevel } from "@/lib/auth"
import { apiHandler, safeJson } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface AnswerBody {
  sessionId: string
  questionId: string
  selectedAnswer: string
  timeRemaining: number // segundos restantes
  totalTime: number // tiempo total de la pregunta
  streak: number
  lives: number // vidas restantes (survival)
}

export const POST = apiHandler(async (req: Request) => {
  const body = await safeJson<AnswerBody>(req)

  const session = await db.gameSession.findUnique({
    where: { id: body.sessionId },
  })
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
  }

  const question = await db.question.findUnique({ where: { id: body.questionId } })
  if (!question) {
    return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 })
  }

  const isCorrect = body.selectedAnswer === question.correctAnswer
  const difficultyId = session.difficulty as DifficultyId
  const diff = DIFFICULTIES.find((d) => d.id === difficultyId)!

  // En modo supervivencia (totalQuestions === 0), usar la lógica de XP survival
  const isSurvival = session.totalQuestions === 0
  const xp = isSurvival
    ? (() => {
        const survivalXp = computeSurvivalXp(body.streak)
        return {
          base: isCorrect ? survivalXp.base : 0,
          difficultyMultiplier: 1,
          difficultyBonus: 0,
          timeBonus: 0,
          streakBonus: isCorrect ? survivalXp.streakBonus : 0,
          total: isCorrect ? survivalXp.total : 0,
          combo: isCorrect ? survivalXp.combo : 1,
        }
      })()
    : computeAnswerXp({
        difficultyId,
        isCorrect,
        timeRemaining: body.timeRemaining,
        totalTime: body.totalTime,
        streak: body.streak,
      })

  // Actualizar sesión
  const newCorrect = session.correctCount + (isCorrect ? 1 : 0)
  const newXpEarned = session.xpEarned + xp.total
  const newBestStreak = Math.max(session.bestStreak, body.streak + (isCorrect ? 1 : 0))

  await db.gameSession.update({
    where: { id: session.id },
    data: {
      correctCount: newCorrect,
      xpEarned: newXpEarned,
      bestStreak: newBestStreak,
    },
  })

  // Actualizar progreso del usuario
  const user = await db.user.findFirst()
  if (user) {
    const progressKey = { userId: user.id, category: session.category, difficulty: session.difficulty }
    const existingProgress = await db.userProgress.findUnique({ where: { userId_category_difficulty: progressKey } })
    if (existingProgress) {
      await db.userProgress.update({
        where: { id: existingProgress.id },
        data: {
          correct: existingProgress.correct + (isCorrect ? 1 : 0),
          total: existingProgress.total + 1,
          bestStreak: Math.max(existingProgress.bestStreak, body.streak + (isCorrect ? 1 : 0)),
          lastPlayedAt: new Date(),
        },
      })
    } else {
      await db.userProgress.create({
        data: {
          ...progressKey,
          correct: isCorrect ? 1 : 0,
          total: 1,
          bestStreak: body.streak + (isCorrect ? 1 : 0),
          lastPlayedAt: new Date(),
        },
      })
    }

    // Acumular XP al usuario y recalcular nivel
    if (xp.total > 0) {
      const newXp = user.xp + xp.total
      const newLevelInfo = computeLevelFromXp(newXp)
      const levelUp = newLevelInfo.level > user.level

      // Si subió de nivel, darle una loot box
      const newBoxes = levelUp ? user.boxes + 1 : user.boxes

      await db.user.update({
        where: { id: user.id },
        data: {
          xp: newXp,
          level: newLevelInfo.level,
          boxes: newBoxes,
        },
      })

      // Auto-unlock marcos/iconos si subió de nivel
      if (levelUp) {
        await autoUnlockByLevel(user.id, newLevelInfo.level)
      }

      return NextResponse.json({
        isCorrect,
        correctAnswer: question.correctAnswer,
        xpGained: xp.total,
        xpBreakdown: xp,
        newTotalXp: newXp,
        newLevel: newLevelInfo.level,
        levelUp,
        boxesAvailable: newBoxes,
        explanation: (question as { explanation?: string | null }).explanation ?? null,
      })
    }
  }

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    xpGained: 0,
    xpBreakdown: xp,
    levelUp: false,
    explanation: (question as { explanation?: string | null }).explanation ?? null,
  })
})

export const PATCH = apiHandler(async (req: Request) => {
  // Finalizar sesión: marcar endedAt y registrar resultado win/loss + actualizar stats del usuario
  const body = await safeJson<{ sessionId: string }>(req)
  const session = await db.gameSession.findUnique({ where: { id: body.sessionId } })
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
  }

  // En modo supervivencia (totalQuestions === 0), la sesión cuenta como "win" si acertó >=1
  const isSurvival = session.totalQuestions === 0
  const result = isSurvival
    ? (session.correctCount > 0 ? "win" : "loss")
    : computeSessionResult(session.correctCount, session.totalQuestions)

  await db.gameSession.update({
    where: { id: body.sessionId },
    data: { endedAt: new Date(), result, totalQuestions: isSurvival ? session.correctCount : session.totalQuestions },
  })

  // Actualizar wins/losses/streaks en el usuario
  const user = await db.user.findFirst()
  if (user) {
    const newGames = user.gamesPlayed + 1
    const newWins = user.wins + (result === "win" ? 1 : 0)
    const newLosses = user.losses + (result === "loss" ? 1 : 0)
    const newCurrentStreak = result === "win" ? user.currentStreak + 1 : 0
    const newMaxStreak = Math.max(user.maxStreak, newCurrentStreak)

    // Stats específicas de Supervivencia (GDD: sistema de récord personal / High Score)
    let survivalUpdate: Record<string, number> | null = null
    let isNewSurvivalRecord = false

    if (isSurvival) {
      const newBestCorrect = Math.max(user.survivalBestCorrect, session.correctCount)
      const newBestXp = Math.max(user.survivalBestXp, session.xpEarned)
      isNewSurvivalRecord =
        session.correctCount > user.survivalBestCorrect ||
        session.xpEarned > user.survivalBestXp
      survivalUpdate = {
        survivalBestCorrect: newBestCorrect,
        survivalBestXp: newBestXp,
        survivalRuns: user.survivalRuns + 1,
      }
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        gamesPlayed: newGames,
        wins: newWins,
        losses: newLosses,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        ...(survivalUpdate ?? {}),
      },
    })

    return NextResponse.json({
      ok: true,
      result,
      isSurvival,
      isNewRecord: isSurvival && isNewSurvivalRecord,
      survivalStats: isSurvival
        ? {
            correct: session.correctCount,
            xp: session.xpEarned,
            bestCorrect: survivalUpdate?.survivalBestCorrect ?? user.survivalBestCorrect,
            bestXp: survivalUpdate?.survivalBestXp ?? user.survivalBestXp,
            totalRuns: survivalUpdate?.survivalRuns ?? user.survivalRuns,
          }
        : null,
    })
  }

  return NextResponse.json({ ok: true, result })
})
