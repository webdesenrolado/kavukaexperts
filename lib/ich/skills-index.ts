/**
 * Índice de Habilidades — score 0-100 baseado nas skills do candidato.
 *
 * Cálculo:
 * - Peso por nível: basic=1, intermediate=2, advanced=3, expert=4
 * - Bônus por anos de uso: sqrt(years) * 0.5 (até +2 por skill)
 * - Bônus por diversidade de categorias: até +10 pontos no total
 * - Cap em 100
 *
 * Devolve breakdown por categoria pra UI.
 */

export interface SkillRow {
  skill: string;
  level: string | null;
  category: string | null;
  yearsOfUse: number | null;
}

export interface SkillsIndexResult {
  /** Score 0-100 */
  score: number;
  /** Banda categórica */
  band: "iniciante" | "intermediario" | "avancado" | "especialista";
  /** Total de skills cadastradas */
  total: number;
  /** Score por categoria */
  by_category: Record<string, { count: number; weighted: number; share: number }>;
  /** Top 5 skills com peso */
  top: Array<{ skill: string; level: string | null; weight: number }>;
}

const LEVEL_WEIGHT: Record<string, number> = {
  basic: 1,
  basico: 1,
  intermediate: 2,
  intermediario: 2,
  advanced: 3,
  avancado: 3,
  expert: 4,
  especialista: 4,
};

function categoryOf(s: SkillRow): string {
  return (s.category || "outras").toLowerCase();
}

function weightOf(s: SkillRow): number {
  const lvl = (s.level || "intermediario").toLowerCase();
  const base = LEVEL_WEIGHT[lvl] ?? 2;
  const years = typeof s.yearsOfUse === "number" && s.yearsOfUse > 0 ? s.yearsOfUse : 0;
  const yearsBonus = Math.min(2, Math.sqrt(years) * 0.5);
  return base + yearsBonus;
}

const TARGET_SCORE = 60; // soma de pesos esperada pra 100% (≈15 skills nível médio)
const DIVERSITY_BONUS_MAX = 10;

export function computeSkillsIndex(skills: SkillRow[]): SkillsIndexResult {
  if (skills.length === 0) {
    return {
      score: 0,
      band: "iniciante",
      total: 0,
      by_category: {},
      top: [],
    };
  }

  const byCategory: Record<string, { count: number; weighted: number; share: number }> = {};
  let totalWeight = 0;
  const weighted: Array<{ skill: string; level: string | null; weight: number }> = [];

  for (const s of skills) {
    const w = weightOf(s);
    const cat = categoryOf(s);
    if (!byCategory[cat]) byCategory[cat] = { count: 0, weighted: 0, share: 0 };
    byCategory[cat].count++;
    byCategory[cat].weighted += w;
    totalWeight += w;
    weighted.push({ skill: s.skill, level: s.level, weight: w });
  }

  // Bônus por diversidade: cada categoria distinta vale até DIVERSITY_BONUS_MAX/4
  const distinctCategories = Object.keys(byCategory).length;
  const diversityBonus = Math.min(DIVERSITY_BONUS_MAX, distinctCategories * 2.5);

  const rawScore = (totalWeight / TARGET_SCORE) * 90 + diversityBonus;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Calcula share por categoria (% do peso total)
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].share = totalWeight > 0
      ? Math.round((byCategory[cat].weighted / totalWeight) * 100)
      : 0;
  }

  const band =
    score >= 80 ? "especialista"
    : score >= 60 ? "avancado"
    : score >= 35 ? "intermediario"
    : "iniciante";

  const top = weighted
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  return {
    score,
    band,
    total: skills.length,
    by_category: byCategory,
    top,
  };
}

export const BAND_LABEL_PT: Record<SkillsIndexResult["band"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
  especialista: "Especialista",
};
