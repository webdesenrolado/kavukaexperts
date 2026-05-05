/**
 * Reference norms for IPIP-NEO-120 (Johnson, 2014).
 *
 * Source: aggregated US-English IPIP archives, including means/SDs reported in
 *   - Johnson, J.A. (2014). "Measuring thirty facets of the Five Factor Model
 *     with a 120-item public domain inventory: Development of the
 *     IPIP-NEO-120." Journal of Research in Personality, 51, 78-89.
 *   - Goldberg, L.R. et al. (1999, 2006), IPIP archives.
 *
 * IMPORTANT — Brazilian validation pending:
 *   These norms reflect a US-English adult sample and were imported AS-IS
 *   for the skeleton. They MUST NOT be treated as canonical for Brazilian
 *   pt-BR samples without psychometric re-validation. See README "Pendências".
 *
 * Conventions:
 *   - Each facet has 4 items, scored 1..5 → raw range 4..20.
 *   - Each domain has 6 facets × 4 items = 24 items, raw range 24..120.
 *   - Means/SDs below are approximate published values, used only to compute
 *     a coarse percentile via z-score and a 5-level categorisation.
 */

import type { IpipDomain, IpipFacet } from "./items";

export interface NormStats {
  mean: number;
  sd: number;
  /** Source label, surfaced in audit reports. */
  source: "johnson_2014_us" | "ipip_archives_us";
  /** Whether these stats have been validated for pt-BR. */
  validated_for_brazil: boolean;
}

/* ------------------------------------------------------------------ */
/* Domain-level norms (raw 24..120)                                   */
/* ------------------------------------------------------------------ */

export const DOMAIN_NORMS: Record<IpipDomain, NormStats> = {
  O: { mean: 79.0, sd: 11.0, source: "johnson_2014_us", validated_for_brazil: false },
  C: { mean: 82.0, sd: 12.0, source: "johnson_2014_us", validated_for_brazil: false },
  E: { mean: 76.0, sd: 13.0, source: "johnson_2014_us", validated_for_brazil: false },
  A: { mean: 88.0, sd: 11.0, source: "johnson_2014_us", validated_for_brazil: false },
  N: { mean: 64.0, sd: 14.0, source: "johnson_2014_us", validated_for_brazil: false },
};

/* ------------------------------------------------------------------ */
/* Facet-level norms (raw 4..20)                                      */
/* ------------------------------------------------------------------ */

/**
 * NOTE: facet-level mean/SD are approximate, taken from published
 * Johnson 2014 descriptive tables. They serve to feed the level rubric
 * (very_low..very_high) and shouldn't be reported as percentiles to end
 * users until validated in BR. Treat z-scores as informational only.
 */
export const FACET_NORMS: Record<IpipFacet, NormStats> = {
  // Neuroticism
  n1_anxiety: m(11.5, 3.3),
  n2_anger: m(10.5, 3.4),
  n3_depression: m(10.0, 3.6),
  n4_self_consciousness: m(11.5, 3.0),
  n5_immoderation: m(11.5, 2.9),
  n6_vulnerability: m(9.0, 2.9),

  // Extraversion
  e1_friendliness: m(13.5, 3.2),
  e2_gregariousness: m(11.5, 3.3),
  e3_assertiveness: m(12.5, 3.1),
  e4_activity_level: m(13.0, 2.6),
  e5_excitement_seeking: m(12.5, 3.2),
  e6_cheerfulness: m(13.5, 3.0),

  // Openness
  o1_imagination: m(13.0, 3.2),
  o2_artistic_interests: m(13.0, 3.3),
  o3_emotionality: m(13.5, 3.0),
  o4_adventurousness: m(12.0, 2.8),
  o5_intellect: m(13.0, 3.0),
  o6_liberalism: m(11.5, 2.9),

  // Agreeableness
  a1_trust: m(13.5, 3.3),
  a2_morality: m(15.5, 2.7),
  a3_altruism: m(15.5, 2.6),
  a4_cooperation: m(14.5, 3.0),
  a5_modesty: m(13.0, 3.2),
  a6_sympathy: m(15.0, 2.8),

  // Conscientiousness
  c1_self_efficacy: m(15.0, 2.6),
  c2_orderliness: m(13.0, 3.3),
  c3_dutifulness: m(15.0, 2.9),
  c4_achievement_striving: m(14.0, 3.0),
  c5_self_discipline: m(13.5, 3.2),
  c6_cautiousness: m(13.0, 3.0),
};

function m(mean: number, sd: number): NormStats {
  return {
    mean,
    sd,
    source: "johnson_2014_us",
    validated_for_brazil: false,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Standard normal CDF approximation (Abramowitz & Stegun 26.2.17). */
export function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;

  // erf approximation (accurate to ~1.5e-7)
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x);

  return 0.5 * (1 + sign * y);
}

export function zScore(raw: number, stats: NormStats): number {
  if (stats.sd === 0) return 0;
  return (raw - stats.mean) / stats.sd;
}

export function percentileFromZ(z: number): number {
  return Math.round(normalCdf(z) * 100);
}
