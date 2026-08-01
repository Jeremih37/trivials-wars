import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  DIFFICULTIES,
  SURVIVAL_CONFIG,
  type DifficultyId,
  type CategoryId,
  type GameModeId,
} from "@/lib/game"
import { apiHandler, safeJson } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface StartBody {
  category: CategoryId | "mix"
  difficulty: DifficultyId
  mode?: GameModeId
  questionCount?: number
  timePreset?: number // 10 | 15 | 0 (sin tiempo) — sólo classic
}

export const POST = apiHandler(async (req: Request) => {
  const body = await safeJson<StartBody>(req)
  const {
    category,
    difficulty,
    mode = "classic",
    questionCount = 10,
    timePreset,
  } = body

  if (!category || !difficulty) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }

  const diff = DIFFICULTIES.find((d) => d.id === difficulty)
  if (!diff) {
    return NextResponse.json({ error: "Dificultad inválida" }, { status: 400 })
  }

  // En modo supervivencia: traer TODAS las preguntas de la categoría (mezclando dificultades)
  // En modo clásico: solo de la categoría+difficultad solicitada
  // En "mix": todas las categorías de esa dificultad
  const isMix = category === "mix"
  const allQuestions =
    mode === "survival"
      ? isMix
        ? await db.question.findMany({})
        : await db.question.findMany({ where: { category } })
      : isMix
        ? await db.question.findMany({ where: { difficulty } })
        : await db.question.findMany({ where: { category, difficulty } })

  if (allQuestions.length === 0) {
    return NextResponse.json({ error: "No hay preguntas para esa combinación" }, { status: 404 })
  }

  // Barajar (Fisher-Yates)
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]]
  }

  // En modo clásico: limitar a questionCount (default 10)
  // En modo supervivencia: enviar un pool grande inicial
  const selected =
    mode === "survival"
      ? allQuestions.slice(0, Math.min(SURVIVAL_CONFIG.initialPoolSize, allQuestions.length))
      : allQuestions.slice(0, Math.min(questionCount, allQuestions.length))

  // Crear sesión
  const user = await db.user.findFirst()
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const session = await db.gameSession.create({
    data: {
      userId: user.id,
      category: isMix ? "mix" : category,
      difficulty,
      totalQuestions: mode === "survival" ? 0 : selected.length, // 0 indica sin límite
      correctCount: 0,
      xpEarned: 0,
      bestStreak: 0,
    },
  })

  // Mapear preguntas para el cliente (sin revelar la respuesta correcta)
  const questionsForClient = selected.map((q) => {
    const options = JSON.parse(q.options) as string[]
    const shuffled = [...options]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return {
      id: q.id,
      uuid: q.uuid,
      question: q.question,
      options: shuffled,
      explanation: (q as { explanation?: string | null }).explanation ?? null,
    }
  })

  // Time: en classic, el timePreset sobreescribe diff.time si viene. 0 = sin tiempo.
  // En survival, usa SURVIVAL_CONFIG.initialTime.
  const timePerQuestion =
    mode === "survival"
      ? SURVIVAL_CONFIG.initialTime
      : typeof timePreset === "number"
        ? timePreset
        : diff.time

  return NextResponse.json({
    sessionId: session.id,
    difficulty,
    category: isMix ? "mix" : category,
    mode,
    timePerQuestion,
    xpBase: diff.xpBase,
    multiplier: diff.multiplier,
    questions: questionsForClient,
    initialLives: mode === "survival" ? SURVIVAL_CONFIG.initialLives : undefined,
  })
})
