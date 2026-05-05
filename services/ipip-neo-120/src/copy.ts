/**
 * User-facing copy (pt-BR) for IPIP-NEO-120 interpretation.
 *
 * This file is the SINGLE SOURCE for all strings the end user sees.
 * Logic in interpretation.ts reads from here — it must not hardcode strings.
 *
 * Linguagem responsável (regra do produto):
 *   - NUNCA usar termos clínicos ("neurótico", "psicopata", "transtorno").
 *   - Sempre "tendência a", "sinalização", "perfil de", "preferência por".
 *   - Strengths/Watchouts em pt-BR, neutros e descritivos.
 */

import type { ScoreLevel } from "../../_contract/schema";
import type { IpipDomain } from "./items";

export type DomainCopyLevel = "very_low" | "low" | "average" | "high" | "very_high";

interface DomainCopy {
  /** Nome amigável do domínio em pt-BR. */
  label: string;
  strengths: Record<DomainCopyLevel, string[]>;
  watchouts: Record<DomainCopyLevel, string[]>;
  narrative: Record<DomainCopyLevel, string>;
}

export const DOMAIN_COPY: Record<IpipDomain, DomainCopy> = {
  O: {
    label: "Abertura a Experiências",
    strengths: {
      very_low: ["Perfil prático e focado no que já funciona."],
      low: ["Tendência a valorizar processos comprovados e rotinas estáveis."],
      average: [
        "Equilíbrio entre o conhecido e a abertura a novas ideias.",
      ],
      high: [
        "Forte abertura a novas ideias, perspectivas e experiências.",
        "Curiosidade intelectual que favorece a aprendizagem contínua.",
      ],
      very_high: [
        "Pensamento criativo e divergente acentuado.",
        "Tendência a explorar ideias abstratas, arte e novas perspectivas.",
      ],
    },
    watchouts: {
      very_low: [
        "Sinalização de pouca aderência a contextos que exigem mudança ou criatividade.",
      ],
      low: [
        "Pode ter preferência por tarefas estruturadas e ambientes previsíveis.",
      ],
      average: [],
      high: [
        "Sinalização de busca por estímulo intelectual constante — pode demandar projetos variados para manter engajamento.",
      ],
      very_high: [
        "Sinalização de tendência a se dispersar entre múltiplos interesses; checar foco em entregas concretas.",
      ],
    },
    narrative: {
      very_low:
        "O perfil sugere preferência forte por contextos práticos, com pouco apelo por abstração ou novidade.",
      low: "O perfil indica preferência por estruturas conhecidas e tarefas previsíveis, com menor apetite por mudança.",
      average:
        "O perfil mostra equilíbrio entre o uso do que já é familiar e a disposição para experimentar novas abordagens.",
      high: "O perfil sinaliza abertura intelectual e curiosidade, com tendência a buscar novos aprendizados e a apreciar ideias diversas.",
      very_high:
        "O perfil sugere alta criatividade e apetite por exploração — propenso a ambientes complexos, ambíguos ou de inovação.",
    },
  },

  C: {
    label: "Conscienciosidade",
    strengths: {
      very_low: ["Perfil flexível e adaptável a mudanças de plano."],
      low: ["Tendência a improvisar e a se adequar a situações novas."],
      average: ["Capacidade de planejar mantendo flexibilidade."],
      high: [
        "Tendência a entregar com consistência e atenção a prazos.",
        "Disciplina para sustentar foco em objetivos de longo prazo.",
      ],
      very_high: [
        "Perfil altamente organizado e orientado a resultados.",
        "Forte disciplina para metas e padrões de qualidade.",
      ],
    },
    watchouts: {
      very_low: [
        "Sinalização de dificuldade com prazos e estrutura — checar suporte em rotinas.",
      ],
      low: [
        "Sinalização de menor apego a planejamento detalhado.",
      ],
      average: [],
      high: [
        "Sinalização de exigência elevada consigo mesmo(a) — checar equilíbrio com descanso.",
      ],
      very_high: [
        "Sinalização de tendência a perfeccionismo; pode dificultar delegação ou tolerância a erros alheios.",
      ],
    },
    narrative: {
      very_low:
        "O perfil indica baixa preferência por estrutura e disciplina, favorecendo flexibilidade e improviso.",
      low: "O perfil sugere abordagem mais flexível à organização e ao cumprimento de rotinas.",
      average:
        "O perfil revela equilíbrio entre disciplina e adaptabilidade nas tarefas e prazos.",
      high: "O perfil sinaliza disciplina e foco em entregas, com tendência a manter compromissos e padrões.",
      very_high:
        "O perfil sugere alto rigor com planejamento, organização e cumprimento de objetivos.",
    },
  },

  E: {
    label: "Extroversão",
    strengths: {
      very_low: ["Perfil reservado, com energia para trabalho profundo e individual."],
      low: ["Tendência a preferir interações em grupos pequenos e contextos calmos."],
      average: ["Equilíbrio entre interação social e trabalho individual."],
      high: [
        "Energia social acentuada e facilidade em conexões interpessoais.",
        "Iniciativa em situações de grupo.",
      ],
      very_high: [
        "Forte presença social e disposição para liderança visível.",
        "Energia para ambientes dinâmicos e de alta interação.",
      ],
    },
    watchouts: {
      very_low: [
        "Sinalização de menor visibilidade em ambientes que exigem networking ativo.",
      ],
      low: [
        "Sinalização de preferência por canais escritos/assíncronos para comunicação.",
      ],
      average: [],
      high: [
        "Sinalização de alta necessidade de estímulo social — checar tolerância a tarefas solitárias.",
      ],
      very_high: [
        "Sinalização de tendência a ocupar muito espaço social — checar escuta ativa em equipes.",
      ],
    },
    narrative: {
      very_low:
        "O perfil sugere preferência por contextos silenciosos e foco individual, com menor apetite por exposição social.",
      low: "O perfil indica preferência por interações pontuais e em grupos pequenos.",
      average:
        "O perfil mostra equilíbrio entre energia social e momentos de trabalho focado.",
      high: "O perfil sinaliza energia para interação, exposição e liderança em grupo.",
      very_high:
        "O perfil sugere forte sociabilidade e protagonismo — favorável em papéis com alta visibilidade.",
    },
  },

  A: {
    label: "Amabilidade",
    strengths: {
      very_low: ["Perfil direto e firme em negociações e em decisões duras."],
      low: ["Tendência a defender pontos de vista com assertividade."],
      average: ["Equilíbrio entre cooperação e defesa de interesses próprios."],
      high: [
        "Tendência a colaborar e a construir consenso em equipe.",
        "Empatia e disposição em apoiar colegas.",
      ],
      very_high: [
        "Forte orientação a cuidado, cooperação e acolhimento.",
      ],
    },
    watchouts: {
      very_low: [
        "Sinalização de baixa cooperação espontânea — checar dinâmicas de time.",
      ],
      low: [
        "Sinalização de estilo competitivo; pode demandar mediação em conflitos.",
      ],
      average: [],
      high: [
        "Sinalização de tendência a evitar conflitos — checar capacidade de dar feedback duro.",
      ],
      very_high: [
        "Sinalização de risco de sobrecarregar-se com demandas alheias; checar limites pessoais.",
      ],
    },
    narrative: {
      very_low:
        "O perfil sugere postura mais competitiva e orientada a interesses próprios.",
      low: "O perfil indica preferência por defender posições com firmeza.",
      average:
        "O perfil mostra equilíbrio entre cooperação e firmeza nas relações.",
      high: "O perfil sinaliza colaboração, empatia e cuidado nas relações de trabalho.",
      very_high:
        "O perfil sugere alta cooperatividade e cuidado com o outro — pode beneficiar contextos de equipe e atendimento.",
    },
  },

  N: {
    label: "Estabilidade Emocional (Neuroticismo invertido)",
    strengths: {
      very_low: [
        "Perfil de alta estabilidade emocional sob pressão.",
        "Tendência a manter a calma em contextos estressantes.",
      ],
      low: ["Tendência a manter equilíbrio emocional na maior parte do tempo."],
      average: ["Reatividade emocional dentro do esperado."],
      high: ["Sensibilidade ao ambiente que pode favorecer percepção fina de riscos."],
      very_high: [
        "Alta sensibilidade ao ambiente — pode contribuir para vigilância e antecipação de problemas.",
      ],
    },
    watchouts: {
      very_low: [
        "Sinalização de baixa percepção de risco — checar atenção a alertas relevantes.",
      ],
      low: [],
      average: [],
      high: [
        "Sinalização de maior reatividade emocional sob pressão — checar suporte e descanso.",
      ],
      very_high: [
        "Sinalização de alta sensibilidade ao estresse; suporte e contexto previsível ajudam a sustentar entregas.",
      ],
    },
    narrative: {
      very_low:
        "O perfil sugere alta estabilidade emocional, com tendência a manter a calma em situações de pressão.",
      low: "O perfil indica equilíbrio emocional consistente na maior parte das situações.",
      average:
        "O perfil mostra reatividade emocional dentro do padrão esperado, com momentos pontuais de tensão.",
      high: "O perfil sinaliza maior sensibilidade ao ambiente — pode demandar suporte e previsibilidade.",
      very_high:
        "O perfil sugere alta sensibilidade ao estresse, com tendência a reações emocionais mais intensas frente a pressões.",
    },
  },
};

/** Localised label for a Score level. */
export const LEVEL_LABEL: Record<ScoreLevel, string> = {
  very_low: "muito baixo",
  low: "baixo",
  average: "médio",
  high: "alto",
  very_high: "muito alto",
};

export const QUALITY_FLAG_NOTE: Record<string, string> = {
  too_fast:
    "O preenchimento foi muito rápido — a confiança do resultado foi reduzida.",
  inconsistent:
    "Foram observadas respostas contraditórias em itens equivalentes — a confiança do resultado foi reduzida.",
  incomplete:
    "Algumas respostas estavam faltando — o resultado foi calculado por imputação e a confiança foi reduzida.",
  straightlining:
    "Foi observada uma sequência longa de respostas idênticas — a confiança do resultado foi reduzida.",
  social_desirability_high:
    "Foi observado padrão sugerindo respostas socialmente desejáveis — a confiança do resultado foi reduzida.",
};

export const DEFAULT_NARRATIVE_HEADER =
  "O resultado abaixo descreve o perfil indicado pelas respostas. " +
  "Trata-se de uma sinalização de tendências, não de um diagnóstico clínico.";
