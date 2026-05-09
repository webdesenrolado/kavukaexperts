/**
 * Interpretação DISC adaptado em PT-BR.
 *
 * Linguagem responsável (NR-1 / LGPD art. 20):
 * - Sempre "tendência a", "perfil de", "sinalização" — nunca diagnóstico clínico
 * - Sem termos como "neurótico", "psicopata", "transtorno"
 * - Resultados são feedback, não rótulo permanente
 *
 * Mapeamento Perfil GUÉP (NÃO é DISC clássico):
 * - Executor: D dominante (drive, foco resultado)
 * - Estrategista: C+D ou C dominante (analítico + decisivo)
 * - Operador: S+C ou S dominante (estabilidade + precisão)
 * - Influenciador: I dominante (sociabilidade, persuasão)
 */

import type { Dimension } from "./items";
import type { DiscNormalizedScores } from "./scoring";
import { bandFromScore, BAND_LABEL_PT, type Band } from "./norms";

export type ProfileGuep = "Executor" | "Estrategista" | "Operador" | "Influenciador";

export const DIMENSION_NAME_PT: Record<Dimension, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};

export const DIMENSION_DESCRIPTION_PT: Record<Dimension, string> = {
  D: "como a pessoa lida com problemas e desafios",
  I: "como a pessoa influencia e se relaciona com outros",
  S: "como a pessoa lida com ritmo e mudanças",
  C: "como a pessoa lida com regras e procedimentos",
};

export const DIMENSION_TENDENCY_PT: Record<Dimension, Record<Band, string>> = {
  D: {
    very_high:
      "Tendência a tomar decisões rapidamente, assumir comando e enfrentar desafios diretamente. Pode ser percebido como impaciente.",
    high: "Foco em resultado, decidido e direto. Costuma assumir responsabilidades antes dos outros.",
    moderate: "Equilibra assertividade e cooperação. Decide com base no contexto.",
    low: "Prefere consenso a confronto. Pode adiar decisões difíceis.",
    very_low:
      "Evita liderar processos decisórios. Tende a delegar quando há pressão.",
  },
  I: {
    very_high:
      "Energia social muito alta. Persuade pelo entusiasmo. Pode soar disperso em discussões longas.",
    high: "Comunicativo, otimista e influente em redes pessoais.",
    moderate: "Sociável quando o contexto pede; reservado em ambientes formais.",
    low: "Mais reservado em interações; prefere comunicação objetiva.",
    very_low:
      "Tende a evitar exposição social; trabalha melhor em contextos individuais.",
  },
  S: {
    very_high:
      "Muito estável e leal; valoriza previsibilidade. Pode resistir a mudanças bruscas.",
    high: "Paciente, colaborativo e consistente. Mantém a calma sob pressão.",
    moderate: "Adapta-se ao ritmo do contexto. Equilibra estabilidade e mudança.",
    low: "Inquieto com rotinas longas; busca movimento e variedade.",
    very_low:
      "Forte preferência por mudança constante; pode parecer impaciente em ambientes estáveis.",
  },
  C: {
    very_high:
      "Muito analítico e detalhista. Pode demorar mais que o esperado em decisões.",
    high: "Sistemático, preciso e questionador. Valoriza fatos e procedimentos.",
    moderate: "Equilibra rigor e flexibilidade. Adapta o método ao contexto.",
    low: "Prioriza velocidade sobre detalhe. Tolerante a ambiguidade.",
    very_low:
      "Pouca aderência a regras formais; foco em improviso.",
  },
};

/** Determina o perfil GUÉP a partir das dimensões dominante e secundária. */
export function profileFromScores(scores: DiscNormalizedScores): ProfileGuep {
  const { dominant, secondary } = scores;
  if (dominant === "I") return "Influenciador";
  if (dominant === "D") {
    if (secondary === "C") return "Estrategista";
    return "Executor";
  }
  if (dominant === "C") {
    if (secondary === "D") return "Estrategista";
    return "Operador";
  }
  // dominant === "S"
  return "Operador";
}

export const PROFILE_DESCRIPTION_PT: Record<ProfileGuep, string> = {
  Executor:
    "Perfil orientado a resultado e execução rápida. Prefere decidir e agir; valoriza autonomia e desafio.",
  Estrategista:
    "Perfil que combina análise rigorosa com poder de decisão. Constrói planos detalhados e segue até a execução.",
  Operador:
    "Perfil que entrega com consistência. Valoriza método, rotina e qualidade. Forte em ambientes estáveis.",
  Influenciador:
    "Perfil que mobiliza pessoas pela energia e comunicação. Conecta times, vende ideias e energiza ambientes.",
};

export const PROFILE_STRENGTHS_PT: Record<ProfileGuep, string[]> = {
  Executor: [
    "Toma decisões sob pressão",
    "Foco em resultado mensurável",
    "Tolera adversidade e ambiguidade",
    "Lidera por iniciativa",
  ],
  Estrategista: [
    "Análise crítica de cenários",
    "Planejamento estruturado",
    "Decisões fundamentadas em dados",
    "Visão de longo prazo",
  ],
  Operador: [
    "Consistência operacional",
    "Atenção a procedimentos",
    "Estabilidade em equipe",
    "Confiabilidade em entregas repetidas",
  ],
  Influenciador: [
    "Comunicação persuasiva",
    "Gestão de redes e relacionamentos",
    "Energia em apresentações",
    "Construção de narrativa",
  ],
};

export const PROFILE_WATCHOUTS_PT: Record<ProfileGuep, string[]> = {
  Executor: [
    "Pode pular etapas de análise",
    "Risco de tomar decisões sem consultar pares",
    "Impaciência com processos longos",
  ],
  Estrategista: [
    "Risco de paralisia por análise",
    "Pode parecer crítico demais ao time",
    "Dificuldade em decidir com dados incompletos",
  ],
  Operador: [
    "Pode resistir a mudanças necessárias",
    "Aversão a confronto",
    "Lentidão em adaptar processo",
  ],
  Influenciador: [
    "Pode subestimar detalhe operacional",
    "Tendência a assumir mais que executa",
    "Foco mais em causar impressão do que mensurar",
  ],
};

export interface DiscInterpretation {
  /** Perfil GUÉP derivado das dimensões */
  profile: ProfileGuep;
  /** Texto descritivo geral do perfil */
  narrative: string;
  /** Forças do perfil */
  strengths: string[];
  /** Pontos de atenção */
  watchouts: string[];
  /** Bandas e tendências por dimensão */
  by_dimension: Record<
    Dimension,
    { score: number; band: Band; band_label: string; tendency: string }
  >;
}

export function buildInterpretation(scores: DiscNormalizedScores): DiscInterpretation {
  const profile = profileFromScores(scores);
  const dims: Dimension[] = ["D", "I", "S", "C"];
  const byDimension = {} as DiscInterpretation["by_dimension"];
  for (const d of dims) {
    const score = scores[d];
    const band = bandFromScore(score);
    byDimension[d] = {
      score,
      band,
      band_label: BAND_LABEL_PT[band],
      tendency: DIMENSION_TENDENCY_PT[d][band],
    };
  }
  return {
    profile,
    narrative: PROFILE_DESCRIPTION_PT[profile],
    strengths: PROFILE_STRENGTHS_PT[profile],
    watchouts: PROFILE_WATCHOUTS_PT[profile],
    by_dimension: byDimension,
  };
}
