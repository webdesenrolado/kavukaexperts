/**
 * Orquestrador Arquétipos.
 */

import type { ApplyInput, ApplicationResult } from "../../_contract/schema";
import { ITEMS, validateBalance } from "./items";
import { computeScores, qualityFlags, type RawResponse } from "./scoring";
import { buildInterpretation } from "./interpretation";
import { NORM_SOURCE, VALIDATED_FOR_BRAZIL } from "./norms";

export const INSTRUMENT_SLUG = "arquetipos" as const;
export const INSTRUMENT_VERSION = "1.0.0" as const;

function parseResponses(input: ApplyInput): RawResponse[] {
  const out: RawResponse[] = [];
  for (const r of input.responses) {
    const id = String(r.item_id);
    const v = typeof r.value === "number" ? r.value : Number(r.value);
    if (!Number.isFinite(v) || v < 1 || v > 5) continue;
    out.push({ item_id: id, value: Math.round(v) });
  }
  return out;
}

export function applyArquetipos(input: ApplyInput): ApplicationResult {
  const balance = validateBalance();
  for (const [a, n] of Object.entries(balance)) {
    if (typeof n === "number" && n < 3) {
      throw new Error(`Items unbalanced for ${a}: ${n}`);
    }
  }

  const responses = parseResponses(input);
  const scores = computeScores(responses);
  const interpretation = buildInterpretation(scores);
  const flags = qualityFlags(responses);

  const appliedAt = new Date().toISOString();
  return {
    contract_version: "1.1.0",
    instrument: INSTRUMENT_SLUG,
    version: INSTRUMENT_VERSION,
    subject_id: input.subject_id,
    application_id: input.application_id,
    responses: input.responses,
    scores: {
      ...scores,
      norm_source: NORM_SOURCE,
      validated_for_brazil: VALIDATED_FOR_BRAZIL,
    },
    interpretation,
    quality_flags: flags,
    consent_id: input.consent_id,
    data_retention_until: input.data_retention_until,
    meta: {
      applied_at: appliedAt,
      channel: input.meta?.channel ?? "web",
      language: input.meta?.language ?? "pt-BR",
      completion_time_seconds: input.meta?.completion_time_seconds ?? 0,
    },
  } as unknown as ApplicationResult;
}

export const TOTAL_ITEMS = ITEMS.length;
export { ITEMS };
