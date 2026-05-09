/**
 * LABEL adaptado GUÉP — 60 pares bipolares (120 adjetivos autorais).
 *
 * Inspirado no método de autodescrição via lista de adjetivos em escala Likert.
 * Itens são SELECIONADOS POR NÓS — não reproduzem itens proprietários (MFO Tests
 * L.A.B.E.L., 16PF, Big Five Aspect Scales etc).
 *
 * Cada candidato avalia 120 adjetivos em escala Likert 1-5
 * (1 = "não me descreve", 5 = "me descreve totalmente").
 *
 * Saídas:
 * - Score 0-100 por uma das 13 dimensões (radar primário)
 * - Big Five derivado (O, C, E, A, S) por agregação ponderada
 * - Score Fragilidade = inverso de Estabilidade
 */

export type Dimension =
  | "estabilidade"
  | "adaptabilidade"
  | "metodo"
  | "racionalidade"
  | "motivacao"
  | "combatividade"
  | "autoridade"
  | "expansividade"
  | "originalidade"
  | "sociabilidade"
  | "altruismo"
  | "dependencia"
  | "fragilidade"; // computado como inverso

/** Dimensões mostradas no radar visual, em ordem horária a partir do topo */
export const RADAR_ORDER: Dimension[] = [
  "fragilidade",
  "estabilidade",
  "adaptabilidade",
  "metodo",
  "racionalidade",
  "motivacao",
  "combatividade",
  "autoridade",
  "expansividade",
  "originalidade",
  "sociabilidade",
  "altruismo",
  "dependencia",
];

export const DIMENSION_LABEL: Record<Dimension, string> = {
  estabilidade: "Estabilidade",
  adaptabilidade: "Adaptabilidade",
  metodo: "Método",
  racionalidade: "Racionalidade",
  motivacao: "Motivação",
  combatividade: "Combatividade",
  autoridade: "Autoridade",
  expansividade: "Expansividade",
  originalidade: "Originalidade",
  sociabilidade: "Sociabilidade",
  altruismo: "Altruísmo",
  dependencia: "Dependência",
  fragilidade: "Fragilidade",
};

export type BigFive = "O" | "C" | "E" | "A" | "S";

export interface LabelItem {
  /** ID estável: "p01a" (par 1, polo a) */
  id: string;
  /** Número do par (1..60) */
  pair: number;
  /** Polo: a (positivo da dimensão) ou b (negativo) */
  pole: "a" | "b";
  /** Adjetivo em PT-BR */
  text_pt: string;
  /** Dimensão à qual contribui */
  dimension: Dimension;
  /** +1: contribui positivo pra dim; -1: contribui negativo (subtrai) */
  polarity: 1 | -1;
  /** Mapeamento Big Five: dicionário com pesos por fator */
  big_five: Partial<Record<BigFive, number>>;
}

/**
 * Constrói um par bipolar com adjetivos {a} e {b}, ambos contribuindo
 * pra mesma dimensão (a positivo, b negativo).
 */
function pair(
  n: number,
  dim: Dimension,
  textA: string,
  textB: string,
  bf: Partial<Record<BigFive, number>>
): [LabelItem, LabelItem] {
  return [
    {
      id: `p${String(n).padStart(2, "0")}a`,
      pair: n,
      pole: "a",
      text_pt: textA,
      dimension: dim,
      polarity: 1,
      big_five: bf,
    },
    {
      id: `p${String(n).padStart(2, "0")}b`,
      pair: n,
      pole: "b",
      text_pt: textB,
      dimension: dim,
      polarity: -1,
      // Big Five: inverter sinais
      big_five: Object.fromEntries(
        Object.entries(bf).map(([k, v]) => [k, -v!])
      ) as Partial<Record<BigFive, number>>,
    },
  ];
}

