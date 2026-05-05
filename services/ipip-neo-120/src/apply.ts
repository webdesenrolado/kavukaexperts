/**
 * IPIP-NEO-120 application orchestrator.
 *
 * Pure function: ApplyInput → IpipApplicationResult (canonical envelope).
 *
 * Steps:
 *   1. Validate input via Zod.
 *   2. Compute quality flags from raw responses.
 *   3. Score (domains + facets).
 *   4. Build interpretation (strengths/watchouts/narrative/confidence).
 *   5. Assemble canonical envelope.
 */

import {
  CONTRACT_VERSION,
  applyInputSchema,
  type ApplyInput,
  type QualityFlag,
  type Response,
} from "../../_contract/schema";
import {
  ipipApplicationResultSchema,
  type IpipApplicationResult,
} from "./schema";
import { scoreIpipNeo120 } from "./scoring";
import { buildInterpretation } from "./interpretation";
import { ITEMS_BY_ID } from "./items";

export const INSTRUMENT_SLUG = "ipip-neo-120" as const;
export const INSTRUMENT_VERSION = "1.0.0" as const;

/**
 * Big Five flagship — full weight in the GUÉP Score Humano. MBTI-like,
 * arquétipos and other narrative-only instruments emit 0.0 here to avoid
 * double-counting (they correlate ~1:1 with this signal).
 */
export const SCORE_WEIGHT_IN_HUMAN_SCORE = 1.0 as const;

/**
 * Until Kavuka runs a Brazilian normative pilot (N >= 500), the percentile
 * normalization falls back to Johnson 2014 US-English data. The flag
 * `validated_for_brazil: false` in `norms.ts` keeps percentiles suppressed
 * by default; this string is the authoritative attribution embedded in the
 * envelope so any consumer can audit the basis for comparison.
 */
export const NORM_SOURCE = "johnson_2014_us" as const;

const TOTAL_ITEMS = 120;
const MIN_ITEM_TIME_MS = 800;
const MIN_TOTAL_TIME_S = 180; // 3 min hard floor for 120 Likert items
const STRAIGHTLINING_RUN_THRESHOLD = 25;

export function applyIpipNeo120(input: ApplyInput): IpipApplicationResult {
  const parsed = applyInputSchema.parse(input);
  const responses = parsed.responses;
  const scores = scoreIpipNeo120(responses);

  const qualityFlags = computeQualityFlags(responses, parsed.meta.completion_time_seconds);
  const interpretation = buildInterpretation({ scores, qualityFlags });

  const result: IpipApplicationResult = {
    instrument: INSTRUMENT_SLUG,
    version: INSTRUMENT_VERSION,
    contract_version: CONTRACT_VERSION,
    subject_id: parsed.subject_id,
    application_id: parsed.application_id,
    responses,
    scores,
    interpretation,
    meta: {
      applied_at: parsed.meta.applied_at ?? new Date().toISOString(),
      channel: parsed.meta.channel,
      completion_time_seconds: parsed.meta.completion_time_seconds ?? 0,
      language: parsed.meta.language ?? "pt-BR",
      version_of_instrument: INSTRUMENT_VERSION,
      norm_source: NORM_SOURCE,
      applier_id: parsed.meta.applier_id ?? null,
      tenant_id: parsed.meta.tenant_id,
    },
    quality_flags: qualityFlags,
    score_weight_in_human_score: SCORE_WEIGHT_IN_HUMAN_SCORE,
    consent_id: parsed.consent_id,
    data_retention_until: parsed.data_retention_until,
  };

  // Validate the envelope before handing off.
  return ipipApplicationResultSchema.parse(result);
}

/* ------------------------------------------------------------------ */
/* Quality flag computation                                            */
/* ------------------------------------------------------------------ */

function computeQualityFlags(
  responses: Response[],
  completionTimeSeconds: number | undefined,
): QualityFlag[] {
  const flags: QualityFlag[] = [];

  // incomplete: missing items vs full instrument size.
  const knownAnswered = responses.filter((r) => ITEMS_BY_ID[r.item_id]).length;
  if (knownAnswered < TOTAL_ITEMS) flags.push("incomplete");

  // too_fast: aggregate timing.
  const tooFastByMean = (() => {
    if (typeof completionTimeSeconds !== "number" || completionTimeSeconds <= 0) {
      return false;
    }
    return completionTimeSeconds < MIN_TOTAL_TIME_S;
  })();

  const itemTimes = responses
    .map((r) => r.response_time_ms)
    .filter((t): t is number => typeof t === "number");
  const tooFastByItem =
    itemTimes.length > 0 &&
    itemTimes.filter((t) => t < MIN_ITEM_TIME_MS).length / itemTimes.length > 0.5;

  if (tooFastByMean || tooFastByItem) flags.push("too_fast");

  // straightlining: run of identical raw values.
  const rawSequence = responses
    .map((r) => extractRaw(r.value))
    .filter((n): n is number => n != null);

  let longestRun = 1;
  let currentRun = 1;
  for (let i = 1; i < rawSequence.length; i++) {
    if (rawSequence[i] === rawSequence[i - 1]) {
      currentRun += 1;
      longestRun = Math.max(longestRun, currentRun);
    } else {
      currentRun = 1;
    }
  }
  if (longestRun >= STRAIGHTLINING_RUN_THRESHOLD) flags.push("straightlining");

  return flags;
}

function extractRaw(value: Response["value"]): number | null {
  if (typeof value === "number") return value;
  if (value.kind === "likert5" || value.kind === "likert7") return value.value;
  return null;
}
