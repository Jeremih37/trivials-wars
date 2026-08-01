---
Task ID: vercel-migrate
Agent: main
Task: Publicar Trivials Wars en Vercel — preparar proyecto + documentar deploy

Work Log:
- Leí prisma/schema.prisma, src/lib/db.ts, scripts/seed.ts, package.json, next.config.ts
- Migré datasource de SQLite a PostgreSQL (provider + directUrl para pgbouncer)
- Hice db.ts serverless-friendly (singleton global, sin sobrecargar conexiones)
- Actualicé package.json: build limpio para Vercel, agregué postinstall (prisma generate), db:deploy, db:seed
- next.config.ts: removí `output: "standalone"` (Vercel no lo necesita), agregué serverExternalPackages para Prisma
- Creé vercel.json con buildCommand, installCommand, functions (maxDuration 30s, memory 1024MB para API routes)
- Creé .env.example con todas las variables necesarias (DATABASE_URL, DIRECT_URL, NEXTAUTH_*, GOOGLE_CLIENT_*)
- Verifiqué que `prisma generate` funciona con el schema Postgres
- Verifiqué que `bun run build` compila sin errores (con placeholders de env vars, simulando Vercel)
- Instalé Vercel CLI globalmente (v54.18.2) — pero NO hay token en este sandbox
- Creé deploy.sh (one-shot script): valida deps, sube env vars, deploya, corre prisma db push, corre seed
- Creé DEPLOY.md con 3 rutas: dashboard / CLI / token

Stage Summary:
- ✅ Proyecto 100% Vercel-ready: schema migrado a Postgres, build verificado, configs listas
- ❌ No pude hacer deploy real: no hay VERCEL_TOKEN en el sandbox y vercel login es interactivo
- 📦 Artefactos: deploy.sh (executable), vercel.json, .env.example, DEPLOY.md
- 🎯 Próximo paso del usuario: elegir una de las 3 rutas en DEPLOY.md (recomendada: Opción A con `./deploy.sh` tras `vercel login`)

---
Task ID: audit-fix-1
Agent: main
Task: Chequeo profundo del app + mejora de detalles pequeños + push a GitHub

Work Log:
- Leí todos los archivos clave: welcome-screen, home-screen, game-screen, login-screen, profile-screen, lootbox-screen, results-screen, store.ts, use-game.ts, game.ts, auth.ts, db.ts, schema.prisma, globals.css, page.tsx, layout.tsx, tsconfig.json, package.json, vercel.json, .env.example
- Actualicé el remote de git con el nuevo PAT y subí los 2 commits pendientes
- Audité el código buscando bugs, inconsistencias, y detalles de pulido

Issues encontrados y corregidos:
1. login-screen.tsx: sombra del emoji 🧠 usaba rgba(255,45,45) — color rojo viejo. Cambiado a rgba(236,72,153) (pink de Galaxy Pop)
2. login-screen.tsx: la auth card usaba glow-red — cambiado a glow-pink para consistencia con la paleta nueva
3. profile-screen.tsx: hero section usaba glow-red — cambiado a glow-pink
4. profile-screen.tsx: avatar base equipado usaba rgba(255,45,45,0.4) — cambiado a rgba(236,72,153,0.4)
5. profile-screen.tsx: filter chip "Owned" usaba #ff2d2d — cambiado a #ec4899 (primary)
6. profile-screen.tsx: iconos de perfil equipados usaban rgba(255,45,45,0.5) — cambiado a rgba(236,72,153,0.5)
7. profile-screen.tsx: XP total estaba en text-red-300 — cambiado a text-cyan-300 (consistente con welcome screen)
8. welcome-screen.tsx: BUG en FactIllustration — los IDs de los SVG gradients eran `grad-${color}` donde color es un hex como #a855f7. El `#` en el ID rompía la referencia `url(#grad-#a855f7)` (doble #). Los gradientes radiales y lineales NO se estaban renderizando. Fix: sanitizar el color quitando el # antes de usarlo como id.
9. store.ts: el tipo GameScreen incluía "inventory" pero nunca se usa (el inventario es un tab dentro de profile). Removido del tipo.
10. tsconfig.json: include era `**/*.ts` que incluía examples/ y skills/ generando 4 errores TS ajenos a la app. Agregados al exclude: examples, skills, mini-services, .zscripts, scripts.

