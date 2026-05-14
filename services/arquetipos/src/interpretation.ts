/**
 * Interpretação Arquétipos em PT-BR.
 *
 * Linguagem responsável (NR-1/LGPD): "tendência a", "perfil de", "sinalização".
 * Sem termos clínicos.
 *
 * Conceito teórico: 12 arquétipos jungianos (Jung, domínio público desde 2011).
 * Descrições aqui são AUTORAIS — escritas pra este projeto, não copiam textos
 * comerciais (Brand Archetypes, Hero Within etc).
 */

import type { Archetype } from "./items";
import { ARCHETYPE_LABEL } from "./items";
import type { ArchetypeScores } from "./scoring";

export const ARCHETYPE_DESC: Record<Archetype, string> = {
  inocente:
    "Confia que as coisas tendem a dar certo. Mantém otimismo e simplicidade mesmo em contextos complexos.",
  sabio:
    "Busca verdade e profundidade. Toma decisões com base em conhecimento, análise e reflexão.",
  explorador:
    "Movido por liberdade e descoberta. Prefere o caminho ainda não trilhado, valoriza autonomia.",
  rebelde:
    "Questiona regras estabelecidas. Vê transformação onde outros veem ordem que precisa ser mantida.",
  mago:
    "Conecta ideias e cria processos transformadores. Vê pontes onde outros veem ilhas.",
  heroi:
    "Encara desafios de frente. Coragem como linguagem, conquista como motivação principal.",
  amante:
    "Vive pelas conexões e pela estética. Coloca paixão e profundidade no que importa.",
  bobo:
    "Traz leveza e humor pra qualquer ambiente. Desarma tensões e cria momentos de presença.",
  cuidador:
    "Realiza-se ao cuidar de outros. Sensível às necessidades alheias, generoso por instinto.",
  criador:
    "Necessidade constante de produzir algo novo. Expressão é tão essencial quanto respirar.",
  governante:
    "Valoriza ordem, controle e estrutura. Pensa em longo prazo, estabelece padrões e cobra entrega.",
  pessoa_comum:
    "Valoriza pertencimento e autenticidade. Resiste a tratamento de privilégio, conecta-se pelo genuíno.",
};

export const ARCHETYPE_STRENGTHS: Record<Archetype, string[]> = {
  inocente: ["Otimismo realista", "Capacidade de recomeçar", "Confiança como ativo"],
  sabio: ["Profundidade analítica", "Visão de longo prazo", "Mentoria natural"],
  explorador: ["Adaptação a contextos novos", "Tolerância a incerteza", "Iniciativa"],
  rebelde: ["Capacidade de transformação", "Coragem de discordar", "Senso de injustiça aguçado"],
  mago: ["Visão sistêmica", "Capacidade de articular pessoas", "Criação de processos"],
  heroi: ["Coragem operacional", "Foco em resultado", "Energia em adversidade"],
  amante: ["Engajamento profundo", "Sensibilidade estética", "Construção de relações"],
  bobo: ["Inteligência social", "Quebra de tensões", "Criatividade lúdica"],
  cuidador: ["Empatia ativa", "Lealdade", "Disposição a servir"],
  criador: ["Originalidade", "Pensamento divergente", "Estética de execução"],
  governante: ["Liderança estruturada", "Visão estratégica", "Capacidade de delegar"],
  pessoa_comum: ["Conexão genuína", "Resistência ao status forçado", "Pé no chão"],
};

export const ARCHETYPE_WATCHOUTS: Record<Archetype, string[]> = {
  inocente: ["Negar problemas reais", "Ingenuidade em contextos hostis", "Dificuldade com conflito"],
  sabio: ["Paralisia por análise", "Distanciamento emocional", "Excesso de criticidade"],
  explorador: ["Dificuldade em manter rotina", "Resistência a aprofundamento", "Inquietação crônica"],
  rebelde: ["Confronto desnecessário", "Resistência a estruturas legítimas", "Polarização"],
  mago: ["Promessa maior que entrega", "Distância do operacional", "Manipulação percebida"],
  heroi: ["Auto-exigência tóxica", "Pular etapas de análise", "Burnout por adversidade contínua"],
  amante: ["Dependência emocional", "Decisões guiadas só por afeto", "Drama relacional"],
  bobo: ["Dificuldade com gravidade", "Humor inadequado", "Procrastinação por leveza"],
  cuidador: ["Auto-anulação", "Sobrecarga por dizer sim", "Codependência"],
  criador: ["Insatisfação crônica", "Resistência a feedback", "Dificuldade em fechar"],
  governante: ["Controle excessivo", "Resistência a delegar de fato", "Rigidez hierárquica"],
  pessoa_comum: ["Aversão a destaque", "Acomodação", "Dificuldade em pedir reconhecimento"],
};

export interface ArchetypeInterpretation {
  dominant: Archetype;
  dominant_label: string;
  secondary: Archetype;
  secondary_label: string;
  narrative: string;
  strengths: string[];
  watchouts: string[];
  top3: Array<{ archetype: Archetype; label: string; score: number; description: string }>;
}

export function buildInterpretation(scores: ArchetypeScores): ArchetypeInterpretation {
  const dominant = scores.dominant;
  const secondary = scores.secondary;

  const narrative =
    `Perfil arquetípico dominante: ${ARCHETYPE_LABEL[dominant]}, com sustentação do ${ARCHETYPE_LABEL[secondary]}. ` +
    `${ARCHETYPE_DESC[dominant]} A combinação com ${ARCHETYPE_LABEL[secondary]} adiciona ` +
    `${ARCHETYPE_DESC[secondary].toLowerCase()}`;

  return {
    dominant,
    dominant_label: ARCHETYPE_LABEL[dominant],
    secondary,
    secondary_label: ARCHETYPE_LABEL[secondary],
    narrative,
    strengths: [
      ...ARCHETYPE_STRENGTHS[dominant].slice(0, 2),
      ...ARCHETYPE_STRENGTHS[secondary].slice(0, 1),
    ],
    watchouts: [
      ...ARCHETYPE_WATCHOUTS[dominant].slice(0, 2),
      ...ARCHETYPE_WATCHOUTS[secondary].slice(0, 1),
    ],
    top3: scores.top3.map((t) => ({
      archetype: t.archetype,
      label: ARCHETYPE_LABEL[t.archetype],
      score: t.score,
      description: ARCHETYPE_DESC[t.archetype],
    })),
  };
}
