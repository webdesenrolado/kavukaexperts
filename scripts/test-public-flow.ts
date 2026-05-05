/**
 * Smoke test do fluxo público completo:
 * cria candidato → cria convite → acessa SEM cookies → POST das 120 respostas → valida resultado
 */

import { db } from "../db";
import { candidates, invitations, assessments } from "../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { IPIP_NEO_120_ITEMS } from "../services/ipip-neo-120/src/items";

const BASE = "http://localhost:3355";
const MASTER = { email: "rodrigo.sasso@guep.com.br", password: "kavuka2026" };

async function main() {
  // 1. Cria candidato direto no DB
  const candidateId = nanoid();
  await db.insert(candidates).values({
    id: candidateId,
    name: "Maria Teste Pública",
    email: `pub-${candidateId.slice(0, 6)}@kavuka.local`,
    source: "web",
  });
  console.log(`+ candidato: ${candidateId}`);

  // 2. Login para criar convite
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(MASTER),
  });
  const setCookie = loginRes.headers.get("set-cookie");
  const cookieHeader = setCookie?.split(";")[0] || "";

  // 3. Cria convite
  const invRes = await fetch(`${BASE}/api/invitations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ candidateId, instrument: "ipip-neo-120" }),
  });
  const inv = await invRes.json();
  console.log(`+ convite token: ${inv.token.slice(0, 16)}...`);

  // 4. Acessa página pública SEM cookies
  const pageRes = await fetch(`${BASE}/aplicar/${inv.token}`);
  console.log(`+ /aplicar/[token] sem cookies → ${pageRes.status}`);

  // 5. POST das 120 respostas SEM cookies
  const responses = IPIP_NEO_120_ITEMS.map((item, idx) => ({
    item_id: item.item_id,
    value: { kind: "likert5" as const, value: ((idx % 5) + 1) },
    response_time_ms: 2000 + (idx % 4) * 400,
  }));

  const applyRes = await fetch(`${BASE}/api/public/invitations/${inv.token}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // SEM cookie
    body: JSON.stringify({
      consentLgpd: true,
      channel: "web",
      language: "pt-BR",
      completionTimeSeconds: 720,
      responses,
    }),
  });
  console.log(`+ POST público das 120 respostas → ${applyRes.status}`);
  const applyData = await applyRes.json();
  if (!applyRes.ok) {
    console.error("❌ falha:", JSON.stringify(applyData, null, 2));
    process.exit(1);
  }
  console.log(`  assessmentId: ${applyData.assessmentId}`);

  // 6. Valida persistência: invitation deve estar completed, assessment criado, candidate consent atualizado
  const updatedInv = await db.query.invitations.findFirst({ where: eq(invitations.id, inv.id) });
  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, applyData.assessmentId),
  });
  const updatedCandidate = await db.query.candidates.findFirst({ where: eq(candidates.id, candidateId) });

  console.log(`✓ invitation.status = ${updatedInv?.status}`);
  console.log(`✓ assessment.status = ${assessment?.status} (instrument: ${assessment?.instrument})`);
  console.log(`✓ candidate.consentLgpdAt = ${updatedCandidate?.consentLgpdAt ? "set" : "NULL"}`);

  // 7. Tenta submeter de novo no mesmo token (deve falhar)
  const dupeRes = await fetch(`${BASE}/api/public/invitations/${inv.token}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consentLgpd: true,
      channel: "web",
      responses,
      completionTimeSeconds: 100,
    }),
  });
  console.log(`+ tentativa duplicada → ${dupeRes.status} (esperado: 409)`);

  // 8. Cleanup
  await db.delete(assessments).where(eq(assessments.id, applyData.assessmentId));
  await db.delete(invitations).where(eq(invitations.id, inv.id));
  await db.delete(candidates).where(eq(candidates.id, candidateId));
  console.log("✓ cleanup ok");

  console.log("\n✅ Fluxo público OK");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
