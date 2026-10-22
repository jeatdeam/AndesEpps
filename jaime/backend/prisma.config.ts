// lee backend/.env (DATABASE_URL y DIRECT_URL de supabase)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // los comandos de prisma (migrate, studio) van por la conexion directa; el backend usa DATABASE_URL
  datasource: {
    url: env("DIRECT_URL"),
  },
});
