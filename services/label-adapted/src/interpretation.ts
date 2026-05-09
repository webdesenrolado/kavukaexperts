/**
 * Interpretação LABEL adaptado em PT-BR.
 *
 * Linguagem responsável (NR-1 / LGPD):
 * - "tendência a", "perfil de", "sinalização" — nunca diagnóstico clínico
 * - sem termos como "neurótico", "psicopata", "transtorno"
 */

import type { Dimension, BigFive } from "./items";
import type { LabelDimensionScores, LabelBigFiveScores } from "./scoring";
import { DIMENSION_NORMS, BIG_FIVE_NORMS, bandFromZ, BAND_LABEL_PT, type Band } from "./norms";
import { DIMENSION_LABEL } from "./items";

export interface DimensionResult {
  /** Score 1-5 bruto */
  score: number;
  /** Z-score em relação à norma populacional */
  z: number;
  /** Banda categórica */
  band: Band;
  /** Label da banda em PT-BR */
  band_label: string;
  /** Tendência interpretativa */
  tendency: string;
}

export interface BigFiveResult extends DimensionResult {
  /** Letra do fator */
  factor: BigFive;
}

const DIMENSION_TENDENCY: Record<Dimension, Record<Band, string>> = {
  estabilidade: {
    muito_baixo: "Sinalização de tensão emocional acentuada. Tende a sentir-se inseguro/-a com frequência.",
    baixo: "Em certos contextos pode demonstrar inquietação ou hesitação.",
    moderado: "Equilíbrio emocional próximo da média populacional.",
    alto: "Demonstra serenidade e segurança na maior parte do tempo.",
    muito_alto: "Forte tendência à calma e confiança mesmo em situações de pressão.",
  },
  adaptabilidade: {
    muito_baixo: "Resistência marcada a mudanças e perspectivas diferentes.",
    baixo: "Prefere contextos estáveis e previsíveis.",
    moderado: "Adapta-se quando o contexto pede; mantém-se estável quando possível.",
    alto: "Lida com mudança e diversidade de perspectivas com facilidade.",
    muito_alto: "Muito flexível, ajusta-se rapidamente a contextos diversos.",
  },
  metodo: {
    muito_baixo: "Pode parecer desorganizado/-a ou improvisado/-a.",
    baixo: "Tende a priorizar agilidade sobre rigor metodológico.",
    moderado: "Equilibra organização e flexibilidade conforme o contexto.",
    alto: "Sistemático/-a e organizado/-a; valoriza ordem e processo.",
    muito_alto: "Forte aderência a método; pode demorar mais que a média em decisões.",
  },
  racionalidade: {
    muito_baixo: "Decisões frequentemente guiadas por intuição ou emoção.",
    baixo: "Equilibra razão e sentimento, com leve preferência pelo intuitivo.",
    moderado: "Combina dados e percepção conforme a situação.",
    alto: "Valoriza fatos, lógica e análise.",
    muito_alto: "Muito analítico/-a; pode resistir a decisões com dados incompletos.",
  },
  motivacao: {
    muito_baixo: "Sinalização de baixa energia para metas; pode estar desmotivado/-a.",
    baixo: "Persegue objetivos sem grande pressa.",
    moderado: "Motivado/-a o suficiente para entregar o que se compromete.",
    alto: "Persistente e direcionado/-a a resultados.",
    muito_alto: "Muito orientado/-a a metas; pode pressionar a si e ao time.",
  },
  combatividade: {
    muito_baixo: "Evita confrontos; prefere acomodar-se.",
    baixo: "Pacífico/-a, busca o consenso na maioria das situações.",
    moderado: "Confronta quando necessário, sem buscar conflito.",
    alto: "Disposto/-a a defender posições com firmeza.",
    muito_alto: "Combativo/-a; pode soar contundente em discussões.",
  },
  autoridade: {
    muito_baixo: "Prefere seguir orientações do que decidir.",
    baixo: "Atua em papéis de execução com mais facilidade que de comando.",
    moderado: "Lidera ou segue conforme o contexto.",
    alto: "Toma decisões e direciona pessoas com naturalidade.",
    muito_alto: "Forte tendência ao comando; pode parecer autoritário/-a.",
  },
  expansividade: {
    muito_baixo: "Reservado/-a, valoriza ambientes contidos.",
    baixo: "Mais discreto/-a do que expansivo/-a.",
    moderado: "Equilibra expansão e contenção.",
    alto: "Expansivo/-a e energético/-a em contextos sociais.",
    muito_alto: "Muito aventureiro/-a e expansivo/-a; busca novidade constantemente.",
  },
  originalidade: {
    muito_baixo: "Prefere o convencional ao inovador.",
    baixo: "Confortável com soluções já testadas.",
    moderado: "Aberto/-a a novidade quando faz sentido.",
    alto: "Curioso/-a e criativo/-a; gera ideias com facilidade.",
    muito_alto: "Muito inventivo/-a; pode ter dificuldade em rotinas longas.",
  },
  sociabilidade: {
    muito_baixo: "Prefere interações pontuais e em grupos pequenos.",
    baixo: "Reservado/-a em ambientes muito sociais.",
    moderado: "Sociável quando o contexto pede, mas valoriza tempo individual.",
    alto: "Energizado/-a por contato social e relações.",
    muito_alto: "Muito sociável; busca constantemente interação.",
  },
  altruismo: {
    muito_baixo: "Prioriza próprios interesses; pode soar individualista.",
    baixo: "Coopera quando há reciprocidade clara.",
    moderado: "Equilibra atenção a si e ao outro.",
    alto: "Generoso/-a e atento/-a às necessidades do time.",
    muito_alto: "Forte tendência a se colocar a serviço do outro; pode esquecer de si.",
  },
  dependencia: {
    muito_baixo: "Independente; pode resistir a opiniões externas.",
    baixo: "Decide e age com autonomia.",
    moderado: "Busca alinhamento com pares antes de decidir.",
    alto: "Valoriza consenso e aprovação do grupo.",
    muito_alto: "Forte dependência de validação externa; pode ter dificuldade em discordar.",
  },
  fragilidade: {
    muito_baixo: "Sinalização baixa de fragilidade emocional.",
    baixo: "Raramente demonstra ansiedade ou irritabilidade marcantes.",
    moderado: "Apresenta variações emocionais dentro da média.",
    alto: "Demonstra mais ansiedade/irritabilidade que a média.",
    muito_alto: "Sinalização de fragilidade emocional acentuada — recomenda-se cautela em interpretações.",
  },
};

