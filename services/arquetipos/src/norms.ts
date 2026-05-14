/**
 * Normas iniciais Arquétipos.
 * AVISO: distribuição teórica. Recalibrar com N≥500 BR.
 */

export const NORM_SOURCE = "kavuka_initial_2026" as const;
export const VALIDATED_FOR_BRAZIL = false as const;

export type Band = "muito_baixo" | "baixo" | "moderado" | "alto" | "muito_alto";

export function bandFromScore(score: number): Band {
  if (score < 25) return "muito_baixo";
  if (score < 45) return "baixo";
  if (score < 65) return "moderado";
  if (score < 80) return "alto";
  return "muito_alto";
}

export const BAND_LABEL_PT: Record<Band, string> = {
  muito_baixo: "muito baixo",
  baixo: "baixo",
  moderado: "moderado",
  alto: "alto",
  muito_alto: "muito alto",
};
