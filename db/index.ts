import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não configurada. Setar via .env (Vercel/Neon).");
}

// `prepare: false` é recomendado para serverless (Neon, Vercel functions)
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
