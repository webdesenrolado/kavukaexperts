/**
 * Orquestrador DISC adaptado.
 *
 * Recebe respostas no formato canônico do contrato (responses[]):
 *   item_id: "B01-MOST" ou "B01-LEAST"
 *   value: "a" | "b" | "c" | "d" (letra da alternativa escolhida)
 *
 * Retorna envelope ApplicationResult conforme contrato.
 */

import type { ApplyInput, ApplicationResult } from "../../_contract/schema";
import { BLOCKS, validateBalance } from "./items";
import {
  computeRawScores,
  computeFinalScores,
  qualityFlags,
  type DiscRawResponse,
} from "./scoring";
import { buildInterpretation } from "./interpretation";
import { NORM_SOURCE, VALIDATED_FOR_BRAZIL } from "./norms";

export const INSTRUMENT_SLUG = "disc-adapted" as const;
export const INSTRUMENT_VERSION = "1.0.0" as const;

function parseResponses(input: ApplyInput): DiscRawResponse[] {
  const out: DiscRawResponse[] = [];
  for (const r of input.responses) {
    const id = String(r.item_id);
    // Aceita "B01-MOST"|"B01-LEAST"
    const m = /^(B\d{2})-(MOST|LEAST)$/i.exec(id);
    if (!m) continue;
    const blockId = m[1].toUpperCase();
    const pick = m[2].toLowerCase() as "most" | "least";
    const letter = String(r.value ?? "").toLowerCase().trim();
    if (letter !== "a" && letter !== "b" && letter !== "c" && letter !== "d") continue;
    out.push({ block_id: blockId, pick, letter: letter as "a" | "b" | "c" | "d" });
  }
  return out;
}

export function applyDiscAdapted(input: ApplyInput): ApplicationResult {
  // Sanity check: itens estão balanceados
  const balance = validateBalance();
  for (const k of ["D", "I", "S", "C"] as const) {
    if (balance[k] !== 24) {
      throw new Error(`Items unbalanced: ${k}=${balance[k]}, expected 24`);
    }
  }

  const responses = parseResponses(input);
  const flags = qualityFlags(responses);
  const raw = computeRawScores(responses);
  const final = computeFinalScores(raw);
  const interpretation = buildInterpretation(final);

  const appliedAt = new Date().toISOString();
  return {
    contract_version: "1.1.0",
    instrument: INSTRUMENT_SLUG,
    version: INSTRUMENT_VERSION,
    subject_id: input.subject_id,
    application_id: input.application_id,
    responses: input.responses,
    scores: {
      raw,
      ...final,
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

export const TOTAL_BLOCKS = BLOCKS.length;
export { BLOCKS };
