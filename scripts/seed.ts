// Seed script — populate database with questions and create a default user
import { db } from "../src/lib/db"
import { QUESTIONS_SEED } from "../src/lib/questions"

async function main() {
  console.log("🌱 Seeding Trivials Wars database...")

  // 1. Crear usuario por defecto (si no existe)
  let user = await db.user.findFirst()
  if (!user) {
    user = await db.user.create({
      data: {
        name: "Jugador",
        avatarBase: "🧑",
        xp: 0,
        level: 1,
        coins: 100,
        boxes: 2,
      },
    })
    console.log(`✅ Usuario creado: ${user.id}`)
  } else {
    console.log(`ℹ️  Usuario existente: ${user.id}`)
  }

  // 2. Insertar preguntas (upsert por uuid)
  let inserted = 0
  let skipped = 0
  for (const q of QUESTIONS_SEED) {
    const existing = await db.question.findUnique({ where: { uuid: q.uuid } })
    if (existing) {
      skipped++
      continue
    }
    await db.question.create({
      data: {
        uuid: q.uuid,
        category: q.category,
        question: q.question,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
      },
    })
    inserted++
  }
  console.log(`📚 Preguntas: ${inserted} insertadas, ${skipped} existentes`)

  const totalQuestions = await db.question.count()
  console.log(`📊 Total preguntas en BD: ${totalQuestions}`)
  console.log("✨ Seed completado!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
