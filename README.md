# 🧠 Trivials Wars

> El conocimiento es poder — un juego de trivia arcade con sistema gacha, marcos desbloqueables y avatar personalizable.

![Paleta Galaxy Pop](https://img.shields.io/badge/paleta-Galaxy%20Pop-ec4899)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-Postgres-336791)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4)

## ✨ Características

- 🎮 **6 categorías** (Entretenimiento, Deporte, Historia, Matemáticas, Ciencia, Videojuegos)
- ⚡ **4 niveles de dificultad** (Fácil, Medio, Difícil, Experto) con multiplicadores de XP
- 🧠 **Pantalla de bienvenida** con carrusel de 8 datos curiosos de cultura general
- 🎨 **Sistema gacha** con 5 rarezas: Común, Inusual, Raro, Épico, Legendario
- 🖼️ **Avatar SVG personalizable** (cuerpo + sombrero + top + aura)
- 👑 **5 marcos desbloqueables** cada 10 niveles (Bronce, Plata, Oro, Diamante, Legendario)
- 📊 **Sistema de niveles y XP** con bonus por rapidez y racha
- 🎁 **Loot boxes** que se desbloquean al subir de nivel
- 📈 **Estadísticas**: victorias, derrotas, racha actual y mejor racha
- ✏️ **Personalización del nombre** del jugador
- 🔐 **Login con Google OAuth** o modo invitado

## 🚀 Quick start

```bash
# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu DATABASE_URL, NEXTAUTH_SECRET, etc.

# Crear tablas en la base de datos
bun run db:push

# Cargar preguntas de cultura general
bun run db:seed

# Iniciar servidor de desarrollo
bun run dev
```

Abre http://localhost:3000

## 🚢 Deploy en Vercel

Lee la guía completa en [`DEPLOY.md`](./DEPLOY.md).

Resumen rápido:
1. Sube el repo a GitHub
2. Importa en https://vercel.com/new
3. Crea una base de datos Postgres en Vercel Storage
4. Configura las variables de entorno (DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET)
5. Deploy ⚡
6. Corre `bun run db:push` y `bun run db:seed` contra la DB de producción

## 🎨 Paleta Galaxy Pop

| Token | Hex | Uso |
|-------|-----|-----|
| `--background` | `#0e0824` | Fondo (violeta eléctrico profundo) |
| `--primary` | `#ec4899` | Primario (rosa hot pink) |
| `--accent` | `#06b6d4` | Acento (cyan eléctrico) |
| `--chart-3` | `#fbbf24` | Dorado (highlights) |
| `--chart-4` | `#a855f7` | Púrpura |

## 🏗️ Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 4 + tw-animate-css
- **UI:** shadcn/ui (40+ componentes)
- **Animaciones:** Framer Motion
- **Estado:** Zustand + React Query
- **DB:** Prisma + PostgreSQL
- **Auth:** NextAuth (Google OAuth + Guest)
- **Runtime:** Bun

## 📁 Estructura

```
src/
├── app/
│   ├── api/              # 8 endpoints REST
│   │   ├── auth/login/
│   │   ├── game/start/
│   │   ├── game/answer/
│   │   ├── profile/
│   │   ├── profile/name/
│   │   ├── equip/
│   │   ├── equip-profile/
│   │   ├── inventory/
│   │   └── loot/open/
│   ├── page.tsx          # Router de pantallas
│   └── globals.css       # Paleta Galaxy Pop
├── components/
│   ├── screens/          # 7 pantallas
│   │   ├── login-screen.tsx
│   │   ├── welcome-screen.tsx     # Carrusel de datos curiosos
│   │   ├── home-screen.tsx        # Setup de partida
│   │   ├── game-screen.tsx        # Partida activa
│   │   ├── results-screen.tsx     # Resultados finales
│   │   ├── lootbox-screen.tsx     # Apertura de loot boxes
│   │   └── profile-screen.tsx     # Perfil + inventario
│   ├── avatar-svg.tsx
│   └── ui/               # shadcn/ui components
├── hooks/
│   └── use-game.ts       # Hooks de React Query
└── lib/
    ├── game.ts           # Lógica del juego (XP, niveles, gacha)
    ├── store.ts          # Zustand store
    ├── auth.ts           # Auth helpers
    ├── db.ts             # Prisma client
    ├── types.ts          # Types compartidos
    ├── gacha-catalog.tsx # Catálogo de items SVG
    └── profile-catalog.tsx # Marcos e iconos de perfil
```

## 📜 Scripts

| Script | Descripción |
|--------|-------------|
| `bun run dev` | Servidor de desarrollo |
| `bun run build` | Build de producción |
| `bun run start` | Servidor de producción |
| `bun run lint` | ESLint |
| `bun run db:push` | Crear/actualizar schema en DB |
| `bun run db:seed` | Cargar preguntas |
| `bun run db:generate` | Regenerar Prisma client |

## 📄 Licencia

MIT — Libre uso y modificación.

---

Hecho con 🧠 por Jeremih37
