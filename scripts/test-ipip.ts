/**
 * Smoke test do microsserviço IPIP-NEO-120 chamado direto (sem HTTP).
 * Gera 120 respostas com variedade e imprime o envelope canônico.
 */

import { applyIpipNeo120 } from "../services/ipip-neo-120/src";
import { IPIP_NEO_120_ITEMS } from "../services/ipip-neo-120/src/items";

const responses = IPIP_NEO_120_ITEMS.map((item, idx) => ({
  item_id: item.item_id,
  value: { kind: "likert5" as const, value: ((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5 },
  response_time_ms: 2000 + (idx % 3) * 500,
}));

const envelope = applyIpipNeo120({
  subject_id: "test-subject-12345678",
  application_id: "test-application-87654321",
  responses,
  meta: {
    channel: "web",
    completion_time_seconds: 600,
    language: "pt-BR",
  },
  consent_id: "test-consent-id-aaaa",
  data_retention_until: new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString(),
});

console.log("✅ Envelope OK");
console.log("instrument:", envelope.instrument, "v", envelope.version);
console.log("contract_version:", envelope.contract_version);
console.log("score_weight_in_human_score:", envelope.score_weight_in_human_score);
console.log("meta.norm_source:", envelope.meta.norm_source);
console.log("quality_flags:", envelope.quality_flags);
console.log("\n--- domains ---");
for (const [d, score] of Object.entries(envelope.scores.domains)) {
  console.log(`  ${d}: raw=${score.raw.toFixed(1)}  z=${score.z_score?.toFixed(2)}  level=${score.level}`);
}
console.log("\n--- interpretation ---");
console.log("confidence:", envelope.interpretation.confidence);
console.log("strengths:", envelope.interpretation.strengths.length);
console.log("watchouts:", envelope.interpretation.watchouts.length);
console.log("narrative (first 200):", envelope.interpretation.narrative.slice(0, 200));
process.exit(0);