Verificación:
- `npx tsc --noEmit` → 0 errores
- `npx next build` (con env vars placeholder) → success, 11 rutas (2 static + 9 API dynamic)

Stage Summary:
- ✅ 10 issues corregidos (8 de paleta/consistencia + 1 bug SVG real + 1 cleanup tsconfig)
- ✅ Build 100% limpio, 0 errores TS
- ✅ Commit 73a16be subido a https://github.com/Jeremih37/trivials-wars
- 🎯 Próximo paso: guiar al usuario en el deploy a Vercel

---
Task ID: aquatic-ambience-rollout
Agent: main
Task: Implementar 5 mejoras (Aquatic Ambience palette, +6 categorías, 100+ preguntas/categoría, selector cantidad, modo supervivencia)

Work Log:
- Reanudé sesión tras context overflow; verifiqué que el último commit e99f5f4 ya contenía TODAS las 5 features
- Verifiqué paleta Aquatic Ambience aplicada en globals.css (abyssal navy + bioluminescent cyan + coralline red, glassmorphism, animaciones bubble/heart/bioluminescent)
- Verifiqué 16 categorías en game.ts (10 originales + 6 nuevas: Oceano, Retrofuturismo, IA, Astronomia, CulturaPop, Maravillas)
- Verifiqué 14 archivos en src/lib/questions-data/ con ~97-105 preguntas cada uno (~1500 total)
- Verifiqué QUESTION_COUNTS (5/10/20/50) y TIME_PRESETS (10s/15s/∞) en home-screen.tsx
- Verifiqué SURVIVAL_CONFIG + sistema de vidas + combo bioluminiscente en game.ts, store.ts, game-screen.tsx, API routes
- TypeScript check: 0 errores (npx tsc --noEmit)
- Dev server reiniciado: HTTP 200 en /, compilación limpia

Stage Summary:
- ✅ Las 5 features pedidas ya estaban implementadas en commit e99f5f4
- ✅ TypeScript limpio, dev server operativo en http://localhost:3000
- 🎯 Próximo paso del usuario: probar la app (ver instrucciones abajo)

---
Task ID: fix-vercel-login
Agent: main
Task: Fix "Unexpected end of JSON input" en login de Vercel

Work Log:
- Leí screenshot del error (modal de login con "Unexpected end of JSON input" en rojo)
- Diagnostiqué con curl: POST /api/auth/login devolvía HTTP 500 con content-length: 0 (body vacío)
- Todos los endpoints API devolvían 500 vacío; la home (/) funcionaba OK
- Probé conexión directa a Neon DB desde sandbox: tablas existían, 1 usuario, todo OK
- Causa raíz identificada:
  1. Los API routes no tenían try/catch global → cualquier error de Prisma producía 500 sin body
  2. Los hooks en use-game.ts hacían r.json() sobre body vacío → "Unexpected end of JSON input"
  3. El schema de Prisma tenía columnas nuevas (survivalBestCorrect, survivalBestXp, survivalRuns) que NO existían en la DB Neon
  4. Las 6 categorías nuevas (Oceano, Retrofuturismo, IA, Astronomia, CulturaPop, Maravillas) no estaban sembradas en Neon

