"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useGameStore } from "@/lib/store"
import { useLogin } from "@/hooks/use-game"
import { Sparkles, LogIn, UserX, ShieldCheck, Trophy, Zap, Gift } from "lucide-react"

export function LoginScreen() {
  const { setScreen, setAuthenticated } = useGameStore()
  const loginMut = useLogin()
  const [showGoogleMock, setShowGoogleMock] = useState(false)
  const [mockEmail, setMockEmail] = useState("")

  const handleGuest = () => {
    loginMut.mutate(
      { provider: "guest" },
      {
        onSuccess: () => {
          setAuthenticated(true)
          setScreen("welcome")
        },
      }
    )
  }

  const handleGoogleDemo = () => {
    // Mock OAuth: simula el flujo de Google creando un usuario con email simulado
    const email = mockEmail || `jugador${Math.floor(Math.random() * 9999)}@gmail.com`
    const googleId = `google_${btoa(email).slice(0, 16)}`
    const name = email.split("@")[0].replace(/[._]/g, "").replace(/\b\w/g, (c) => c.toUpperCase())
    loginMut.mutate(
      { provider: "google", email, name, googleId },
      {
        onSuccess: () => {
          setAuthenticated(true)
          setScreen("welcome")
        },
      }
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="text-7xl mb-4 inline-block"
          style={{ filter: "drop-shadow(0 0 20px rgba(236,72,153,0.6))" }}
        >
          
        </motion.div>
        <h1 className="text-5xl sm:text-6xl font-fancy italic font-bold tracking-tight text-gradient-neon leading-none">
          Trivials<br/>Wars
        </h1>
        <p className="text-sm text-[#8090C0] mt-3 uppercase tracking-[0.3em] italic">
          El conocimiento es poder
        </p>
      </motion.div>

      {/* Features preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-2 mb-8 max-w-md w-full"
      >
        <FeaturePill icon={<Zap className="w-4 h-4" />} label="Gana XP" />
        <FeaturePill icon={<Trophy className="w-4 h-4" />} label="Sube de nivel" />
        <FeaturePill icon={<Gift className="w-4 h-4" />} label="Loot boxes" />
      </motion.div>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 glow-pink"
      >
        {!showGoogleMock ? (
          <>
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Inicia sesión
              </div>
              <h2 className="text-xl font-bold">Guarda tu progreso</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Inicia sesión para que tu nivel, victorias e inventario persistan entre sesiones.
              </p>
            </div>

            {/* Botón Google */}
            <button
              onClick={() => setShowGoogleMock(true)}
              disabled={loginMut.isPending}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 bg-[#131838] text-[#F0F4FF] hover:bg-[#1A1F4A] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            {/* Botón Invitado */}
            <button
              onClick={handleGuest}
              disabled={loginMut.isPending}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-card border border-border/60 hover:bg-card/70 transition disabled:opacity-50"
            >
              <UserX className="w-4 h-4" />
              Jugar como invitado
            </button>

            <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
              Al continuar aceptas los términos del juego. El progreso de invitado se guarda solo en este dispositivo.
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Iniciar con Google
              </div>
              <h2 className="text-xl font-bold">Bienvenido de vuelta</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Ingresa tu correo de Google para continuar (demo local).
              </p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Correo Google</span>
                <input
                  type="email"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  placeholder="tucorreo@gmail.com"
                  className="mt-1 w-full px-4 py-3 rounded-xl bg-input border border-border/60 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowGoogleMock(false)}
                  className="px-4 py-3 rounded-xl bg-card border border-border/60 hover:bg-card/70 transition text-sm font-bold"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleGoogleDemo}
                  disabled={loginMut.isPending}
                  className="flex-1 py-3 rounded-xl bg-[#131838] text-[#F0F4FF] hover:bg-[#1A1F4A] transition text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <GoogleIcon />
                  {loginMut.isPending ? "Conectando…" : "Continuar"}
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-2">
                 En esta demo, cualquier correo crea/recupera una cuenta local. En producción esto usaría OAuth real de Google.
              </p>
            </div>
          </>
        )}

        {loginMut.isError && (
          <p className="text-xs text-[#FF3366] text-center mt-3">
            {(loginMut.error as Error)?.message}
          </p>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-[10px] text-muted-foreground/60 mt-6"
      >
        Trivials Wars · MVP · 6 categorías · 4 modos · sistema gacha
      </motion.p>
    </div>
  )
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-card/40 border border-border/40">
      <span className="text-primary">{icon}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{label}</span>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
