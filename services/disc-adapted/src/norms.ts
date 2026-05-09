/**
 * Normas DISC adaptado.
 *
 * AVISO: estas normas são INICIAIS, baseadas em distribuição teórica
 * gaussiana. Após N≥500 candidatos brasileiros, recalibrar com dados reais
 * via percentis observados.
 */

export const NORM_SOURCE = "kavuka_initial_2026" as const;
export const VALIDATED_FOR_BRAZIL = false as const;

export type Band = "very_low" | "low" | "moderate" | "high" | "very_high";

export function bandFromScore(score: number): Band {
  if (score < 25) return "very_low";
  if (score < 40) return "low";
  if (score < 60) return "moderate";
  if (score < 75) return "high";
  return "very_high";
}

export const BAND_LABEL_PT: Record<Band, string> = {
  very_low: "muito baixo",
  low: "baixo",
  moderate: "moderado",
  high: "alto",
  very_high: "muito alto",
};
