"use client"

import { useMemo } from "react"

/**
 * BubblesBackground
 * Frutiger Aero / Y2K Aquatic ambience: subtle floating bubbles rising upward.
 * Purely decorative — pointer-events:none, fixed, behind all content.
 */
export function BubblesBackground({ count = 18 }: { count?: number }) {
  const bubbles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 8 + Math.random() * 28
      const left = Math.random() * 100
      const duration = 9 + Math.random() * 9
      const delay = Math.random() * -18
      const opacity = 0.15 + Math.random() * 0.35
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
            bottom: "-40px",
            width: `${b.size}px`,
            height: `${b.size}px`,
            background:
              "radial-gradient(circle at 30% 30%, rgba(0,245,212,0.45) 0%, rgba(0,180,216,0.18) 60%, rgba(0,180,216,0.05) 100%)",
            border: "1px solid rgba(0, 245, 212, 0.35)",
            boxShadow: `0 0 ${b.size / 2}px rgba(0, 245, 212, 0.35)`,
            opacity: b.opacity,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
