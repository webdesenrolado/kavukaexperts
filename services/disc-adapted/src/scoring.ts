/**
 * Scoring DISC adaptado — forçada escolha.
 *
 * Cada bloco produz 2 respostas: "MOST" (mais me descreve) e "LEAST" (menos
 * me descreve). MOST adiciona +1 à dimensão escolhida; LEAST adiciona -1.
 *
 * Score bruto por dimensão: -24 a +24 (máximo teórico).
 * Normalização: percentil aproximado pra escala 0-100.
 */

import { BLOCKS, type Dimension } from "./items";

export interface DiscRawResponse {
  /** ID do bloco (ex: "B01") */
  block_id: string;
  /** "most" ou "least" */
  pick: "most" | "least";
  /** Letra da alternativa (a/b/c/d) */
  letter: "a" | "b" | "c" | "d";
}

export interface DiscRawScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DiscNormalizedScores {
  /** Score 0-100 por dimensão (50 = média populacional) */
  D: number;
  I: number;
  S: number;
  C: number;
  /** Dimensão dominante (mais alta) */
  dominant: Dimension;
  /** Dimensão secundária (segunda mais alta) */
  secondary: Dimension;
}

/** Calcula scores brutos a partir das respostas forçada-escolha. */
export function computeRawScores(responses: DiscRawResponse[]): DiscRawScores {
  const scores: DiscRawScores = { D: 0, I: 0, S: 0, C: 0 };
  const blockMap = new Map(BLOCKS.map((b) => [b.id, b]));
  for (const r of responses) {
    const block = blockMap.get(r.block_id);
    if (!block) continue;
    const item = block.items.find((i) => i.letter === r.letter);
    if (!item) continue;
    scores[item.dimension] += r.pick === "most" ? 1 : -1;
  }
  return scores;
}

/** Normaliza score bruto (-24..+24) pra escala 0-100. */
function normalize(raw: number): number {
  // -24 → 0, 0 → 50, +24 → 100
  return Math.max(0, Math.min(100, Math.round(50 + (raw / 24) * 50)));
}

/** Calcula scores finais normalizados + dominante/secundária. */
export function computeFinalScores(raw: DiscRawScores): DiscNormalizedScores {
  const norm = {
    D: normalize(raw.D),
    I: normalize(raw.I),
    S: normalize(raw.S),
    C: normalize(raw.C),
  };
  const ordered = (Object.entries(norm) as [Dimension, number][])
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k);
  return {
    ...norm,
    dominant: ordered[0],
    secondary: ordered[1],
  };
}

/**
 * Detecta padrões de resposta inválidos (qualidade dos dados).
 * - Mesma resposta em todos os blocos → resposta automática
 * - Faltam respostas
 */
export function qualityFlags(responses: DiscRawResponse[]) {
  const expectedCount = BLOCKS.length * 2; // most + least por bloco
  const flags: string[] = [];

  if (responses.length < expectedCount) {
    flags.push(`incomplete:${responses.length}/${expectedCount}`);
  }

  // Agrupa por bloco
  const byBlock = new Map<string, { most?: string; least?: string }>();
  for (const r of responses) {
    const cur = byBlock.get(r.block_id) || {};
    cur[r.pick] = r.letter;
    byBlock.set(r.block_id, cur);
  }
  for (const [id, picks] of byBlock) {
    if (picks.most && picks.least && picks.most === picks.least) {
      flags.push(`same_pick:${id}`);
    }
  }

  return flags;
}
