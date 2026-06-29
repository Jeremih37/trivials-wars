#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  Trivials Wars — Deploy a Vercel (one-shot)
# ──────────────────────────────────────────────────────────────
#  Uso:
#    ./deploy.sh                  # asume vercel login previo (vercel login)
#    VERCEL_TOKEN=xxx ./deploy.sh # usa token en lugar de login interactivo
#
#  Qué hace:
#    1. Verifica dependencias (bun, vercel CLI)
#    2. Linkea/crea el proyecto en Vercel
#    3. Sube las variables de entorno (.env)
#    4. Deploy a producción
#    5. Crea el esquema en Postgres (prisma db push)
#    6. Corre el seed
# ──────────────────────────────────────────────────────────────
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# ── Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
ok()   { echo -e "${GREEN}✔ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

# ── Token argument
TOKEN_FLAG=""
if [ -n "$VERCEL_TOKEN" ]; then
  TOKEN_FLAG="--token $VERCEL_TOKEN"
  ok "Usando VERCEL_TOKEN del entorno"
else
  warn "No se encontró VERCEL_TOKEN — se asume vercel login previo"
fi

# ── 1. Verificar tooling
command -v bun >/dev/null 2>&1 || err "bun no está instalado. Instala: curl -fsSL https://bun.sh/install | bash"
command -v vercel >/dev/null 2>&1 || err "vercel CLI no está instalado. Instala: bun add -g vercel"

# ── 2. Verificar autenticación
echo ""
echo "── Verificando autenticación Vercel ──"
if [ -n "$VERCEL_TOKEN" ]; then
  vercel whoami $TOKEN_FLAG >/dev/null 2>&1 || err "Token inválido o expirado"
  ok "Autenticado como: $(vercel whoami $TOKEN_FLAG)"
else
  vercel whoami >/dev/null 2>&1 || {
    warn "No estás logueado. Ejecuta: vercel login"
    vercel login
  }
  ok "Autenticado como: $(vercel whoami)"
fi

# ── 3. Verificar .env
if [ ! -f .env ]; then
  warn "No hay .env — copiando de .env.example"
  cp .env.example .env
  err "Edita .env con tus credenciales reales (DATABASE_URL, GOOGLE_CLIENT_ID, etc.) y vuelve a correr este script"
fi

# Validar que .env no tenga placeholders
if grep -q "cambia-esto-por-un-secret-aleatorio" .env; then
  err "Tu .env aún tiene placeholders. Edita NEXTAUTH_SECRET y vuelve a intentar."
fi
if grep -q "postgresql://user:password" .env; then
  err "Tu .env aún tiene el DATABASE_URL de ejemplo. Configura tu Postgres real (Vercel Postgres / Neon / Supabase)."
fi

ok ".env OK"

# ── 4. Generar Prisma client
echo ""
echo "── Generando Prisma Client ──"
bun run db:generate
ok "Prisma client generado"

# ── 5. Linkear proyecto
echo ""
echo "── Linkeando proyecto a Vercel ──"
# Si ya está linkeado, --yes no pregunta; si no, lo crea con defaults
vercel link $TOKEN_FLAG --yes 2>/dev/null || true
ok "Proyecto linkeado"

# ── 6. Subir variables de entorno a Vercel
echo ""
echo "── Subiendo variables de entorno a Vercel (production) ──"
# Itera el .env y sube cada var
while IFS='=' read -r key value; do
  # Saltar comentarios y líneas vacías
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  # Saltar NODE_ENV (Vercel lo maneja solo)
  [ "$key" = "NODE_ENV" ] && continue
  # Quitar comillas si las hay
  value="${value%\"}"
  value="${value#\"}"
  vercel env add "$key" production $TOKEN_FLAG <<< "$value" 2>/dev/null || \
    vercel env rm "$key" production $TOKEN_FLAG --yes 2>/dev/null && \
    vercel env add "$key" production $TOKEN_FLAG <<< "$value" 2>/dev/null || true
done < .env
ok "Variables de entorno subidas"

# ── 7. Deploy a producción
echo ""
echo "── Deploy a producción ──"
DEPLOY_URL=$(vercel --prod $TOKEN_FLAG --yes 2>&1 | tail -1)
ok "Deployado en: $DEPLOY_URL"

# ── 8. Crear esquema en Postgres
echo ""
echo "── Creando esquema en Postgres (prisma db push) ──"
# Solo si tenemos DATABASE_URL válida
if bun run db:push 2>&1; then
  ok "Esquema creado en Postgres"
else
  err "prisma db push falló. Verifica tu DATABASE_URL/DIRECT_URL"
fi

# ── 9. Seed
echo ""
echo "── Poblando preguntas ──"
bun run db:seed
ok "Seed completo"

echo ""
echo "──────────────────────────────────────────────────────────────"
ok "🚀 Deploy completo!"
echo ""
echo "  App URL:  $DEPLOY_URL"
echo "  Dashboard: https://vercel.com/dashboard"
echo "──────────────────────────────────────────────────────────────"
