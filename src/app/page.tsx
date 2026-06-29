"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { useGameStore } from "@/lib/store"
import { HomeScreen } from "@/components/screens/home-screen"
import { GameScreen } from "@/components/screens/game-screen"
import { ResultsScreen } from "@/components/screens/results-screen"
import { LootBoxScreen } from "@/components/screens/lootbox-screen"
import { ProfileScreen } from "@/components/screens/profile-screen"

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
      <AppRouter />
    </QueryClientProvider>
  )
}

function AppRouter() {
  const screen = useGameStore((s) => s.screen)

  switch (screen) {
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
      return <HomeScreen />
  }
}
