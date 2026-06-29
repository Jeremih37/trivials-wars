# 🚀 Deploy en Vercel — Trivials Wars

Este proyecto está 100% listo para Vercel. Sigue **una** de las 3 rutas.

---

## ⚡ Opción A — Deploy con un solo comando (recomendada)

Si tienes `bun` instalado en tu PC:

```bash
# 1) Clona o copia este proyecto a tu máquina
cd /ruta/al/proyecto

# 2) Loguéate en Vercel (solo la primera vez)
vercel login

# 3) Crea tu .env basado en .env.example
cp .env.example .env
# Edita .env con tus credenciales reales (ver sección "Variables" abajo)

# 4) Deploy 🚀
./deploy.sh
```

El script `deploy.sh` hace todo automáticamente:
- Verifica dependencias
- Sube variables de entorno a Vercel
- Deploy a producción
- Crea esquema Postgres (`prisma db push`)
- Puebla las preguntas (seed)

---

## 🌐 Opción B — Deploy desde el dashboard de Vercel

1. Sube el proyecto a GitHub (o cualquier Git provider)
2. Entra a https://vercel.com/new
3. Importa el repo
4. **NO toques el build command** — Vercel detecta Next.js automáticamente
5. **Antes de click "Deploy"**, añade estas variables de entorno:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://...` (ver abajo) |
| `DIRECT_URL` | `postgresql://...` (ver abajo) |
| `NEXTAUTH_SECRET` | genera con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` (lo obtienes después del primer deploy) |
| `GOOGLE_CLIENT_ID` | tu client ID de Google OAuth |
| `GOOGLE_CLIENT_SECRET` | tu client secret de Google OAuth |

6. Click **Deploy**
7. Después del deploy, **corre migración y seed** desde tu PC:

```bash
# Con el .env apuntando a la DB de producción
bun run db:push
bun run db:seed
```

---

## 🔑 Opción C — Deploy por token (para CI/CD o desde este sandbox)

Si tienes un Vercel Access Token (https://vercel.com/account/tokens):

```bash
VERCEL_TOKEN=tu_token_aqui ./deploy.sh
```

---

## 🗄️ Base de datos PostgreSQL

SQLite **no funciona** en Vercel (filesystem efímero). El schema ya está migrado a Postgres. Elige una:

### Vercel Postgres (recomendado)
1. En tu proyecto Vercel → **Storage** tab → **Create** → **Postgres**
2. Acepta defaults, se crea automáticamente
3. Click **Connect Project**
4. Copia `DATABASE_URL` y `DIRECT_URL` desde el panel a tus env vars

### Neon (alternativa serverless)
1. Crea cuenta en https://neon.tech
2. Crea un proyecto, copia la **pooled connection** → `DATABASE_URL`
3. Copia la **direct connection** → `DIRECT_URL`

### Supabase (alternativa con dashboard completo)
1. Crea proyecto en https://supabase.com
2. Settings → Database → Connection string
3. `DATABASE_URL` y `DIRECT_URL` = la misma URL (Supabase no requiere pgbouncer distinto)

---

## 🔐 Google OAuth

1. Ve a https://console.cloud.google.com/apis/credentials
2. Crea un OAuth 2.0 Client ID (tipo: Web application)
3. **Authorized redirect URIs**:
   - `https://tu-proyecto.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (para dev local)
4. Copia Client ID y Client Secret a tus env vars

---

## ✅ Verificación post-deploy

Después del deploy, visita:
- `https://tu-proyecto.vercel.app/` → debe cargar la pantalla de login
- Inicia sesión con Google o como invitado
- Juega una partida → debe guardar resultados
- Abre una loot box → debe persistir items
- Visita tu perfil → datos deben sobrevivir reload

Si algo falla, revisa los logs en `https://vercel.com/[tu-usuario]/[tu-proyecto]/logs`.

---

## 🛟 Rollback local

Para desarrollo local con SQLite (legacy):

```bash
# El schema.prisma está en Postgres ahora. Para volver a SQLite localmente,
# cambia provider de vuelta a "sqlite" y restaura .env a file:./db/custom.db
```
