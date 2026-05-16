/**
 * Canonical contract schema for Kavuka Experts assessment microservices.
 *
 * Every instrument microservice MUST extend `applicationResultSchema` by
 * narrowing `scores` to its instrument-specific Zod schema.
 *
 * Contract version: 1.0.0
 *
 * Spec: ./contract.md
 */

import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

export const CONTRACT_VERSION = "1.1.0" as const;

/* ------------------------------------------------------------------ */
/* Primitives                                                         */
/* ------------------------------------------------------------------ */

const semverRegex = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
export const semverSchema = z.string().regex(semverRegex, "must be SemVer");

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case slug");

/**
 * Stable identifier across systems. Accepts UUID v4 (36 chars) or any
 * URL-safe id with at least 8 chars (e.g. nanoid). Not a true UUID — name
 * kept for backwards compatibility and for the spec, but validation is
 * intentionally permissive so callers can pass their own ID system.
 */
export const uuidSchema = z
  .string()
  .min(8, "id must be at least 8 chars")
  .max(64, "id must be at most 64 chars")
  .regex(/^[A-Za-z0-9_-]+$/, "id must be URL-safe (alphanumeric, _, -)");

export const isoDatetimeSchema = z.string().datetime({ offset: true });

export const bcp47Schema = z
  .string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "must be BCP-47 language tag");

/* ------------------------------------------------------------------ */
/* Response value (discriminated union by `kind`)                     */
/* ------------------------------------------------------------------ */

export const likert5Schema = z.object({
  kind: z.literal("likert5"),
  value: z.number().int().min(1).max(5),
});

export const likert7Schema = z.object({
  kind: z.literal("likert7"),
  value: z.number().int().min(1).max(7),
});

export const forcedChoiceSchema = z.object({
  kind: z.literal("forced_choice"),
  value: z.enum(["A", "B"]),
});

export const multipleChoiceSchema = z.object({
  kind: z.literal("multiple_choice"),
  value: z.string().min(1),
});

export const responseValueSchema = z.discriminatedUnion("kind", [
  likert5Schema,
  likert7Schema,
  forcedChoiceSchema,
  multipleChoiceSchema,
]);

/**
 * Backwards-compatible value: lets a microservice accept a bare integer
 * (interpreted as Likert 5/7), a bare short string (for forced-choice DISC
 * letters "a"/"b"/"c"/"d"), or the structured form.
 */
export const responseValueLooseSchema = z.union([
  responseValueSchema,
  z.number().int().min(1).max(7),
  z.string().min(1).max(50),
]);

export type ResponseValue = z.infer<typeof responseValueSchema>;

/* ------------------------------------------------------------------ */
/* Response item                                                      */
/* ------------------------------------------------------------------ */

export const responseSchema = z.object({
  item_id: z.string().min(1),
  value: responseValueLooseSchema,
  response_time_ms: z.number().int().nonnegative().optional(),
});
export type Response = z.infer<typeof responseSchema>;

/* ------------------------------------------------------------------ */
/* Score primitive (used by every instrument's `scores`)              */
/* ------------------------------------------------------------------ */

export const scoreLevelSchema = z.enum([
  "very_low",
  "low",
  "average",
  "high",
  "very_high",
]);
export type ScoreLevel = z.infer<typeof scoreLevelSchema>;

export const scoreSchema = z.object({
  raw: z.number(),
  percentile: z.number().min(0).max(100).optional(),
  level: scoreLevelSchema,
  z_score: z.number().optional(),
});
export type Score = z.infer<typeof scoreSchema>;

/* ------------------------------------------------------------------ */
/* Interpretation                                                     */
/* ------------------------------------------------------------------ */

export const confidenceSchema = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof confidenceSchema>;

/**
 * Per-dimension confidence — useful for instruments where the magnitude of
 * the preference matters (e.g. MBTI-like, where weak preferences should be
 * shown as such). Optional; instruments that don't model this can omit it.
 */
export const confidencePerDimensionSchema = z
  .record(z.string(), z.enum(["clear", "moderate", "low"]))
  .optional();

export const interpretationSchema = z.object({
  strengths: z.array(z.string().min(1)),
  watchouts: z.array(z.string().min(1)),
  narrative: z.string().min(1),
  confidence: confidenceSchema,
  confidence_per_dimension: confidencePerDimensionSchema,
});
export type Interpretation = z.infer<typeof interpretationSchema>;

/* ------------------------------------------------------------------ */
/* Meta                                                               */
/* ------------------------------------------------------------------ */

export const channelSchema = z.enum(["web", "whatsapp", "paper"]);
export type Channel = z.infer<typeof channelSchema>;