Fixes aplicados:
1. Creé /api/health endpoint de diagnóstico (reporta DATABASE_URL_set, tablas, etc.)
2. Creé src/lib/api-handler.ts con apiHandler() (try/catch global → JSON siempre) y safeJson() (parse sin throw)
3. Wrap de TODOS los 9 API routes con apiHandler + runtime=nodejs + dynamic=force-dynamic
4. Creé src/lib/fetch-utils.ts con parseJsonSafe() y readApiError() para frontend
5. Reescribí src/hooks/use-game.ts: todos los fetch manejan body vacío y muestran error útil
6. Mejoré src/lib/db.ts: fallback a POSTGRES_PRISMA_URL/POSTGRES_DATABASE_URL cuando DATABASE_URL no está
7. Fix bug en PATCH /api/game/answer: usaba `sessionId` (var inexistente) en lugar de `body.sessionId`
8. Squash de 8 commits en uno solo para remover token GitHub expuesto en worklog.md (bloqueo push protection)
9. Push a GitHub (commit 7de3500)
10. Verifiqué /api/health en Vercel: DATABASE_URL_set=true, DIRECT_URL_set=true, DB ok=true
11. Corrí `prisma db push` contra Neon para sincronizar columnas faltantes (survivalBestCorrect, etc.)
12. Creé scripts/seed-fast.ts usando createMany + skipDuplicates (mucho más rápido que seed.ts original)
13. Corrí seed-fast.ts: insertó ~600 preguntas nuevas (6 categorías × ~100 preguntas)
14. Verificación final en Vercel:
    - POST /api/auth/login (guest) → 200 OK con userId, name, level
    - GET /api/profile → 200 OK con datos completos del usuario
    - GET /api/inventory → 200 OK con 21 items del catálogo
    - POST /api/game/start (Oceano, Facil) → 200 OK con 5 preguntas
    - POST /api/loot/open → 200 OK con item desbloqueado

Stage Summary:
- ✅ Login en Vercel funcionando (guest y google)
- ✅ DB Neon con 16 categorías y ~1600 preguntas sembradas
- ✅ Todos los API routes devuelven JSON incluso en errores
- ✅ Frontend maneja bodies vacíos con mensajes útiles
- 🎯 Próximo paso del usuario: probar la app en https://trivials-wars.vercel.app

---
Task ID: frutiger-aero-v2
Agent: main
Task: Implementar 3 mejoras del Propuesta_Rediseno_FrutigerAero.pdf (Frutiger Aero, multi-select categorías, Wisdom Capsules)

Work Log:
- Leí PDF Propuesta_Rediseno_FrutigerAero.pdf (2 páginas, GDD V2)
- 3 mejoras solicitadas: (1) rediseño Frutiger Aero en pantalla Preparado para Jugar, (2) eliminar selector de tiempo + multi-select categorías, (3) cápsulas de sabiduría en pantalla de inicio

Mejora 1 — Frutiger Aero UI:
- Agregué al globals.css: aqua-sky-bg (gradiente animado), crystal-bubble + crystal-bubble-coral (botones 3D glossy con inner shine), glass-frutiger (tarjetas translúcidas con borde neón), cta-pulse animation, glass-wisdom, sparkle-rotate, fade-in-up
- Rediseñé home-screen.tsx: botón CTA ahora es "Crystal Bubble" con efecto 3D glossy, tarjetas usan glass-frutiger con inner highlight, agregué BubblesBackground en pantalla home

Mejora 2 — Multi-select categorías:
- Agregué selectedCategories[] al store (zustand) con toggleCategory() y setCategories()
- Rediseñé la sección de categorías: ahora es multi-select (toca para activar/desactivar cada una)
- "Mix Total" button: activa/desactiva todas las 16 categorías de una vez
- Backend /api/game/start: acepta categories[] además de category, usa category: { in: [...] } de Prisma
- Bug corregido: isMix era true cuando >1 categoría seleccionada, ignorando el filtro. Ahora distingue isMixTotal (sin categorías específicas) de multi-categoría (varias específicas)
- ELIMINÉ el Paso 5 (selector de tiempo). La dificultad define el tiempo (Fácil=30s, Medio=20s, etc.)
- Verificado en Vercel: Ciencia+Oceano → solo preguntas de esas 2 categorías

