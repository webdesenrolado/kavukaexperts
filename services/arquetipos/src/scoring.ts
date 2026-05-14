/**
 * Scoring Arquétipos.
 *
 * Para cada arquétipo, calcula score = média dos 3 items normalizada 0-100.
 * Top 2 arquétipos definem o "perfil arquetípico".
 */

import { ITEMS, ARCHETYPES, type Archetype } from "./items";

export interface RawResponse {
  item_id: string;
  value: number; // 1-5
}

export interface ArchetypeScores {
  /** Score 0-100 por arquétipo */
  by_archetype: Record<Archetype, number>;
  /** Arquétipo dominante (maior score) */
  dominant: Archetype;
  /** Arquétipo secundário (2º maior) */
  secondary: Archetype;
  /** Top 3 ordenados */
  top3: Array<{ archetype: Archetype; score: number }>;
}

const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export function computeScores(responses: RawResponse[]): ArchetypeScores {
  const buckets = {} as Record<Archetype, number[]>;
  for (const a of ARCHETYPES) buckets[a] = [];

  for (const r of responses) {
    const item = ITEM_BY_ID.get(r.item_id);
    if (!item) continue;
    if (typeof r.value !== "number" || r.value < 1 || r.value > 5) continue;
    buckets[item.archetype].push(r.value);
  }

  const by_archetype = {} as Record<Archetype, number>;
  for (const a of ARCHETYPES) {
    const arr = buckets[a];
    if (arr.length === 0) {
      by_archetype[a] = 50;
    } else {
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
      // Normaliza 1-5 → 0-100
      by_archetype[a] = Math.round(((avg - 1) / 4) * 100);
    }
  }

  const sorted = ARCHETYPES.map((a) => ({ archetype: a, score: by_archetype[a] }))
    .sort((a, b) => b.score - a.score);

  return {
    by_archetype,
    dominant: sorted[0].archetype,
    secondary: sorted[1].archetype,
    top3: sorted.slice(0, 3),
  };
}

export function qualityFlags(responses: RawResponse[]): string[] {
  const flags: string[] = [];
  const expected = ITEMS.length;
  const answered = responses.filter((r) => typeof r.value === "number" && r.value >= 1 && r.value <= 5);
  if (answered.length < expected) flags.push(`incomplete:${answered.length}/${expected}`);

  // Detecta resposta uniforme (todos iguais)
  const values = answered.map((r) => r.value);
  const allSame = values.length > 0 && values.every((v) => v === values[0]);
  if (allSame) flags.push("uniform_responses");

  return flags;
}