/**
 * Origin of the normative reference used to compute percentiles/levels.
 * Examples: "johnson_2014_us", "ipip50_goldberg_us", "guep_br_pilot_v1",
 * "none_required" (instrument is criterion-referenced, not norm-referenced).
 * Required so any consumer of the envelope can audit the basis for
 * comparison — central to LGPD/CFP explainability.
 */
export const normSourceSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9_]+$/, "norm_source must be lowercase snake_case");

export const metaSchema = z.object({
  applied_at: isoDatetimeSchema,
  channel: channelSchema,
  completion_time_seconds: z.number().nonnegative(),
  language: bcp47Schema,
  version_of_instrument: semverSchema,
  norm_source: normSourceSchema,
  applier_id: uuidSchema.nullable().optional(),
  tenant_id: uuidSchema.optional(),
});
export type Meta = z.infer<typeof metaSchema>;

/* ------------------------------------------------------------------ */
/* Quality flags                                                      */
/* ------------------------------------------------------------------ */

export const qualityFlagSchema = z.enum([
  "too_fast",
  "inconsistent",
  "incomplete",
  "straightlining",
  "social_desirability_high",
]);
export type QualityFlag = z.infer<typeof qualityFlagSchema>;

/* ------------------------------------------------------------------ */
/* Application result (canonical envelope)                            */
/* ------------------------------------------------------------------ */

/**
 * Base envelope. Per-instrument schemas should `.extend({ scores: ... })`
 * to narrow the `scores` shape.
 */
/**
 * Weight of this instrument's contribution to the GUÉP Score Humano (0..1).
 * Set to 0 for instruments that exist for narrative/UX only and would
 * otherwise create double-counting (e.g. MBTI-like which correlates ~1:1
 * with Big Five). Decided at the instrument level, embedded in every
 * envelope so consumers can audit weighting decisions.
 */
export const scoreWeightSchema = z.number().min(0).max(1);

export const applicationResultSchema = z.object({
  instrument: slugSchema,
  version: semverSchema,
  contract_version: semverSchema,
  subject_id: uuidSchema,
  application_id: uuidSchema,
  responses: z.array(responseSchema).min(1),
  scores: z.record(z.string(), z.unknown()),
  interpretation: interpretationSchema,
  meta: metaSchema,
  quality_flags: z.array(qualityFlagSchema),
  score_weight_in_human_score: scoreWeightSchema,
  consent_id: uuidSchema,
  data_retention_until: isoDatetimeSchema,
});
export type ApplicationResult = z.infer<typeof applicationResultSchema>;

/* ------------------------------------------------------------------ */
/* Item descriptor (for `GET /instrument` future endpoint)            */
/* ------------------------------------------------------------------ */

export const itemTranslationStatusSchema = z.enum([
  "validated",
  "pending_validation",
  "not_translated",
]);

export const itemDescriptorSchema = z.object({
  item_id: z.string().min(1),
  text: z.string().min(1),
  language: bcp47Schema,
  reverse_keyed: z.boolean().default(false),
  domain: z.string().optional(),
  facet: z.string().optional(),
  scale_kind: z.enum(["likert5", "likert7", "forced_choice", "multiple_choice"]),
  translation: itemTranslationStatusSchema.default("validated"),
});
export type ItemDescriptor = z.infer<typeof itemDescriptorSchema>;

export const instrumentDescriptorSchema = z.object({
  instrument: slugSchema,
  version: semverSchema,
  contract_version: semverSchema,
  items: z.array(itemDescriptorSchema).min(1),
});
export type InstrumentDescriptor = z.infer<typeof instrumentDescriptorSchema>;

/* ------------------------------------------------------------------ */
/* Apply input (subset accepted by a microservice's `applyX`)         */
/* ------------------------------------------------------------------ */

/**
 * Subset of `metaSchema` accepted at apply time. The microservice fills in
 * `version_of_instrument` and may default `applied_at` / `language`.
 */
export const applyMetaInputSchema = z.object({
  applied_at: isoDatetimeSchema.optional(),
  channel: channelSchema,
  completion_time_seconds: z.number().nonnegative().optional(),
  language: bcp47Schema.optional(),
  version_of_instrument: semverSchema.optional(),
  applier_id: uuidSchema.nullable().optional(),
  tenant_id: uuidSchema.optional(),
});
export type ApplyMetaInput = z.infer<typeof applyMetaInputSchema>;

export const applyInputSchema = z.object({
  subject_id: uuidSchema,
  application_id: uuidSchema,
  responses: z.array(responseSchema).min(1),
  meta: applyMetaInputSchema,
  consent_id: uuidSchema,
  data_retention_until: isoDatetimeSchema,
});
export type ApplyInput = z.infer<typeof applyInputSchema>;
