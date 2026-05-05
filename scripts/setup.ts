/**
 * Setup all-in-one: roda seed básico + demo + demo-extra + inbox.
 * Usado após `drizzle-kit push` em Postgres novo (Neon).
 *
 *   tsx --env-file=.env scripts/setup.ts
 */

import { spawnSync } from "child_process";

const STEPS = [
  ["seed",          "scripts/seed.ts"],
  ["seed:demo",     "scripts/seed-demo.ts"],
  ["seed:demo-extra", "scripts/seed-demo-extra.ts"],
  ["seed:inbox",    "scripts/seed-inbox.ts"],
];

console.log("🚀 Setup completo Kavuka Experts\n");

for (const [name, script] of STEPS) {
  console.log(`\n━━━━━ ${name} ━━━━━`);
  const r = spawnSync("npx", ["tsx", "--env-file=.env", script], {
    stdio: "inherit",
  });
  if (r.status !== 0) {
    console.error(`❌ ${name} falhou`);
    process.exit(r.status ?? 1);
  }
}

console.log("\n✅ Setup completo. Rode `npm run dev` ou faça deploy.\n");
