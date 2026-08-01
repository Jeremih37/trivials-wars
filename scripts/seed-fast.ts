// Fast seed script — bulk insert questions using createMany with skipDuplicates
import { PrismaClient } from "@prisma/client"
import { QUESTIONS_SEED } from "../src/lib/questions"

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_DATABASE_URL

if (!url) {
  console.error("ERROR: no DATABASE_URL found in env")
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: { db: { url } },
  log: ["error"],
})

async function main() {
  console.log("🌱 Fast seed: inserting", QUESTIONS_SEED.length, "questions...")

  // 1. Crear usuario por defecto si no existe
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: { name: "Jugador", avatarBase: "🧑", xp: 0, level: 1, coins: 100, boxes: 2 },
    })
    console.log("✅ Usuario creado:", user.id)
  } else {
    console.log("ℹ️  Usuario existente:", user.id)
  }

  // 2. Bulk insert preguntas (skipDuplicates evita errores por uuid ya existente)
  const result = await prisma.question.createMany({
    data: QUESTIONS_SEED.map((q) => ({
      uuid: q.uuid,
      category: q.category,
      question: q.question,
      options: JSON.stringify(q.options),
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      explanation: q.explanation ?? null,
    })),
    skipDuplicates: true,
  })
  console.log(`📚 Preguntas insertadas (nuevas): ${result.count}`)

  // 3. Para preguntas que ya existen pero sin explicación, actualizarlas
  const existing = await prisma.question.findMany({
    where: { explanation: null },
    select: { id: true, uuid: true },
  })
  console.log(`ℹ️  Preguntas existentes sin explicación: ${existing.length}`)
  let updated = 0
  for (const q of existing) {
    const seed = QUESTIONS_SEED.find((s) => s.uuid === q.uuid)
    if (seed?.explanation) {
      await prisma.question.update({
        where: { id: q.id },
        data: { explanation: seed.explanation },
      })
      updated++
    }
  }
  console.log(`✏️  Preguntas actualizadas con explicación: ${updated}`)

  const totalQuestions = await prisma.question.count()
  console.log(`📊 Total preguntas en BD: ${totalQuestions}`)
  const byCat = await prisma.question.groupBy({
    by: ["category"],
    _count: true,
    orderBy: { _count: { category: "desc" } },
  })
  console.log("📊 Por categoría:", byCat)
  console.log("✨ Seed completado!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
