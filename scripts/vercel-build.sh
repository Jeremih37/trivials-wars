#!/usr/bin/env bash
# Build script para Vercel — hace prisma db push + next build
# Se ejecuta durante el deploy con env vars decrypted disponibles.
set -e

echo "=== Build script iniciando ==="
echo "POSTGRES_DATABASE_URL length: ${#POSTGRES_DATABASE_URL}"
echo "POSTGRES_DATABASE_URL_UNPOOLED length: ${#POSTGRES_DATABASE_URL_UNPOOLED}"
echo "DATABASE_URL length: ${#DATABASE_URL}"
echo "DIRECT_URL length: ${#DIRECT_URL}"

# Para prisma db push, usamos las URLs Postgres explícitas (encrypted → disponibles en build)
# Si las sensitive DATABASE_URL/DIRECT_URL están vacías en build, caemos a las Postgres
export DATABASE_URL="${DATABASE_URL:-$POSTGRES_DATABASE_URL}"
export DIRECT_URL="${DIRECT_URL:-$POSTGRES_DATABASE_URL_UNPOOLED}"

echo "DATABASE_URL final length: ${#DATABASE_URL}"
echo "DIRECT_URL final length: ${#DIRECT_URL}"

# Push schema a Postgres (crea tablas/columnas nuevas si hace falta)
echo "=== Running prisma db push ==="
prisma db push --accept-data-loss

# Build Next.js
echo "=== Running next build ==="
bun run build

echo "=== Build completo ==="