const BIG_FIVE_LABEL: Record<BigFive, string> = {
  O: "Abertura à Experiência",
  C: "Conscienciosidade",
  E: "Extroversão",
  A: "Afabilidade",
  S: "Estabilidade Emocional",
};

const BIG_FIVE_TENDENCY: Record<BigFive, Record<Band, string>> = {
  O: {
    muito_baixo: "Muito conservador/-a; valoriza tradição.",
    baixo: "Prefere o conhecido ao novo.",
    moderado: "Equilibra abertura e tradição.",
    alto: "Aberto/-a a ideias e experiências.",
    muito_alto: "Muito curioso/-a e original.",
  },
  C: {
    muito_baixo: "Pouco aderente a método; espontâneo/-a.",
    baixo: "Mais flexível que disciplinado/-a.",
    moderado: "Disciplinado/-a quando necessário.",
    alto: "Organizado/-a e responsável.",
    muito_alto: "Muito metódico/-a; alta aderência a regras.",
  },
  E: {
    muito_baixo: "Muito introvertido/-a; valoriza solidão.",
    baixo: "Reservado/-a em interações.",
    moderado: "Equilibra solidão e interação.",
    alto: "Sociável e energético/-a.",
    muito_alto: "Muito extrovertido/-a; busca constantemente atenção social.",
  },
  A: {
    muito_baixo: "Crítico/-a, defende interesses próprios.",
    baixo: "Mais analítico/-a do que conciliador/-a.",
    moderado: "Equilibra cooperação e confronto.",
    alto: "Cooperativo/-a e empático/-a.",
    muito_alto: "Muito altruísta; pode evitar confronto necessário.",
  },
  S: {
    muito_baixo: "Sinalização forte de instabilidade emocional.",
    baixo: "Algumas variações emocionais marcantes.",
    moderado: "Estabilidade próxima da média.",
    alto: "Calmo/-a e seguro/-a.",
    muito_alto: "Muito estável; raramente demonstra abalo.",
  },
};

