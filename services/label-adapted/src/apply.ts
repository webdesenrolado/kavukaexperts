/**
 * Orquestrador LABEL adaptado.
 *
 * Recebe responses[] no formato canônico:
 *   { item_id: "p01a", value: 1..5 }
 *
 * Retorna envelope ApplicationResult conforme contrato.
 */

import type { ApplyInput, ApplicationResult } from "../../_contract/schema";
import { ITEMS, validateBalance } from "./items";
import {
  computeDimensionScores,
  computeBigFive,
  qualityIndices,
  type LabelRawResponse,
} from "./scoring";
import { buildInterpretation } from "./interpretation";
import { NORM_SOURCE, VALIDATED_FOR_BRAZIL } from "./norms";

export const INSTRUMENT_SLUG = "label-adapted" as const;
export const INSTRUMENT_VERSION = "1.0.0" as const;

function parseResponses(input: ApplyInput): LabelRawResponse[] {
  const out: LabelRawResponse[] = [];
  for (const r of input.responses) {
    const id = String(r.item_id);
    const v = typeof r.value === "number" ? r.value : Number(r.value);
    if (!Number.isFinite(v) || v < 1 || v > 5) continue;
    out.push({ item_id: id, value: Math.round(v) });
  }
  return out;
}

export function applyLabelAdapted(input: ApplyInput): ApplicationResult {
  const balance = validateBalance();
  // Sanity: deve ter ~9 itens por dimensão
  for (const [dim, n] of Object.entries(balance)) {
    if (typeof n === "number" && n < 4) {
      throw new Error(`Items unbalanced for ${dim}: ${n} (min 4)`);
    }
  }

  const responses = parseResponses(input);
  const dimensions = computeDimensionScores(responses);
  const bigFive = computeBigFive(responses);
  const quality = qualityIndices(responses);
  const interpretation = buildInterpretation(dimensions, bigFive);

  const appliedAt = new Date().toISOString();
  return {
    contract_version: "1.1.0",
    instrument: INSTRUMENT_SLUG,
    version: INSTRUMENT_VERSION,
    subject_id: input.subject_id,
    application_id: input.application_id,
    responses: input.responses,
    scores: {
      dimensions,
      big_five: bigFive,
      quality,
      norm_source: NORM_SOURCE,
      validated_for_brazil: VALIDATED_FOR_BRAZIL,
    },
    interpretation,
    quality_flags: quality.flags,
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