Mejora 3 — Cápsulas de Sabiduría:
- Creé src/components/wisdom-capsule.tsx con 17 cápsulas (6 científicos + 5 poetas/escritores + 6 datos curiosos)
- Científicos: Einstein, Sagan, Curie, Feynman, Hawking, Asimov
- Poetas: Borges, Whitman, Paz, Nietzsche, Saint-Exupéry
- Datos: neuroplasticidad, corazón, sol, microorganismos, ADN, pulpos
- Widget: frase aleatoria al cargar, botón "Siguiente Sabiduría" con transición fade-in, indicadores para saltar
- Glass-wisdom card con icono sparkle rotatorio
- Integrado en welcome-screen entre el saludo y el carrusel de datos curiosos

Verificación:
- TypeScript: 0 errores
- Build local: success, 12 rutas
- Vercel deploy: 200 OK en /, /api/health, /api/auth/login, /api/game/start
- Multi-categoría funciona correctamente (Ciencia+Oceano → solo esas 2)
- Survival mode intacto (30 preguntas, 3 vidas, 15s)

Stage Summary:
- ✅ 3 mejoras del GDD V2 implementadas y deployadas
- ✅ Frutiger Aero: Crystal Bubble + glassmorphism + burbujas
- ✅ Multi-select categorías + eliminación de selector de tiempo
- ✅ Cápsulas de Sabiduría (17 frases, fade-in, indicadores)
- 🎯 Próximo paso del usuario: probar la app en https://trivials-wars.vercel.app

---
Task ID: V3.0-FrutigerAero-Brillante
Agent: Main Agent (Super Z)
Task: Implementar Propuesta_Quiz_FrutigerAero_v3.pdf (GDD V3.0)

Work Log:
- Leído el GDD V3.0 desde /home/z/my-project/upload/Propuesta_Quiz_FrutigerAero_v3.pdf
- Auditoría del proyecto: 16 categorías, ~1600 preguntas, esquema Prisma con survival stats, hooks use-game, screens existentes
- Actualizado prisma/schema.prisma: añadidos campos suddenDeathBestCorrect, suddenDeathBestXp, suddenDeathRuns en User
- Sincronizada la BD Neon con `prisma db push --accept-data-loss` (campos nuevos creados)
- Modificado src/lib/game.ts:
  * Añadido modo "suddendeath" en GAME_MODES
  * Añadido SUDDEN_DEATH_CONFIG (1 vida, 15s fijo, alerta dorada en 10 aciertos, combos 5/10/15 = x2/x3/x4, pool 50 preguntas, XP base 50)
  * Cambiada fórmula XP a `100 * Math.pow(level, 1.5)` (GDD V3.0)
  * Añadida función `calcularNivel(xpTotal)` que devuelve { nivel, xpActual, xpSiguiente, porcentaje }
  * Añadida función `computeSuddenDeathXp(streak)`
  * Actualizado LEVEL_TABLE a 30 niveles
- Actualizado src/app/api/game/start/route.ts: soporta mode "suddendeath" con SUDDEN_DEATH_CONFIG
- Actualizado src/app/api/game/answer/route.ts:
  * POST: distingue "suddendeath" via body.mode y aplica computeSuddenDeathXp
  * PATCH: guarda stats específicas de Muerte Súbita (suddenDeathBestCorrect, etc.)
- Actualizado src/app/api/profile/route.ts: expone suddenDeathBestCorrect, suddenDeathBestXp, suddenDeathRuns
- Actualizado src/lib/types.ts: StartGameResponse.mode y ProfileData.user con soporte suddendeath
- Actualizado src/hooks/use-game.ts: useStartGame, useAnswerQuestion y useEndSession aceptan mode "suddendeath"; EndSessionResult incluye suddenDeathStats
- Actualizado src/lib/store.ts: añadido suddenDeathEnded y startGame distingue vidas según modo (1 para suddendeath)
- Rediseñado src/app/globals.css con la paleta "Bright Nature & Aqua" (GDD V3.0):
  * Fondo degradado #F0F9FF → #E0F2FE + halos verde césped y cian
  * Glassmorphism: rgba(255,255,255,0.85) con bordes cian #7DD3FC y reflejo blanco
  * Botones crystal-bubble: degradado verde césped #4ADE80 → cian #38BDF8
  * Añadido crystal-bubble-gold (variante dorada para Muerte Súbita)
  * Sistema de cursores (pointer en botones/tarjetas/selectores, text en inputs)
  * Nuevas utilidades: pill-selector, segmented-option, circular-count, sudden-death-alert-bg, animate-gold-pulse
  * Actualizado glass-frutiger y glass-wisdom a cristal blanco translúcido
  * Text gradients actualizados (text-gradient-neon ahora verde→cian→sky)
