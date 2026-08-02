"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// ====== Banco de Cápsulas de Sabiduría (GDD V3.0 — Frutiger Aero Brillante) ======
// 30+ frases y datos divididos en: Científicos, Poetas/Escritores, Datos Curiosos de Ciencia/Naturaleza/Historia
interface WisdomCapsule {
  id: number
  type: "cientifico" | "poeta" | "dato"
  author?: string
  text: string
  context?: string
}

const WISDOM_CAPSULES: WisdomCapsule[] = [
  // ====== CIENTÍFICOS (10) ======
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
  {
    id: 18,
    type: "cientifico",
    author: "Ada Lovelace",
    text: "La máquina analítica no tiene pretensión alguna de crear nada. Puede ejecutar cualquier cosa que sepamos cómo ordenarle.",
    context: "Primera programadora de la historia (1843)",
  },
  {
    id: 19,
    type: "cientifico",
    author: "Niels Bohr",
    text: "Lo contrario de un hecho correcto es un error falso. Pero lo contrario de una verdad profunda puede ser otra verdad profunda.",
    context: "Físico cuántico, Premio Nobel",
  },
  {
    id: 20,
    type: "cientifico",
    author: "Rosalind Franklin",
    text: "La ciencia, para el científico, proporciona una vida cotidiana llena de interés y abre el camino hacia futuros gloriosos.",
    context: "Química pionera en el estudio del ADN",
  },
  {
    id: 21,
    type: "cientifico",
    author: "Galileo Galilei",
    text: "La matemática es el lenguaje con el cual Dios ha escrito el universo.",
    context: "Astrónomo y físico, padre del método científico",
  },
  // ====== POETAS / ESCRITORES (8) ======
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
  {
    id: 22,
    type: "poeta",
    author: "María Zambrano",
    text: "La luz se hace paso a través de las grietas. La razón es siempre un claroscuro de la carne y del espíritu.",
    context: "Filósofa española, Premio Cervantes 1988",
  },
  {
    id: 23,
    type: "poeta",
    author: "Pablo Neruda",
    text: "Podemos cortar todas las flores, pero no podemos detener la primavera.",
    context: "Poeta chileno, Premio Nobel 1971",
  },
  {
    id: 24,
    type: "poeta",
    author: "Virginia Woolf",
    text: "Los libros continúan siendo los pájaros cantores que nos ofrecen lecciones en los árboles del alma.",
    context: "Escritora modernista, 'Una habitación propia'",
  },
  // ====== DATOS CURIOSOS — CIENCIA Y NATURALEZA (15+) ======
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
  {
    id: 25,
    type: "dato",
    text: "Un rayo contiene suficiente energía para tostar 100,000 rebanadas de pan. Cada uno mide hasta 5 veces más caliente que la superficie del Sol.",
    context: "La atmósfera como generador de fuegos estelares",
  },
  {
    id: 26,
    type: "dato",
    text: "Las medusas Turritopsis dohrnii son biológicamente inmortales: pueden revertir su ciclo vital y empezar de nuevo.",
    context: "El único animal conocido que puede rejuvecerer",
  },
  {
    id: 27,
    type: "dato",
    text: "La Gran Barrera de Coral es la estructura viva más grande del planeta: 2,300 km de largo, visible desde el espacio.",
    context: "Una ciudad de coral que llevaba 20,000 años creciendo",
  },
  {
    id: 28,
    type: "dato",
    text: "El agua que bebés hoy puede haber sido bebida por un dinosaurio hace 75 millones de años. El agua de la Tierra no aumenta ni desaparece.",
    context: "El ciclo del agua conecta a toda la historia de la vida",
  },
  {
    id: 29,
    type: "dato",
    text: "Las estrellas de neutrones son tan densas que una cucharadita pesaría 6 mil millones de toneladas en la Tierra.",
    context: "La materia en su estado más extremo del universo",
  },
  {
    id: 30,
    type: "dato",
    text: "Los hongos están más cerca evolutivamente de los animales que de las plantas. Compartimos un ancestro común de hace 1,500 millones de años.",
    context: "Los reinos de la vida se cruzan en lugares insospechados",
  },
  {
    id: 31,
    type: "dato",
    text: "La Vía Láctea y la galaxia de Andrómeda se están acercando a 110 km/s. Chocarán dentro de 4,500 millones de años.",
    context: "Una colisión cósmica que creará una nueva galaxia elíptica",
  },
  {
    id: 32,
    type: "dato",
    text: "El monte Everest sigue creciendo 4 mm al año por la colisión de las placas tectónicas India y Euroasiática.",
    context: "La Tierra sigue viva y reconfigurándose bajo nuestros pies",
  },
  {
    id: 33,
    type: "dato",
    text: "Una sola gota de agua de mar contiene millones de virus, bacterias y microorganismos. El océano es la biblioteca genética más grande del planeta.",
    context: "Invisible a simple vista, pero esencial para el clima global",
  },
  {
    id: 34,
    type: "dato",
    text: "El ser humano comparte el 50% de su ADN con un plátano y el 98.8% con un chimpancé. La vida es una sola familia.",
    context: "El árbol de la vida nos une a todas las especies",
  },
  {
    id: 35,
    type: "dato",
    text: "La Biblioteca de Alejandría tenía hasta 700,000 rollos. Su pérdida retrasó el avance científico en 1,000 años.",
    context: "El conocimiento es frágil — cuidarlo es un acto de civilización",
  },
  {
    id: 36,
    type: "dato",
    text: "La teoría de la evolución de Darwin y la teoría de la relatividad de Einstein se publicaron con menos de 50 años de diferencia.",
    context: "Los grandes saltos del pensamiento humano a veces vienen juntos",
  },
]

