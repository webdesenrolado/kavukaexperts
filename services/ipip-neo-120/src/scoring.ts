/**
 * IPIP-NEO-120 scoring.
 *
 * Pure, deterministic, side-effect-free.
 *
 * Inputs: Response[] (canonical contract shape).
 * Outputs: { domains, facets } where each entry is a Score (raw, percentile, level, z_score).
 *
 * Scoring rules:
 *   - Each item is Likert 1..5.
 *   - Reverse-keyed items: contribution = 6 - raw.
 *   - Facet raw = sum of 4 items (range 4..20).
 *   - Domain raw = sum of 6 facets = 24 items (range 24..120).
 *   - Missing items: skipped; if any item of a facet is missing, the facet
 *     is mean-imputed using the remaining items × 4 (so the facet retains
 *     a 4..20 scale). If a facet has zero answered items, that facet is
 *     omitted from the output map.
 *   - Level mapping: z-score thresholds — see LEVEL_THRESHOLDS.
 */

import type { Response, Score, ScoreLevel } from "../../_contract/schema";
import {
  FACETS,
  FACET_TO_DOMAIN,
  DOMAINS,
  ITEMS_BY_ID,
  type IpipDomain,
  type IpipFacet,
} from "./items";
import {
  DOMAIN_NORMS,
  FACET_NORMS,
  percentileFromZ,
  zScore,
} from "./norms";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface IpipScores {
  domains: Record<IpipDomain, Score>;
  facets: Partial<Record<IpipFacet, Score>>;
}

interface NormalisedResponse {
  item_id: string;
  /** Raw 1..5 (already collapsed from union value). */
  raw: number;
}

/* ------------------------------------------------------------------ */
/* Public entry                                                       */
/* ------------------------------------------------------------------ */

export function scoreIpipNeo120(responses: Response[]): IpipScores {
  const normalised = normaliseResponses(responses);
  const itemContributions = buildItemContributions(normalised);

  const facets = scoreFacets(itemContributions);
  const domains = scoreDomains(facets);

  return { domains, facets };
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                      */
/* ------------------------------------------------------------------ */

function normaliseResponses(responses: Response[]): NormalisedResponse[] {
  const out: NormalisedResponse[] = [];
  const seen = new Set<string>();

  for (const r of responses) {
    if (seen.has(r.item_id)) continue; // drop duplicates, first wins
    seen.add(r.item_id);

    const raw = extractLikert5(r.value);
    if (raw == null) continue; // unsupported value type for this instrument

    if (!ITEMS_BY_ID[r.item_id]) continue; // unknown item — skip silently

    out.push({ item_id: r.item_id, raw });
  }

  return out;
}

function extractLikert5(value: Response["value"]): number | null {
  if (typeof value === "number") {
    if (value >= 1 && value <= 5 && Number.isInteger(value)) return value;
    return null;
  }
  if (typeof value === "string") return null;
  if (value.kind === "likert5") return value.value;
  // Other kinds (likert7, forced_choice, multiple_choice) are not valid for IPIP.
  return null;
}

/* ------------------------------------------------------------------ */
/* Item-level contributions (apply reverse keying)                    */
/* ------------------------------------------------------------------ */

function buildItemContributions(rs: NormalisedResponse[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const r of rs) {
    const item = ITEMS_BY_ID[r.item_id];
    if (!item) continue;
    const contribution = item.reverse_keyed ? 6 - r.raw : r.raw;
    out.set(r.item_id, contribution);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Facet aggregation                                                  */
/* ------------------------------------------------------------------ */

function scoreFacets(
  contributions: Map<string, number>,
): Partial<Record<IpipFacet, Score>> {
  const out: Partial<Record<IpipFacet, Score>> = {};

  for (const facet of FACETS) {
    const facetItems = facetItemIds(facet);
    const answered: number[] = [];
    for (const id of facetItems) {
      const c = contributions.get(id);
      if (c != null) answered.push(c);
    }
    if (answered.length === 0) continue;

    // Mean-imputation on the facet's 4 items so the raw stays on a 4..20 scale.
    const mean = answered.reduce((a, b) => a + b, 0) / answered.length;
    const raw = round1(mean * facetItems.length);

    const norms = FACET_NORMS[facet];
    const z = zScore(raw, norms);
    const percentile = norms.validated_for_brazil ? percentileFromZ(z) : undefined;
    const level = levelFromZ(z);

    out[facet] = {
      raw,
      percentile,
      level,
      z_score: round2(z),
    };
  }

  return out;
}

function facetItemIds(facet: IpipFacet): string[] {
  return Object.values(ITEMS_BY_ID)
    .filter((it) => it.facet === facet)
    .map((it) => it.item_id);
}

/* ------------------------------------------------------------------ */
/* Domain aggregation                                                 */
/* ------------------------------------------------------------------ */

function scoreDomains(
  facets: Partial<Record<IpipFacet, Score>>,
): Record<IpipDomain, Score> {
  const out = {} as Record<IpipDomain, Score>;

  for (const domain of DOMAINS) {
    const domainFacets = FACETS.filter((f) => FACET_TO_DOMAIN[f] === domain);
    const answered = domainFacets
      .map((f) => facets[f])
      .filter((s): s is Score => s != null);

    if (answered.length === 0) {
      // Unanswered domain — emit a placeholder with raw=0, level=average,
      // confidence will drop downstream via quality_flags.
      out[domain] = { raw: 0, level: "average", z_score: 0 };
      continue;
    }

    // Sum of facet raws, scaled up if some facets are missing.
    const facetMean = answered.reduce((a, b) => a + b.raw, 0) / answered.length;
    const raw = round1(facetMean * domainFacets.length);

    const norms = DOMAIN_NORMS[domain];
    const z = zScore(raw, norms);
    const percentile = norms.validated_for_brazil ? percentileFromZ(z) : undefined;
    const level = levelFromZ(z);

    out[domain] = {
      raw,
      percentile,
      level,
      z_score: round2(z),
    };
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Level rubric                                                       */
/* ------------------------------------------------------------------ */

const LEVEL_THRESHOLDS: { upTo: number; level: ScoreLevel }[] = [
  { upTo: -1.5, level: "very_low" },
  { upTo: -0.5, level: "low" },
  { upTo: 0.5, level: "average" },
  { upTo: 1.5, level: "high" },
  { upTo: Infinity, level: "very_high" },
];

export function levelFromZ(z: number): ScoreLevel {
  for (const t of LEVEL_THRESHOLDS) {
    if (z <= t.upTo) return t.level;
  }
  return "average";
}

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
