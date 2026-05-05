/**
 * IPIP-NEO-120 — instrument-specific Zod schema.
 *
 * Extends the canonical contract envelope with a strongly-typed `scores` shape:
 *   - 5 Big Five domains (O,C,E,A,N)
 *   - 30 IPIP facets
 */

import { z } from "zod";
import {
  applicationResultSchema,
  scoreSchema,
} from "../../_contract/schema";

export const IPIP_DOMAIN_KEYS = ["O", "C", "E", "A", "N"] as const;

export const IPIP_FACET_KEYS = [
  "n1_anxiety",
  "n2_anger",
  "n3_depression",
  "n4_self_consciousness",
  "n5_immoderation",
  "n6_vulnerability",
  "e1_friendliness",
  "e2_gregariousness",
  "e3_assertiveness",
  "e4_activity_level",
  "e5_excitement_seeking",
  "e6_cheerfulness",
  "o1_imagination",
  "o2_artistic_interests",
  "o3_emotionality",
  "o4_adventurousness",
  "o5_intellect",
  "o6_liberalism",
  "a1_trust",
  "a2_morality",
  "a3_altruism",
  "a4_cooperation",
  "a5_modesty",
  "a6_sympathy",
  "c1_self_efficacy",
  "c2_orderliness",
  "c3_dutifulness",
  "c4_achievement_striving",
  "c5_self_discipline",
  "c6_cautiousness",
] as const;

export const ipipScoresSchema = z.object({
  domains: z.object({
    O: scoreSchema,
    C: scoreSchema,
    E: scoreSchema,
    A: scoreSchema,
    N: scoreSchema,
  }),
  facets: z
    .object(
      Object.fromEntries(
        IPIP_FACET_KEYS.map((k) => [k, scoreSchema.optional()]),
      ) as Record<(typeof IPIP_FACET_KEYS)[number], z.ZodOptional<typeof scoreSchema>>,
    )
    .partial(),
});

export type IpipScoresPayload = z.infer<typeof ipipScoresSchema>;

/**
 * Full envelope for an IPIP-NEO-120 application result.
 * Use this on the consumer side to validate stored payloads.
 */
export const ipipApplicationResultSchema = applicationResultSchema.extend({
  instrument: z.literal("ipip-neo-120"),
  scores: ipipScoresSchema,
});

export type IpipApplicationResult = z.infer<typeof ipipApplicationResultSchema>;
