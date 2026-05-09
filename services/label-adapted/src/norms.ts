/**
 * Normas LABEL adaptado.
 *
 * AVISO: normas INICIAIS, derivadas de distribuição teórica. Recalibrar com
 * dados observados quando a base atingir N≥1000 candidatos brasileiros.
 *
 * Estrutura: cada dimensão tem (mean, sd) na escala 1-5 da população GUÉP.
 * Inicialmente todas centradas em 3.0 com sd=0.7 (gaussiana esperada).
 */

import type { Dimension, BigFive } from "./items";

export const NORM_SOURCE = "kavuka_initial_2026" as const;
export const VALIDATED_FOR_BRAZIL = false as const;
export const REFERENCE_N = 0; // calibrar quando atingir N≥1000

export const DIMENSION_NORMS: Record<Dimension, { mean: number; sd: number }> = {
  estabilidade: { mean: 3.0, sd: 0.7 },
  adaptabilidade: { mean: 3.2, sd: 0.6 },
  metodo: { mean: 3.1, sd: 0.7 },
  racionalidade: { mean: 3.2, sd: 0.6 },
  motivacao: { mean: 3.4, sd: 0.6 },
  combatividade: { mean: 2.8, sd: 0.7 },
  autoridade: { mean: 3.0, sd: 0.7 },
  expansividade: { mean: 3.1, sd: 0.7 },
  originalidade: { mean: 3.3, sd: 0.6 },
  sociabilidade: { mean: 3.4, sd: 0.7 },
  altruismo: { mean: 3.6, sd: 0.5 },
  dependencia: { mean: 2.9, sd: 0.6 },
  fragilidade: { mean: 3.0, sd: 0.7 }, // espelho de estabilidade
};

export const BIG_FIVE_NORMS: Record<BigFive, { mean: number; sd: number }> = {
  O: { mean: 3.2, sd: 0.6 },
  C: { mean: 3.3, sd: 0.6 },
  E: { mean: 3.1, sd: 0.7 },
  A: { mean: 3.4, sd: 0.6 },
  S: { mean: 3.0, sd: 0.7 },
};

export type Band = "muito_baixo" | "baixo" | "moderado" | "alto" | "muito_alto";

export function bandFromZ(z: number): Band {
  if (z < -1.5) return "muito_baixo";
  if (z < -0.5) return "baixo";
  if (z < 0.5) return "moderado";
  if (z < 1.5) return "alto";
  return "muito_alto";
}

export const BAND_LABEL_PT: Record<Band, string> = {
  muito_baixo: "muito baixo",
  baixo: "baixo",
  moderado: "moderado",
  alto: "alto",
  muito_alto: "muito alto",
};
