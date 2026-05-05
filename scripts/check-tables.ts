import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
  const r = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
  const names = (r as any[]).map((x) => x.table_name);
  console.log("Tabelas no Neon:", names.length === 0 ? "(VAZIO)" : names.join(", "));
  process.exit(0);
}
main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
