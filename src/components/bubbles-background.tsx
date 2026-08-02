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
              "radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.12) 18%, rgba(120, 119, 198, 0.10) 55%, rgba(120, 119, 198, 0.04) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: `inset -2px -3px 6px rgba(255, 255, 255, 0.08), inset 2px 2px 4px rgba(255, 255, 255, 0.20), 0 0 ${b.size / 1.2}px rgba(255, 255, 255, 0.10)`,
            opacity: b.opacity * 0.6,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