function buildDimensionResult(d: Dimension, score: number): DimensionResult {
  const { mean, sd } = DIMENSION_NORMS[d];
  const z = (score - mean) / Math.max(0.01, sd);
  const band = bandFromZ(z);
  return {
    score: Math.round(score * 100) / 100,
    z: Math.round(z * 100) / 100,
    band,
    band_label: BAND_LABEL_PT[band],
    tendency: DIMENSION_TENDENCY[d][band],
  };
}

function buildBigFiveResult(f: BigFive, score: number): BigFiveResult {
  const { mean, sd } = BIG_FIVE_NORMS[f];
  const z = (score - mean) / Math.max(0.01, sd);
  const band = bandFromZ(z);
  return {
    factor: f,
    score: Math.round(score * 100) / 100,
    z: Math.round(z * 100) / 100,
    band,
    band_label: BAND_LABEL_PT[band],
    tendency: BIG_FIVE_TENDENCY[f][band],
  };
}

export interface LabelInterpretation {
  /** Resumo narrativo do perfil */
  narrative: string;
  /** Top 3 dimensões com maior score (forças aparentes) */
  top_dimensions: Array<{ dim: Dimension; label: string; score: number; band: Band }>;
  /** Bottom 3 dimensões (pontos de atenção) */
  bottom_dimensions: Array<{ dim: Dimension; label: string; score: number; band: Band }>;
  /** Resultado por dimensão */
  by_dimension: Record<Dimension, DimensionResult>;
  /** Big Five */
  big_five: Record<BigFive, BigFiveResult>;
}

export function buildInterpretation(
  scores: LabelDimensionScores,
  bigFive: { O: number; C: number; E: number; A: number; S: number }
): LabelInterpretation {
  const dims: Dimension[] = [
    "estabilidade", "adaptabilidade", "metodo", "racionalidade", "motivacao",
    "combatividade", "autoridade", "expansividade", "originalidade",
    "sociabilidade", "altruismo", "dependencia",
  ];

  const byDim = {} as Record<Dimension, DimensionResult>;
  for (const d of dims) {
    byDim[d] = buildDimensionResult(d, scores[d]);
  }
  byDim.fragilidade = buildDimensionResult("fragilidade", scores.fragilidade);

  const bf = {
    O: buildBigFiveResult("O", bigFive.O),
    C: buildBigFiveResult("C", bigFive.C),
    E: buildBigFiveResult("E", bigFive.E),
    A: buildBigFiveResult("A", bigFive.A),
    S: buildBigFiveResult("S", bigFive.S),
  };

  // Top/bottom 3 dimensões pelo z
  const sorted = dims
    .map((d) => ({ d, z: byDim[d].z, score: byDim[d].score, band: byDim[d].band }))
    .sort((a, b) => b.z - a.z);
  const top = sorted.slice(0, 3).map((x) => ({
    dim: x.d,
    label: DIMENSION_LABEL[x.d],
    score: x.score,
    band: x.band,
  }));
  const bottom = sorted.slice(-3).reverse().map((x) => ({
    dim: x.d,
    label: DIMENSION_LABEL[x.d],
    score: x.score,
    band: x.band,
  }));

  // Narrativa: combina o Big Five mais marcante com as top 2 dimensões
  const bfSorted = (Object.entries(bf) as [BigFive, BigFiveResult][])
    .sort(([, a], [, b]) => b.z - a.z);
  const dominantFactor = bfSorted[0][0];
  const narrative =
    `Perfil dominante em ${BIG_FIVE_LABEL[dominantFactor]}, com destaque em ` +
    `${DIMENSION_LABEL[top[0].dim]} (${BAND_LABEL_PT[top[0].band]}) ` +
    `e ${DIMENSION_LABEL[top[1].dim]} (${BAND_LABEL_PT[top[1].band]}). ` +
    `Pontos de atenção: ${DIMENSION_LABEL[bottom[0].dim]} (${BAND_LABEL_PT[bottom[0].band]}).`;

  return {
    narrative,
    top_dimensions: top,
    bottom_dimensions: bottom,
    by_dimension: byDim,
    big_five: bf,
  };
}
