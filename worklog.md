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
