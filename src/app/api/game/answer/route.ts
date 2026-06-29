import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  computeAnswerXp,
  computeLevelFromXp,
  computeSessionResult,
  DIFFICULTIES,
  type DifficultyId,
} from "@/lib/game"
import { autoUnlockByLevel } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface AnswerBody {
  sessionId: string
  questionId: string
  selectedAnswer: string
  timeRemaining: number // segundos restantes
  totalTime: number // tiempo total de la pregunta
  streak: number
}

export async function POST(req: Request) {
  const body = (await req.json()) as AnswerBody

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

  const xp = computeAnswerXp({
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
      })
    }
  }

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    xpGained: 0,
    xpBreakdown: xp,
    levelUp: false,
  })
}

export async function PATCH(req: Request) {
  // Finalizar sesión: marcar endedAt y registrar resultado win/loss + actualizar stats del usuario
  const { sessionId } = await req.json()
  const session = await db.gameSession.findUnique({ where: { id: sessionId } })
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
  }

  const result = computeSessionResult(session.correctCount, session.totalQuestions)

  await db.gameSession.update({
    where: { id: sessionId },
    data: { endedAt: new Date(), result },
  })

  // Actualizar wins/losses/streaks en el usuario
  const user = await db.user.findFirst()
  if (user) {
    const newGames = user.gamesPlayed + 1
    const newWins = user.wins + (result === "win" ? 1 : 0)
    const newLosses = user.losses + (result === "loss" ? 1 : 0)
    const newCurrentStreak = result === "win" ? user.currentStreak + 1 : 0
    const newMaxStreak = Math.max(user.maxStreak, newCurrentStreak)

    await db.user.update({
      where: { id: user.id },
      data: {
        gamesPlayed: newGames,
        wins: newWins,
        losses: newLosses,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
      },
    })
  }

  return NextResponse.json({ ok: true, result })
}
