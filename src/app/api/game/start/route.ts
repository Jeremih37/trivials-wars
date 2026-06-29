import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { DIFFICULTIES, type DifficultyId, type CategoryId } from "@/lib/game"

export const dynamic = "force-dynamic"

interface StartBody {
  category: CategoryId
  difficulty: DifficultyId
}

export async function POST(req: Request) {
  const body = (await req.json()) as StartBody
  const { category, difficulty } = body

  if (!category || !difficulty) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }

  const diff = DIFFICULTIES.find((d) => d.id === difficulty)
  if (!diff) {
    return NextResponse.json({ error: "Dificultad inválida" }, { status: 400 })
  }

  // Tomar 10 preguntas aleatorias de la categoría+difficultad
  // SQLite no soporta take+random nativamente, así que traemos y barajamos
  const allQuestions = await db.question.findMany({
    where: { category, difficulty },
  })

  if (allQuestions.length === 0) {
    return NextResponse.json({ error: "No hay preguntas para esa combinación" }, { status: 404 })
  }

  // Barajar (Fisher-Yates)
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]]
  }

  const selected = allQuestions.slice(0, Math.min(10, allQuestions.length))

  // Crear sesión
  const user = await db.user.findFirst()
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const session = await db.gameSession.create({
    data: {
      userId: user.id,
      category,
      difficulty,
      totalQuestions: selected.length,
      correctCount: 0,
      xpEarned: 0,
      bestStreak: 0,
    },
  })

  // Mapear preguntas para el cliente (sin revelar la respuesta correcta)
  const questionsForClient = selected.map((q) => {
    const options = JSON.parse(q.options) as string[]
    // Barajar las opciones también para evitar sesgo de posición
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
    }
  })

  return NextResponse.json({
    sessionId: session.id,
    difficulty,
    category,
    timePerQuestion: diff.time,
    xpBase: diff.xpBase,
    multiplier: diff.multiplier,
    questions: questionsForClient,
  })
}
