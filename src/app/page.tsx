"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { useGameStore } from "@/lib/store"
import { LoginScreen } from "@/components/screens/login-screen"
import { WelcomeScreen } from "@/components/screens/welcome-screen"
import { HomeScreen } from "@/components/screens/home-screen"
import { GameScreen } from "@/components/screens/game-screen"
import { ResultsScreen } from "@/components/screens/results-screen"
import { LootBoxScreen } from "@/components/screens/lootbox-screen"
import { ProfileScreen } from "@/components/screens/profile-screen"
import { BubblesBackground } from "@/components/bubbles-background"

export default function Home() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={client}>
      <div className="relative min-h-screen">
        <BubblesBackground count={18} />
        <div className="relative" style={{ zIndex: 1 }}>
          <AppRouter />
        </div>
      </div>
    </QueryClientProvider>
  )
}

function AppRouter() {
  const screen = useGameStore((s) => s.screen)

  switch (screen) {
    case "login":
      return <LoginScreen />
    case "welcome":
      return <WelcomeScreen />
    case "home":
      return <HomeScreen />
    case "playing":
      return <GameScreen />
    case "results":
      return <ResultsScreen />
    case "lootbox":
      return <LootBoxScreen />
    case "profile":
      return <ProfileScreen />
    default:
      return <LoginScreen />
  }
}