const TYPE_META = {
  cientifico: { label: "Científico", color: "#a5b4fc" },
  poeta: { label: "Poeta / Escritor", color: "#fbbf24" },
  dato: { label: "Dato Curioso", color: "#86efac" },
} as const

/**
 * WisdomCapsule widget — Cápsulas de Sabiduría.
 * Estilo: editorial dark minimal, sin emojis ni glassmorphism saturado.
 */
// Genera un array barajado de n índices (Fisher-Yates)
function shuffleIds(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function WisdomCapsule() {
  // Orden barajado + posición dentro del ciclo → aleatorio infinito
  const [order, setOrder] = useState<number[]>(() => shuffleIds(WISDOM_CAPSULES.length))
  const [pos, setPos] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Auto-rotación cada 6.5s
  useEffect(() => {
    if (!autoPlay) return
    const t = setInterval(() => {
      setPos((p) => {
        const next = p + 1
        if (next >= WISDOM_CAPSULES.length) {
          // Al terminar el ciclo, re-barajar para infinito sin repetir consecutivas
          setOrder(shuffleIds(WISDOM_CAPSULES.length))
          return 0
        }
        return next
      })
    }, 6500)
    return () => clearInterval(t)
  }, [autoPlay])

  const goNext = useCallback(() => {
    setPos((p) => {
      const next = p + 1
      if (next >= WISDOM_CAPSULES.length) {
        setOrder(shuffleIds(WISDOM_CAPSULES.length))
        return 0
      }
      return next
    })
  }, [])
  const goPrev = useCallback(() => {
    setPos((p) => (p - 1 + WISDOM_CAPSULES.length) % WISDOM_CAPSULES.length)
  }, [])

  const capsule = WISDOM_CAPSULES[order[pos]]
  const meta = TYPE_META[capsule.type]

  return (
    <div
      className="flex flex-col"
      onPointerEnter={() => setAutoPlay(false)}
      onPointerLeave={() => setAutoPlay(true)}
    >
      {/* Header de sección */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-baseline gap-2">
          <h2 className="font-fancy italic text-sm font-bold text-white tracking-tight">
            Cápsulas de Sabiduría
          </h2>
          <span className="text-[8px] uppercase tracking-[0.18em] text-zinc-500 hidden sm:inline">
            {pos + 1} / {WISDOM_CAPSULES.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoPlay((v) => !v)}
            className={cn(
              "px-1.5 py-0.5 rounded-md text-[8px] font-medium border transition tracking-wide",
              autoPlay
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/10 text-zinc-400 hover:text-white"
            )}
          >
            {autoPlay ? "Auto ON" : "Auto OFF"}
          </button>
          <span
            className="text-[8px] font-medium uppercase tracking-[0.18em] flex items-center gap-1"
            style={{ color: meta.color }}
          >
            <span className="w-1 h-1 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={capsule.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-lg bg-white/[0.02] border border-white/10 p-2.5"
        >
          {/* Línea de color lateral */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px]"
            style={{ background: meta.color }}
          />

          <div className="space-y-1.5">
            {/* Texto principal */}
            <div className="min-w-0 space-y-1">
              <p className="font-fancy italic text-xs sm:text-sm leading-snug text-white tracking-tight">
                &ldquo;{capsule.text}&rdquo;
              </p>

              {capsule.author && (
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="h-px w-4" style={{ background: `${meta.color}80` }} />
                  <span
                    className="text-[10px] font-semibold tracking-wide"
                    style={{ color: meta.color }}
                  >
                    {capsule.author}
                  </span>
                  {capsule.context && (
                    <span className="text-[9px] text-zinc-500 hidden lg:inline line-clamp-1">
                      · {capsule.context}
                    </span>
                  )}
                </div>
              )}

              {!capsule.author && capsule.context && (
                <p className="text-[9px] text-zinc-500 pt-0.5">{capsule.context}</p>
              )}
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/5">
              <span className="text-[9px] text-zinc-500 tabular-nums">
                {pos + 1} / {WISDOM_CAPSULES.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={goPrev}
                  className="p-0.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-2.5 h-2.5 text-zinc-300" />
                </button>
                <button
                  onClick={goNext}
                  className="px-2 py-0.5 rounded-md text-[9px] font-medium uppercase tracking-[0.18em] border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-1 text-zinc-200"
                >
                  Siguiente
                  <ChevronRight className="w-2 h-2" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
