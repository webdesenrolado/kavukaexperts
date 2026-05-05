/**
 * IPIP-NEO-120 interpretation builder.
 *
 * Pure function: scores + quality flags → Interpretation (canonical contract).
 *
 * Strings come from copy.ts. NEVER hardcode user-facing text here.
 */

import type {
  Confidence,
  Interpretation,
  QualityFlag,
  Score,
  ScoreLevel,
} from "../../_contract/schema";
import {
  DOMAIN_COPY,
  DEFAULT_NARRATIVE_HEADER,
  LEVEL_LABEL,
} from "./copy";
import { DOMAINS, type IpipDomain } from "./items";
import type { IpipScores } from "./scoring";

export interface BuildInterpretationInput {
  scores: IpipScores;
  qualityFlags?: QualityFlag[];
}

export function buildInterpretation(
  input: BuildInterpretationInput,
): Interpretation {
  const { scores, qualityFlags = [] } = input;

  const strengths: string[] = [];
  const watchouts: string[] = [];
  const narrativeParts: string[] = [DEFAULT_NARRATIVE_HEADER];

  for (const domain of DOMAINS) {
    const score = scores.domains[domain];
    if (!score) continue;

    const copy = DOMAIN_COPY[domain];
    const lvl = score.level;

    for (const s of copy.strengths[lvl] ?? []) strengths.push(s);
    for (const w of copy.watchouts[lvl] ?? []) watchouts.push(w);

    narrativeParts.push(buildDomainSentence(domain, score));
  }

  const narrative = narrativeParts.join(" ");
  const confidence = computeConfidence(scores, qualityFlags);

  return {
    strengths,
    watchouts,
    narrative,
    confidence,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildDomainSentence(domain: IpipDomain, score: Score): string {
  const copy = DOMAIN_COPY[domain];
  const levelLabel = LEVEL_LABEL[score.level];
  const head = `${copy.label} (${levelLabel}):`;
  const body = copy.narrative[score.level];
  return `${head} ${body}`;
}

/**
 * Confidence rules:
 *   - 0 quality flags → high
 *   - 1-2 flags or any answered domains < 5 → medium
 *   - >2 flags or domain has zero answered facets → low
 */
function computeConfidence(
  scores: IpipScores,
  flags: QualityFlag[],
): Confidence {
  const answeredDomains = DOMAINS.filter((d) => {
    const s = scores.domains[d];
    return s != null && s.raw > 0;
  }).length;

  if (flags.length > 2 || answeredDomains < 3) return "low";
  if (flags.length > 0 || answeredDomains < 5) return "medium";
  return "high";
}

/* ------------------------------------------------------------------ */
/* Re-exports for typing                                              */
/* ------------------------------------------------------------------ */

export type { Interpretation, ScoreLevel };
