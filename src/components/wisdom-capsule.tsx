"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ChevronRight, Quote } from "lucide-react"

// ====== Banco de Cápsulas de Sabiduría (GDD V2 — Frutiger Aero) ======
// 15+ frases divididas en: Científicos, Poetas/Escritores, Datos Curiosos
interface WisdomCapsule {
  id: number
  type: "cientifico" | "poeta" | "dato"
  author?: string
  text: string
  context?: string
}

const WISDOM_CAPSULES: WisdomCapsule[] = [
  // ====== CIENTÍFICOS (6) ======
  {
    id: 1,
    type: "cientifico",
    author: "Albert Einstein",
    text: "Lo importante es no dejar de hacerse preguntas. La curiosidad tiene su propia razón de existir.",
    context: "Físico, padre de la relatividad",
  },
  {
    id: 2,
    type: "cientifico",
    author: "Carl Sagan",
    text: "Somos una forma en que el cosmos se conoce a sí mismo.",
    context: "Astrónomo y divulgador científico",
  },
  {
    id: 3,
    type: "cientifico",
    author: "Marie Curie",
    text: "Nada en la vida debe ser temido, solamente comprendido. Ahora es el momento de comprender más, para temer menos.",
    context: "Pionera en radioactividad, 2 premios Nobel",
  },
  {
    id: 4,
    type: "cientifico",
    author: "Richard Feynman",
    text: "No me importa lo bonita que sea tu teoría, ni lo inteligente que seas. Si no concuerda con el experimento, está mal.",
    context: "Físico teórico, Premio Nobel",
  },
  {
    id: 5,
    type: "cientifico",
    author: "Stephen Hawking",
    text: "Sin importar lo difícil que sea la vida, siempre hay algo que puedes hacer y en lo que puedes triunfar.",
    context: "Cosmólogo, autor de 'Breve historia del tiempo'",
  },
  {
    id: 6,
    type: "cientifico",
    author: "Isaac Asimov",
    text: "La educación más poderosa es aquella que se logra cuando el alumno se olvida de que está aprendiendo.",
    context: "Bioquímico y escritor de ciencia ficción",
  },
  // ====== POETAS / ESCRITORES (5) ======
  {
    id: 7,
    type: "poeta",
    author: "Jorge Luis Borges",
    text: "El tiempo es la sustancia de la que estoy hecho. Es un río que me arrebata, pero yo soy el río.",
    context: "Escritor argentino, maestro del ensayo",
  },
  {
    id: 8,
    type: "poeta",
    author: "Walt Whitman",
    text: "Contengo multitudes. Cada ser humano es un universo de contradicciones luminosas.",
    context: "Poeta estadounidense, 'Hojas de hierba'",
  },
  {
    id: 9,
    type: "poeta",
    author: "Octavio Paz",
    text: "Aprender a dudar es aprender a pensar. La duda es el principio de toda sabiduría.",
    context: "Poeta mexicano, Premio Nobel 1990",
  },
  {
    id: 10,
    type: "poeta",
    author: "Friedrich Nietzsche",
    text: "Aquel que tiene un porqué para vivir, puede soportar casi cualquier cómo.",
    context: "Filósofo y poeta alemán",
  },
  {
    id: 11,
    type: "poeta",
    author: "Antoine de Saint-Exupéry",
    text: "Solo con el corazón se puede ver bien. Lo esencial es invisible a los ojos.",
    context: "Aviador y escritor de 'El Principito'",
  },
  // ====== DATOS CURIOSOS CIENTÍFICOS (5) ======
  {
    id: 12,
    type: "dato",
    text: "Aprender algo nuevo crea conexiones neuronales físicas en el cerebro en menos de 10 minutos.",
    context: "Neuroplasticidad — cada concepto nuevo esculpe tu cerebro",
  },
  {
    id: 13,
    type: "dato",
    text: "El corazón humano late aproximadamente 100,000 veces al día, bombeando 7,500 litros de sangre.",
    context: "Una nevera muscular que no descansa nunca",
  },
  {
    id: 14,
    type: "dato",
    text: "La luz del Sol tarda 8 minutos y 20 segundos en llegar a la Tierra. Lo que ves del Sol es el pasado.",
    context: "Vivimos dentro de una burbuja de tiempo cósmico",
  },
  {
    id: 15,
    type: "dato",
    text: "En una cucharadita de suelo fértil hay más microorganismos vivos que seres humanos en toda la Tierra.",
    context: "El planeta invisible bajo tus pies",
  },
  {
    id: 16,
    type: "dato",
    text: "El ADN de una sola célula humana, si lo estiras, mediría 2 metros. Tu cuerpo contiene 200 mil millones de km de ADN.",
    context: "Suficiente para ir y volver del Sol 600 veces",
  },
  {
    id: 17,
    type: "dato",
    text: "Los pulpos tienen 3 corazones, 9 cerebros y sangre azul. Pueden resolver puzzles y abrir frascos desde adentro.",
    context: "La inteligencia extraterrestre que ya está en la Tierra",
  },
]