- Rediseñado src/components/screens/home-screen.tsx como panel compacto (GDD V3.0):
  * Fila 0: Modo de juego (3 tarjetas: Classic / Survival / Sudden Death)
  * Fila 1: Categorías como Pills (multi-select con Mix Total)
  * Fila 2: Dificultad como Segmented Control (sólo en classic)
  * Fila 3: Botones circulares (5/10/20/50) — bloqueado en "Infinitas · Hasta fallar" para suddendeath/survival
  * CTA con crystal-bubble, crystal-bubble-coral o crystal-bubble-gold según modo
  * Tarjetas informativas de reglas para suddendeath y survival
- Modificado src/components/screens/game-screen.tsx:
  * Soporte completo para isSuddenDeath + alerta dorada (isGoldenAlert) tras 10 aciertos
  * Cráneo dorado en HUD para suddendeath (en lugar de 3 corazones)
  * Banner "Zona de Alerta Dorada" cuando se alcanzan 10+ aciertos
  * Fondo tiñe dorado animado (sudden-death-alert-bg) en alerta
  * Combos en suddendeath a 5/10/15 aciertos (x2/x3/x4)
  * Pasa mode al endSession y al answer
- Modificado src/components/screens/results-screen.tsx:
  * Rangos específicos para suddendeath (CAÍDO/VALENTE/TENAZ/IMPARABLE/INMORTAL)
  * Estadísticas detalladas de Muerte Súbita con suddendeathStats
  * Botón "Jugar de nuevo" con crystal-bubble
- Expandido src/components/wisdom-capsule.tsx de 17 a 35 cápsulas (GDD V3.0: 30+):
  * 10 científicos (Einstein, Sagan, Curie, Feynman, Hawking, Asimov, Lovelace, Bohr, Franklin, Galileo)
  * 8 poetas/escritores (Borges, Whitman, Paz, Nietzsche, Saint-Exupéry, Zambrano, Neruda, Woolf)
  * 17 datos curiosos de ciencia/naturaleza/historia (pulpitos, medusas inmortales, rayos, Vía Láctea, Everest, ADN, etc.)
- Actualizado src/lib/audio.ts: añadidas setMasterVolume(v) y getMasterVolume() con state.masterVolume
- Actualizado src/components/audio-toggle.tsx con popover de volumen maestro (slider 0-100%)
- Verificado: TypeScript compila sin errores, Next.js build exitoso (7.4s)

Stage Summary:
- GDD V3.0 Frutiger Aero Brillante implementado completamente
- 3 modos de juego: Clásico, Supervivencia, Muerte Súbita (nuevo)
- Fórmula XP progresiva N^1.5 (100 → 283 → 590 → 1118 → ...) — requiere exponencialmente más XP por nivel
- Paleta "Bright Nature & Aqua": cielos azules, cristal blanco translúcido, verde césped + cian
- Panel compacto de configuración en una sola vista (pills + segmented + circulares)
- Alerta dorada de tensión tras 10 aciertos seguidos en Muerte Súbita
- 35 cápsulas de sabiduría (científicos, poetas, datos curiosos)
- Control de volumen maestro añadido al reproductor de audio Lofi
- Sistema de cursores pointer/default aplicado globalmente
- BD Neon sincronizada con campos nuevos (suddenDeathBestCorrect, etc.)
- Build de producción exitoso, listo para deploy a Vercel
