/**
 * Índice Comportamental — síntese 0-100 a partir das avaliações concluídas
 * (IPIP-NEO-120, DISC adaptado, LABEL adaptado).
 *
 * Filosofia:
 * - Recompensa COMPLETUDE (mais instrumentos = base mais robusta)
 * - Recompensa CONSISTÊNCIA cross-instrumentos (Big Five do IPIP × Big Five do LABEL)
 * - Penaliza flags de qualidade (incompletude, low_consistency, low_contrast)
 * - Não julga "bom" vs "ruim" comportamentalmente — mede QUALIDADE da medição
 */

export interface AssessmentSnapshot {
  instrument: string;
  status: string;
  scoresJson: string | null;
  qualityFlagsJson: string | null;
}

export interface BehavioralIndexResult {
  /** Score 0-100: qualidade da medição comportamental */
  score: number;
  band: "incompleto" | "parcial" | "consistente" | "robusto";
  /** Quantos instrumentos foram concluídos */
  instruments_count: number;
  /** Lista dos instrumentos concluídos (slugs) */
  instruments: string[];
  /** Componentes do cálculo (transparência) */
  components: {
    completude: number;
    consistencia: number;
    qualidade: number;
  };
  /** Big Five síntese (média entre instrumentos que medem) */
  big_five: { O: number; C: number; E: number; A: number; S: number } | null;
  /** Perfil DISC (se DISC concluído) */
  disc_profile: string | null;
  /** Flags negativas detectadas */
  flags: string[];
}

const INSTRUMENT_VALUE: Record<string, number> = {
  "ipip-neo-120": 35,
  "label-adapted": 35,
  "disc-adapted": 30,
  "label-guep": 35,
  "disc-adapt": 30,
};

function safeParse(s: string | null): any {
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

function getBigFiveFromIpip(scores: any): Record<string, number> | null {
  if (!scores?.domains) return null;
  // IPIP usa N (Neuroticism); converte pra S (Stability) = 5 - N
  const d = scores.domains;
  const lvl = (k: string): number => {
    const m: Record<string, number> = { very_low: 1.5, low: 2.5, average: 3, high: 3.8, very_high: 4.5 };
    return m[d[k]?.level] ?? 3;
  };
  return {
    O: lvl("O"),
    C: lvl("C"),
    E: lvl("E"),
    A: lvl("A"),
    S: 5 - (lvl("N") - 1) - 1 + 3, // converte N→S aproximado
  };
}

function getBigFiveFromLabel(scores: any): Record<string, number> | null {
  return scores?.big_five || null;
}

export function computeBehavioralIndex(assessments: AssessmentSnapshot[]): BehavioralIndexResult {
  const completed = assessments.filter((a) => a.status === "completed");
  const slugs = completed.map((a) => a.instrument);

  if (completed.length === 0) {
    return {
      score: 0,
      band: "incompleto",
      instruments_count: 0,
      instruments: [],
      components: { completude: 0, consistencia: 0, qualidade: 0 },
      big_five: null,
      disc_profile: null,
      flags: ["nenhuma_avaliacao_concluida"],
    };
  }

  // === COMPLETUDE: soma dos valores dos instrumentos concluídos (cap 70) ===
  let completude = 0;
  for (const slug of slugs) {
    completude += INSTRUMENT_VALUE[slug] ?? 10;
  }
  completude = Math.min(70, completude);

  // === Big Five síntese (média entre IPIP e LABEL se ambos disponíveis) ===
  let bigFive: Record<string, number> | null = null;
  const ipip = completed.find((a) => a.instrument === "ipip-neo-120");
  const label = completed.find((a) => a.instrument === "label-adapted" || a.instrument === "label-guep");

  const bfIpip = ipip ? getBigFiveFromIpip(safeParse(ipip.scoresJson)) : null;
  const bfLabel = label ? getBigFiveFromLabel(safeParse(label.scoresJson)) : null;

  if (bfIpip && bfLabel) {
    bigFive = {
      O: (bfIpip.O + bfLabel.O) / 2,
      C: (bfIpip.C + bfLabel.C) / 2,
      E: (bfIpip.E + bfLabel.E) / 2,
      A: (bfIpip.A + bfLabel.A) / 2,
      S: (bfIpip.S + bfLabel.S) / 2,
    };
  } else if (bfIpip) {
    bigFive = bfIpip as any;
  } else if (bfLabel) {
    bigFive = bfLabel as any;
  }

  // === CONSISTÊNCIA: similaridade entre Big Five dos 2 instrumentos (se ambos) ===
  let consistencia = 0;
  if (bfIpip && bfLabel) {
    const factors = ["O", "C", "E", "A", "S"];
    let totalDiff = 0;
    for (const f of factors) {
      totalDiff += Math.abs(bfIpip[f] - bfLabel[f]);
    }
    // Diff médio máximo é 4 (escala 1-5). Quanto menor, mais consistente.
    const avgDiff = totalDiff / factors.length;
    consistencia = Math.max(0, 20 * (1 - avgDiff / 4)); // 0-20 pontos
  } else {
    consistencia = 5; // só 1 instrumento ou nenhum dos 2 → bonus mínimo
  }

  // === QUALIDADE: penaliza por flags ===
  const allFlags: string[] = [];
  for (const a of completed) {
    const flags = safeParse(a.qualityFlagsJson) || [];
    if (Array.isArray(flags)) {
      for (const f of flags) allFlags.push(`${a.instrument}:${f}`);
    }
  }
  const qualityPenalty = Math.min(20, allFlags.length * 4);
  const qualidade = Math.max(0, 10 - qualityPenalty);

  // === DISC profile ===
  const disc = completed.find((a) => a.instrument === "disc-adapted" || a.instrument === "disc-adapt");
  let discProfile: string | null = null;
  if (disc) {
    const s = safeParse(disc.scoresJson);
    discProfile = s?.profile ?? s?.dominant ?? null;
  }

  // === SCORE FINAL ===
  const score = Math.max(0, Math.min(100, Math.round(completude + consistencia + qualidade)));

  const band: BehavioralIndexResult["band"] =
    score >= 80 ? "robusto"
    : score >= 60 ? "consistente"
    : score >= 35 ? "parcial"
    : "incompleto";

  return {
    score,
    band,
    instruments_count: completed.length,
    instruments: slugs,
    components: {
      completude: Math.round(completude),
      consistencia: Math.round(consistencia),
      qualidade: Math.round(qualidade),
    },
    big_five: bigFive
      ? {
          O: Math.round(bigFive.O * 10) / 10,
          C: Math.round(bigFive.C * 10) / 10,
          E: Math.round(bigFive.E * 10) / 10,
          A: Math.round(bigFive.A * 10) / 10,
          S: Math.round(bigFive.S * 10) / 10,
        }
      : null,
    disc_profile: discProfile,
    flags: allFlags,
  };
}

export const BEHAVIORAL_BAND_LABEL_PT: Record<BehavioralIndexResult["band"], string> = {
  incompleto: "Sem avaliação suficiente",
  parcial: "Avaliação parcial",
  consistente: "Avaliação consistente",
  robusto: "Avaliação robusta",
};
