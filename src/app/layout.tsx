import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Tipografía "fancy" — italic serif elegante (estilo 𝒇𝒂𝒏𝒄𝒚 𝒕𝒆𝒙𝒕)
const playfair = Playfair_Display({
  variable: "--font-fancy",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trivials Wars — Donde el conocimiento es poder",
  description: "App de trivia gamificada con sistema de niveles, XP y loot boxes. 16 categorías, 4 modos de dificultad, rarezas de accesorios y mucho más.",
  keywords: ["trivia", "juego", "gamificación", "gacha", "preguntas", "quiz", "trivials wars"],
  authors: [{ name: "Trivials Wars" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${cormorant.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
