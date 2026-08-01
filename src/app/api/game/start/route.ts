import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  DIFFICULTIES,
  SURVIVAL_CONFIG,
  SUDDEN_DEATH_CONFIG,
  type DifficultyId,
  type CategoryId,
  type GameModeId,
} from "@/lib/game"
import { apiHandler, safeJson } from "@/lib/api-handler"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface StartBody {
  category: CategoryId | "mix"
  categories?: CategoryId[] // multi-select Frutiger Aero GDD V2
  difficulty: DifficultyId
  mode?: GameModeId
  questionCount?: number
  timePreset?: number // 10 | 15 | 0 (sin tiempo) — sólo classic
}

export const POST = apiHandler(async (req: Request) => {
  const body = await safeJson<StartBody>(req)
  const {
    category,
    categories,
    difficulty,
    mode = "classic",
    questionCount = 10,
    timePreset,
  } = body

  if (!category && (!categories || categories.length === 0)) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }
  if (!difficulty) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }

  const diff = DIFFICULTIES.find((d) => d.id === difficulty)
  if (!diff) {
    return NextResponse.json({ error: "Dificultad inválida" }, { status: 400 })
  }

  // ===== Resolución de categorías seleccionadas =====
  // Multi-select: si viene `categories` (array no vacío), usarlo.
  // Si no, fallback al `category` simple ("mix" o una sola).
  let selectedCategoryIds: CategoryId[]
  let categoryLabel: string // lo que se guarda en la sesión
  if (categories && categories.length > 0) {
    selectedCategoryIds = categories
    categoryLabel = categories.length === 1 ? categories[0] : "mix"
  } else if (category === "mix") {
    selectedCategoryIds = []
    categoryLabel = "mix"
  } else if (category) {
    selectedCategoryIds = [category]
    categoryLabel = category
  } else {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }
  // isMixTotal = "todas las categorías mezcladas" (sin filtro de categoría)
  const isMixTotal = selectedCategoryIds.length === 0

  // En modo supervivencia/muerte súbita: traer TODAS las preguntas (de las categorías seleccionadas o todas si mix total)
  // En modo clásico: solo de las categorías+difficultad solicitada
  const isEndlessMode = mode === "survival" || mode === "suddendeath"
  const whereClause = isEndlessMode
    ? (isMixTotal ? {} : { category: { in: selectedCategoryIds } })
    : (isMixTotal
      ? { difficulty }
      : { category: { in: selectedCategoryIds }, difficulty })

  const allQuestions = await db.question.findMany({ where: whereClause })

  if (allQuestions.length === 0) {
    return NextResponse.json({ error: "No hay preguntas para esa combinación" }, { status: 404 })
  }

  // Barajar (Fisher-Yates)
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]]
  }

  // En modo clásico: limitar a questionCount (default 10)
  // En modo supervivencia: enviar pool grande inicial (30)
  // En modo muerte súbita: enviar pool más grande (50) para mantener la tensión
  const poolSize =
    mode === "survival"
      ? SURVIVAL_CONFIG.initialPoolSize
      : mode === "suddendeath"
        ? SUDDEN_DEATH_CONFIG.initialPoolSize
        : questionCount

  const selected = isEndlessMode
    ? allQuestions.slice(0, Math.min(poolSize, allQuestions.length))
    : allQuestions.slice(0, Math.min(questionCount, allQuestions.length))

  // Crear sesión
  const user = await db.user.findFirst()
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const session = await db.gameSession.create({
    data: {
      userId: user.id,
      category: categoryLabel,
      difficulty,
      totalQuestions: isEndlessMode ? 0 : selected.length, // 0 indica sin límite
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
  // En suddendeath, usa SUDDEN_DEATH_CONFIG.timePerQuestion (fijo 15s)
  const timePerQuestion =
    mode === "survival"
      ? SURVIVAL_CONFIG.initialTime
      : mode === "suddendeath"
        ? SUDDEN_DEATH_CONFIG.timePerQuestion
        : typeof timePreset === "number"
          ? timePreset
          : diff.time

  return NextResponse.json({
    sessionId: session.id,
    difficulty,
    category: categoryLabel,
    mode,
    timePerQuestion,
    xpBase: diff.xpBase,
    multiplier: diff.multiplier,
    questions: questionsForClient,
    initialLives:
      mode === "survival"
        ? SURVIVAL_CONFIG.initialLives
        : mode === "suddendeath"
          ? SUDDEN_DEATH_CONFIG.initialLives
          : undefined,
  })
})
