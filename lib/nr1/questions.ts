/**
 * Questionário NR-1 — 13 perguntas em 5 dimensões.
 *
 * Base científica:
 * - NR-1 (MTE 2024) — Programa de Gerenciamento de Riscos com riscos psicossociais obrigatórios
 * - COPSOQ-III (Copenhagen Psychosocial Questionnaire) — versão curta validada
 * - Maslach Burnout Inventory — items de exaustão emocional
 *
 * Escala Likert 1-5 (âncoras variam por pergunta).
 * Perguntas marcadas como `inverted: true` significam que score alto = pior (ex: assédio,
 * exaustão). No cálculo do score normalizado, essas são invertidas pra "saudável → alto".
 */

export type Likert = 1 | 2 | 3 | 4 | 5;

export type AnchorSet = "frequency" | "agreement" | "rating" | "consideration";

export interface NR1Question {
  id: string;
  dimension: NR1Dimension;
  text: string;
  anchors: AnchorSet;
  inverted: boolean;
  flagThreshold?: number;
}

export type NR1Dimension =
  | "demandas"
  | "autonomia"
  | "lideranca"
  | "risco"
  | "bemestar";

export const DIMENSIONS: Record<NR1Dimension, { label: string; description: string }> = {
  demandas: {
    label: "Demandas e ritmo",
    description: "Carga de trabalho, ritmo, exaustão emocional e desconexão.",
  },
  autonomia: {
    label: "Autonomia e desenvolvimento",
    description: "Influência sobre o trabalho, sentido e oportunidades de crescimento.",
  },
  lideranca: {
    label: "Liderança e relações",
    description: "Suporte do líder e dos pares, clareza de papel.",
  },
  risco: {
    label: "Risco psicossocial",
    description: "Assédio, discriminação, segurança psicológica.",
  },
  bemestar: {
    label: "Bem-estar e intenção",
    description: "Avaliação de saúde mental e intenção de saída.",
  },
};

export const ANCHORS: Record<AnchorSet, [string, string, string, string, string]> = {
  frequency: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"],
  agreement: [
    "Discordo totalmente",
    "Discordo",
    "Indiferente",
    "Concordo",
    "Concordo totalmente",
  ],
  rating: ["Muito ruim", "Ruim", "Regular", "Boa", "Excelente"],
  consideration: [
    "Nunca pensei",
    "Raramente",
    "Às vezes",
    "Frequentemente",
    "O tempo todo",
  ],
};

/**
 * Lista canônica das 13 perguntas.
 * Versão 1.0.0 — congelar essa lista; mudanças = nova versão.
 */
export const VERSION = "1.0.0";

export const QUESTIONS: NR1Question[] = [
  // === DEMANDAS (Q1-Q3) ===
  {
    id: "q1",
    dimension: "demandas",
    text: "Tenho que fazer mais do que cabe no meu tempo de trabalho.",
    anchors: "frequency",
    inverted: true,
  },
  {
    id: "q2",
    dimension: "demandas",
    text: "No fim do dia de trabalho, sinto-me emocionalmente exausto(a).",
    anchors: "frequency",
    inverted: true,
  },
  {
    id: "q3",
    dimension: "demandas",
    text: "Tenho dificuldade de me desconectar do trabalho durante meu tempo livre.",
    anchors: "frequency",
    inverted: true,
  },

  // === AUTONOMIA & DESENVOLVIMENTO (Q4-Q6) ===
  {
    id: "q4",
    dimension: "autonomia",
    text: "Posso decidir como organizar e executar meu trabalho.",
    anchors: "frequency",
    inverted: false,
  },
  {
    id: "q5",
    dimension: "autonomia",
    text: "Sinto que meu trabalho tem propósito e significado.",
    anchors: "agreement",
    inverted: false,
  },
  {
    id: "q6",
    dimension: "autonomia",
    text: "Tenho oportunidades de aprender e me desenvolver no trabalho.",
    anchors: "agreement",
    inverted: false,
  },

  // === LIDERANÇA & RELAÇÕES (Q7-Q9) ===
  {
    id: "q7",
    dimension: "lideranca",
    text: "Recebo apoio do meu líder direto quando preciso.",
    anchors: "frequency",
    inverted: false,
  },
  {
    id: "q8",
    dimension: "lideranca",
    text: "Posso contar com meus colegas quando enfrento dificuldades.",
    anchors: "frequency",
    inverted: false,
  },
  {
    id: "q9",
    dimension: "lideranca",
    text: "Está claro pra mim o que se espera do meu trabalho.",
    anchors: "agreement",
    inverted: false,
  },

  // === RISCO PSICOSSOCIAL (Q10-Q11) ===
  {
    id: "q10",
    dimension: "risco",
    text: "Nos últimos 12 meses, presenciei ou sofri assédio, discriminação ou comportamento humilhante no trabalho.",
    anchors: "frequency",
    inverted: true,
    flagThreshold: 3, // qualquer resposta ≥ 3 dispara alerta obrigatório no relatório
  },
  {
    id: "q11",
    dimension: "risco",
    text: "Sinto-me seguro(a) para expressar opiniões divergentes ou apontar problemas no trabalho.",
    anchors: "agreement",
    inverted: false,
  },

  // === BEM-ESTAR (Q12-Q13) ===
  {
    id: "q12",
    dimension: "bemestar",
    text: "Considerando a saúde mental, como você avaliaria seu trabalho atualmente?",
    anchors: "rating",
    inverted: false,
  },
  {
    id: "q13",
    dimension: "bemestar",
    text: "Pensei em deixar este trabalho por motivos relacionados ao bem-estar ou clima.",
    anchors: "consideration",
    inverted: true,
  },
];

// === Cálculo ===

/** Normaliza um score 1-5 pra 0-1 com saudável → 1. */
export function normalize(value: Likert, inverted: boolean): number {
  const v = inverted ? 6 - value : value;
  return (v - 1) / 4;
}

/** Score por dimensão (média normalizada 0-1). */
export function dimensionScore(
  responses: Record<string, Likert>,
  dimension: NR1Dimension
): number | null {
  const qs = QUESTIONS.filter((q) => q.dimension === dimension);
  const vals = qs
    .map((q) => {
      const v = responses[q.id];
      return v ? normalize(v, q.inverted) : null;
    })
    .filter((v): v is number => v !== null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Score geral (média das 5 dimensões). */
export function overallScore(responses: Record<string, Likert>): number | null {
  const dims: NR1Dimension[] = ["demandas", "autonomia", "lideranca", "risco", "bemestar"];
  const scores = dims.map((d) => dimensionScore(responses, d)).filter((s): s is number => s !== null);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/** Banda de risco a partir do score normalizado (0=alto risco, 1=saudável). */
export function riskBand(score: number | null): "high" | "medium" | "low" | null {
  if (score === null) return null;
  if (score < 0.5) return "high";
  if (score < 0.75) return "medium";
  return "low";
}

/** Flags obrigatórios (assédio principalmente). */
export function flags(responses: Record<string, Likert>): string[] {
  const out: string[] = [];
  for (const q of QUESTIONS) {
    if (q.flagThreshold && responses[q.id] && responses[q.id] >= q.flagThreshold) {
      out.push(q.id);
    }
  }
  return out;
}
