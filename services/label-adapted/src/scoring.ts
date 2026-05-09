/**
 * Scoring LABEL adaptado.
 *
 * Cada item tem polarity (+1 ou -1). O candidato responde 1-5.
 * Score por item: (resposta - 3) * polarity → range -2 a +2
 * Score por dimensão: média dos itens dela, normalizado pra escala 1-5 (centrada em 3).
 * Big Five: ponderado pelos pesos do mapeamento.
 */

import { ITEMS, PAIRS, type Dimension, type BigFive } from "./items";

export interface LabelRawResponse {
  /** ID do item (ex: p01a) */
  item_id: string;
  /** Likert 1-5 */
  value: number;
}

export interface LabelDimensionScores {
  estabilidade: number;
  adaptabilidade: number;
  metodo: number;
  racionalidade: number;
  motivacao: number;
  combatividade: number;
  autoridade: number;
  expansividade: number;
  originalidade: number;
  sociabilidade: number;
  altruismo: number;
  dependencia: number;
  fragilidade: number;
}

export interface LabelBigFiveScores {
  /** Cada um na escala 1-5 (3 = média populacional) */
  O: number;
  C: number;
  E: number;
  A: number;
  S: number;
}

const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

/** Score por dimensão na escala 1-5 (3 = neutro). */
export function computeDimensionScores(
  responses: LabelRawResponse[]
): LabelDimensionScores {
  // Acumula por dimensão: soma e contagem de itens
  const buckets: Partial<Record<Dimension, { sum: number; n: number }>> = {};

  for (const r of responses) {
    const item = ITEM_BY_ID.get(r.item_id);
    if (!item) continue;
    const v = r.value;
    if (typeof v !== "number" || v < 1 || v > 5) continue;
    // Contribuição: se polarity=+1, valor direto; se -1, espelhado em torno de 3
    const contrib = item.polarity === 1 ? v : 6 - v;
    const b = buckets[item.dimension] || { sum: 0, n: 0 };
    b.sum += contrib;
    b.n += 1;
    buckets[item.dimension] = b;
  }

  function avg(d: Dimension): number {
    const b = buckets[d];
    if (!b || b.n === 0) return 3;
    return b.sum / b.n;
  }

  const estab = avg("estabilidade");
  return {
    estabilidade: estab,
    adaptabilidade: avg("adaptabilidade"),
    metodo: avg("metodo"),
    racionalidade: avg("racionalidade"),
    motivacao: avg("motivacao"),
    combatividade: avg("combatividade"),
    autoridade: avg("autoridade"),
    expansividade: avg("expansividade"),
    originalidade: avg("originalidade"),
    sociabilidade: avg("sociabilidade"),
    altruismo: avg("altruismo"),
    dependencia: avg("dependencia"),
    // Fragilidade é o reflexo da Estabilidade
    fragilidade: 6 - estab,
  };
}

