/**
 * Smoke test end-to-end: cria um candidato, autentica, POST para o endpoint
 * de aplicação do IPIP, e verifica que persistiu na tabela `assessments`.
 */

import { nanoid } from "nanoid";
import { db } from "../db";
import { candidates, assessments } from "../db/schema";
import { eq } from "drizzle-orm";
import { IPIP_NEO_120_ITEMS } from "../services/ipip-neo-120/src/items";

const BASE_URL = "http://localhost:3355";
const MASTER = { email: "rodrigo.sasso@guep.com.br", password: "kavuka2026" };

async function main() {
  // 1. Criar candidato de teste
  const candidateId = nanoid();
  await db.insert(candidates).values({
    id: candidateId,
    name: "Candidato Teste IPIP",
    email: `teste-${candidateId.slice(0, 6)}@kavuka.local`,
    phone: "+5511999990000",
    source: "web",
    consentLgpdAt: new Date(),
  });
  console.log(`+ candidato criado: ${candidateId}`);

  // 2. Autenticar
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(MASTER),
  });
  if (!loginRes.ok) throw new Error(`Login falhou: ${loginRes.status}`);
  const setCookie = loginRes.headers.get("set-cookie");
  const tokenCookie = setCookie?.split(",").find((c) => c.includes("kavuka_token=")) || setCookie;
  const cookieHeader = tokenCookie?.split(";")[0] || "";
  console.log(`+ autenticado`);

  // 3. Build payload (120 respostas)
  const responses = IPIP_NEO_120_ITEMS.map((item, idx) => ({
    item_id: item.item_id,
    value: { kind: "likert5" as const, value: ((idx % 5) + 1) },
    response_time_ms: 2000 + (idx % 3) * 500,
  }));

  // 4. POST para o endpoint
  const applyRes = await fetch(`${BASE_URL}/api/instruments/ipip-neo-120/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      candidateId,
      responses,
      channel: "web",
      language: "pt-BR",
      completionTimeSeconds: 600,
    }),
  });

  console.log(`+ POST /apply → ${applyRes.status}`);
  const envelope = await applyRes.json();
  if (!applyRes.ok) {
    console.error("Resposta:", JSON.stringify(envelope, null, 2));
    process.exit(1);
  }

  console.log(`  instrument: ${envelope.instrument} v${envelope.version}`);
  console.log(`  contract_version: ${envelope.contract_version}`);
  console.log(`  score_weight: ${envelope.score_weight_in_human_score}`);
  console.log(`  norm_source: ${envelope.meta.norm_source}`);

  // 5. Verifica persistência no DB
  const stored = await db.query.assessments.findFirst({
    where: eq(assessments.id, envelope.application_id),
  });
  if (!stored) {
    console.error("❌ Não persistiu");
    process.exit(1);
  }
  console.log(`✓ persistido: ${stored.id} (status=${stored.status})`);
  console.log(`  scores armazenados: ${stored.scoresJson?.slice(0, 80)}...`);

  // 6. Limpeza opcional — comentar pra inspecionar
  await db.delete(assessments).where(eq(assessments.id, stored.id));
  await db.delete(candidates).where(eq(candidates.id, candidateId));
  console.log("✓ cleanup ok");

  console.log("\n✅ End-to-end OK");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
