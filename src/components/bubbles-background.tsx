"use client"

import { useMemo } from "react"

/**
 * BubblesBackground
 * Frutiger Aero / Y2K Aquatic ambience: subtle floating bubbles rising upward.
 * Purely decorative — pointer-events:none, fixed, behind all content.
 *
 * Inspirado en la imagen: burbujas más realistas con brillo blanco,
 * tinte cian/azul y pequeño reflejo superior (specular highlight).
 */
export function BubblesBackground({ count = 22 }: { count?: number }) {
  const bubbles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 12 + Math.random() * 48
      const left = Math.random() * 100
      const duration = 11 + Math.random() * 11
      const delay = Math.random() * -22
      const opacity = 0.25 + Math.random() * 0.45
      return { i, size, left, duration, delay, opacity }
    })
  }, [count])

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {bubbles.map((b) => (
        <span
          key={b.i}
          className="absolute rounded-full animate-bubble"
          style={{
            left: `${b.left}%`,
            bottom: "-60px",
            width: `${b.size}px`,
            height: `${b.size}px`,
            background:
              "radial-gradient(circle at 30% 28%, rgba(255, 252, 247,0.92) 0%, rgba(255, 252, 247,0.55) 18%, rgba(176, 191, 174,0.35) 55%, rgba(110, 130, 160,0.15) 100%)",
            border: "1px solid rgba(255, 252, 247, 0.6)",
            boxShadow: `inset -2px -3px 6px rgba(110, 130, 160,0.18), inset 2px 2px 4px rgba(255, 252, 247,0.6), 0 0 ${b.size / 1.8}px rgba(138, 160, 136, 0.45)`,
            opacity: b.opacity,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