export const PAIRS: LabelItem[][] = [
  // === ESTABILIDADE (7 pares) ===
  pair(1, "estabilidade", "calmo", "ansioso", { S: 1 }),
  pair(2, "estabilidade", "equilibrado", "instável", { S: 1 }),
  pair(3, "estabilidade", "sereno", "irritável", { S: 1 }),
  pair(4, "estabilidade", "confiante", "inseguro", { S: 1 }),
  pair(5, "estabilidade", "resiliente", "frágil", { S: 1 }),
  pair(6, "estabilidade", "tranquilo", "tenso", { S: 1 }),
  pair(7, "estabilidade", "otimista", "pessimista", { S: 1, E: 0.3 }),

  // === ADAPTABILIDADE (5 pares) ===
  pair(8, "adaptabilidade", "adaptável", "rígido", { O: 1 }),
  pair(9, "adaptabilidade", "flexível", "inflexível", { O: 1, A: 0.3 }),
  pair(10, "adaptabilidade", "tolerante", "intolerante", { A: 1 }),
  pair(11, "adaptabilidade", "paciente", "impaciente", { A: 0.7, S: 0.5 }),
  pair(12, "adaptabilidade", "pragmático", "idealista", { O: -0.3, C: 0.5 }),

  // === MÉTODO (5 pares) ===
  pair(13, "metodo", "metódico", "desordenado", { C: 1 }),
  pair(14, "metodo", "organizado", "bagunçado", { C: 1 }),
  pair(15, "metodo", "disciplinado", "indisciplinado", { C: 1 }),
  pair(16, "metodo", "minucioso", "descuidado", { C: 1 }),
  pair(17, "metodo", "previdente", "improvisador", { C: 1 }),

  // === RACIONALIDADE (5 pares) ===
  pair(18, "racionalidade", "lógico", "emocional", { C: 0.5, S: 0.3 }),
  pair(19, "racionalidade", "racional", "impulsivo", { C: 1, S: 0.3 }),
  pair(20, "racionalidade", "objetivo", "subjetivo", { C: 0.7 }),
  pair(21, "racionalidade", "analítico", "intuitivo", { C: 0.5, O: 0.3 }),
  pair(22, "racionalidade", "crítico", "aceitador", { O: 0.3, A: -0.5 }),

  // === MOTIVAÇÃO (5 pares) ===
  pair(23, "motivacao", "ambicioso", "acomodado", { C: 0.5, E: 0.5 }),
  pair(24, "motivacao", "empreendedor", "passivo", { C: 0.5, E: 0.7 }),
  pair(25, "motivacao", "perseverante", "desistente", { C: 1 }),
  pair(26, "motivacao", "determinado", "hesitante", { C: 0.7, E: 0.3 }),
  pair(27, "motivacao", "enérgico", "apático", { E: 1 }),

  // === COMBATIVIDADE (5 pares) ===
  pair(28, "combatividade", "combativo", "pacífico", { E: 0.7, A: -0.5 }),
  pair(29, "combatividade", "corajoso", "temeroso", { E: 0.5, S: 0.5 }),
  pair(30, "combatividade", "ousado", "receoso", { E: 0.7, O: 0.3 }),
  pair(31, "combatividade", "duro", "acolhedor", { A: -1 }),
  pair(32, "combatividade", "assertivo", "tímido", { E: 1 }),

  // === AUTORIDADE (5 pares) ===
  pair(33, "autoridade", "diretivo", "liderado", { E: 0.7, A: -0.3 }),
  pair(34, "autoridade", "dominante", "subordinado", { E: 0.5, A: -0.5 }),
  pair(35, "autoridade", "firme", "vacilante", { C: 0.5, E: 0.3 }),
  pair(36, "autoridade", "decisivo", "indeciso", { C: 0.5, E: 0.5 }),
  pair(37, "autoridade", "líder", "seguidor", { E: 1 }),

  // === EXPANSIVIDADE (4 pares) ===
  pair(38, "expansividade", "autônomo", "dependente", { O: 0.5, E: 0.5 }),
  pair(39, "expansividade", "aventureiro", "convencional", { O: 1 }),
  pair(40, "expansividade", "arrojado", "comedido", { O: 0.7, E: 0.5 }),
  pair(41, "expansividade", "expansivo", "contido", { E: 1 }),

  // === ORIGINALIDADE (5 pares) ===
  pair(42, "originalidade", "criativo", "comum", { O: 1 }),
  pair(43, "originalidade", "curioso", "desinteressado", { O: 1 }),
  pair(44, "originalidade", "original", "padronizado", { O: 1 }),
  pair(45, "originalidade", "imaginativo", "literal", { O: 1 }),
  pair(46, "originalidade", "inventivo", "rotineiro", { O: 1, C: -0.3 }),

  // === SOCIABILIDADE (5 pares) ===
  pair(47, "sociabilidade", "sociável", "reservado", { E: 1 }),
  pair(48, "sociabilidade", "comunicativo", "silencioso", { E: 1 }),
  pair(49, "sociabilidade", "caloroso", "distante", { E: 0.5, A: 0.7 }),
  pair(50, "sociabilidade", "extrovertido", "introvertido", { E: 1 }),
  pair(51, "sociabilidade", "amistoso", "hostil", { A: 1, E: 0.3 }),

  // === ALTRUÍSMO (5 pares) ===
  pair(52, "altruismo", "generoso", "egoísta", { A: 1 }),
  pair(53, "altruismo", "empático", "insensível", { A: 1 }),
  pair(54, "altruismo", "prestativo", "indiferente", { A: 1 }),
  pair(55, "altruismo", "dedicado", "negligente", { A: 0.7, C: 0.5 }),
  pair(56, "altruismo", "honesto", "desonesto", { A: 1, C: 0.5 }),

  // === DEPENDÊNCIA (4 pares) ===
  pair(57, "dependencia", "conciliador", "conflituoso", { A: 1 }),
  pair(58, "dependencia", "modesto", "presunçoso", { A: 0.7 }),
  pair(59, "dependencia", "discreto", "exibido", { E: -0.5, A: 0.3 }),
  pair(60, "dependencia", "complacente", "exigente", { A: 0.7 }),
];

/** Lista plana de todos os 120 itens. */
export const ITEMS: LabelItem[] = PAIRS.flat();

/** Validação: cada dimensão tem pelo menos 4 itens (2 pares). */
export function validateBalance(): Record<Dimension, number> {
  const counts: Record<string, number> = {};
  for (const it of ITEMS) {
    counts[it.dimension] = (counts[it.dimension] || 0) + 1;
  }
  return counts as Record<Dimension, number>;
}