/** Big Five via agregação ponderada. Saída na escala 1-5. */
export function computeBigFive(responses: LabelRawResponse[]): LabelBigFiveScores {
  const acc: Record<BigFive, { sum: number; w: number }> = {
    O: { sum: 0, w: 0 },
    C: { sum: 0, w: 0 },
    E: { sum: 0, w: 0 },
    A: { sum: 0, w: 0 },
    S: { sum: 0, w: 0 },
  };

  for (const r of responses) {
    const item = ITEM_BY_ID.get(r.item_id);
    if (!item) continue;
    const v = r.value;
    if (typeof v !== "number" || v < 1 || v > 5) continue;
    // Centraliza em 0 (range -2..+2)
    const centered = (v - 3);
    for (const [bf, w] of Object.entries(item.big_five) as [BigFive, number][]) {
      acc[bf].sum += centered * w;
      acc[bf].w += Math.abs(w);
    }
  }

  const out = {} as LabelBigFiveScores;
  for (const k of ["O", "C", "E", "A", "S"] as BigFive[]) {
    if (acc[k].w === 0) {
      out[k] = 3;
    } else {
      // Volta pra escala 1-5
      const avgCentered = acc[k].sum / acc[k].w;
      out[k] = clamp(3 + avgCentered, 1, 5);
    }
  }
  return out;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Índices de qualidade da resposta:
 * - completeness: % de itens respondidos
 * - contrast: variabilidade das respostas (extremos vs centro)
 * - consistency: coerência entre polos opostos do mesmo par
 * - desirability: tendência a responder pelo polo "favorável"
 *
 * Cada índice volta na escala 0-100, similar ao G score do LABEL.
 */
export interface QualityIndices {
  completeness: number;
  contrast: number;
  consistency: number;
  desirability: number;
  /** Score G (geral) — média dos 4 índices */
  g: number;
  flags: string[];
}

export function qualityIndices(responses: LabelRawResponse[]): QualityIndices {
  const totalItems = ITEMS.length;
  const answered = responses.filter((r) => typeof r.value === "number" && r.value >= 1 && r.value <= 5);

  const completeness = (answered.length / totalItems) * 100;

  // Contrast: % de respostas em extremos (1 ou 5) — baixo contraste = tudo no meio = pouco informativo
  const extremes = answered.filter((r) => r.value === 1 || r.value === 5).length;
  const contrast = answered.length === 0 ? 0 : (extremes / answered.length) * 100;

  // Consistency: pra cada par bipolar, espera-se que A e B tenham respostas opostas
  // (alto A → baixo B). Calculamos correlação invertida.
  let consistencyScore = 0;
  let consistencyN = 0;
  for (const p of PAIRS) {
    const a = responses.find((r) => r.item_id === p[0].id);
    const b = responses.find((r) => r.item_id === p[1].id);
    if (!a || !b) continue;
    if (typeof a.value !== "number" || typeof b.value !== "number") continue;
    // Se A=5 e B=1 → diff=4 (perfeitamente coerente), se A=B=3 (ambíguo, ok)
    // Se A=5 e B=5 (incoerente), diff=0 (ruim)
    const diff = Math.abs(a.value - b.value);
    consistencyScore += (diff / 4) * 100; // 0..100
    consistencyN++;
  }
  const consistency = consistencyN === 0 ? 0 : consistencyScore / consistencyN;

  // Desirability: % das respostas no polo "positivo" (a) com valor >=4
  // Se >85% → respondeu sempre o "favorável", flag de viés
  const positiveItems = answered.filter((r) => {
    const item = ITEM_BY_ID.get(r.item_id);
    return item?.polarity === 1;
  });
  const positiveHigh = positiveItems.filter((r) => r.value >= 4).length;
  const negativeItems = answered.filter((r) => {
    const item = ITEM_BY_ID.get(r.item_id);
    return item?.polarity === -1;
  });
  const negativeLow = negativeItems.filter((r) => r.value <= 2).length;

  let desirability = 50;
  if (positiveItems.length > 0 && negativeItems.length > 0) {
    const pPosHigh = positiveHigh / positiveItems.length;
    const pNegLow = negativeLow / negativeItems.length;
    // Se ambos > 0.85 = está empilhando favorável → reduz score
    const bias = Math.max(0, ((pPosHigh + pNegLow) / 2 - 0.5)) * 200;
    desirability = clamp(100 - bias, 0, 100);
  }

  const g = (completeness + contrast + consistency + desirability) / 4;

  const flags: string[] = [];
  if (completeness < 90) flags.push("incomplete");
  if (contrast < 20) flags.push("low_contrast");
  if (consistency < 40) flags.push("low_consistency");
  if (desirability < 40) flags.push("desirability_bias");

  return {
    completeness: Math.round(completeness),
    contrast: Math.round(contrast),
    consistency: Math.round(consistency),
    desirability: Math.round(desirability),
    g: Math.round(g),
    flags,
  };
}