const TYPE_META = {
  cientifico: { label: "Científico", color: "#00F5D4", emoji: "🔬" },
  poeta: { label: "Poeta / Escritor", color: "#fbbf24", emoji: "📖" },
  dato: { label: "Dato Curioso", color: "#7dd3fc", emoji: "✨" },
} as const

/**
 * WisdomCapsule widget — Cápsulas de Sabiduría para enfocar la mente
 * GDD V2: Frutiger Aero — tarjeta translúcida, icono de resplandor,
 * botón "Siguiente Sabiduría" con transición fade-in.
 */
export function WisdomCapsule() {
  const [idx, setIdx] = useState(0)

  // Frase aleatoria al cargar (montaje)
  useEffect(() => {
    setIdx(Math.floor(Math.random() * WISDOM_CAPSULES.length))
  }, [])

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % WISDOM_CAPSULES.length)
  }, [])

  const capsule = WISDOM_CAPSULES[idx]
  const meta = TYPE_META[capsule.type]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center animate-sparkle"
            style={{
              background: `linear-gradient(135deg, ${meta.color}30, ${meta.color}10)`,
              border: `1px solid ${meta.color}50`,
              boxShadow: `0 0 16px ${meta.color}40`,
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: meta.color }} />
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg">Cápsulas de Sabiduría</h3>
            <p className="text-xs text-muted-foreground">Enfocá tu mente antes de jugar</p>
          </div>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{
            background: `${meta.color}20`,
            color: meta.color,
            border: `1px solid ${meta.color}50`,
          }}
        >
          {meta.emoji} {meta.label}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={capsule.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl glass-wisdom p-5 sm:p-6"
        >
          {/* Quote icon decorativo */}
          <Quote
            className="absolute top-3 left-3 w-10 h-10 opacity-15"
            style={{ color: meta.color }}
          />

          <div className="relative">
            <p className="text-base sm:text-lg leading-relaxed font-medium italic">
              &ldquo;{capsule.text}&rdquo;
            </p>

            {capsule.author && (
              <div className="mt-3 flex items-center gap-2">
                <div className="h-px flex-1 max-w-[24px]" style={{ background: `${meta.color}80` }} />
                <span
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: meta.color }}
                >
                  {capsule.author}
                </span>
              </div>
            )}

            {capsule.context && !capsule.author && (
              <p className="mt-3 text-xs text-muted-foreground italic">
                {capsule.context}
              </p>
            )}
            {capsule.context && capsule.author && (
              <p className="mt-1 text-[11px] text-muted-foreground/80">
                {capsule.context}
              </p>
            )}
          </div>

          {/* Botón "Siguiente Sabiduría" */}
          <button
            onClick={next}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border"
            style={{
              background: `${meta.color}15`,
              color: meta.color,
              borderColor: `${meta.color}40`,
            }}
          >
            Siguiente Sabiduría
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Indicadores */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {WISDOM_CAPSULES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setIdx(i)}
                className="h-1 rounded-full transition-all"
                style={{
                  width: i === idx ? 16 : 4,
                  background: i === idx ? meta.color : "rgba(125, 211, 252, 0.3)",
                }}
                aria-label={`Ver cápsula ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
