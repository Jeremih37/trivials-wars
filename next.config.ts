import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel maneja el output automáticamente.
  // Para self-hosting usa `bun run build:standalone` que setea standalone manualmente.
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Necesario para Prisma en serverless
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2"],
  // Permite que el serverless function tenga más memoria para Prisma
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
