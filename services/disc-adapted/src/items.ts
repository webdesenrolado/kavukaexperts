/**
 * DISC adaptado GUÉP — 24 blocos forçada-escolha (96 itens autorais).
 *
 * Formato: candidato lê 4 alternativas e escolhe a que MAIS o descreve
 * e a que MENOS o descreve. Cada alternativa pertence a uma das 4
 * dimensões (D/I/S/C). Distribuição balanceada: 24 itens por dimensão.
 *
 * Itens são AUTORAIS (criados pra Kavuka Experts). Não reproduzem itens
 * comerciais (Wiley DiSC, Everything DiSC, PI etc).
 *
 * Base teórica: Marston (1928) — Emotions of Normal People.
 */

export type Dimension = "D" | "I" | "S" | "C";

export interface DiscItem {
  /** Alfabético dentro do bloco (a/b/c/d) */
  letter: "a" | "b" | "c" | "d";
  /** Dimensão DISC à qual o item pertence */
  dimension: Dimension;
  /** Texto em PT-BR */
  text_pt: string;
}

export interface DiscBlock {
  /** ID estável do bloco (B01..B24) */
  id: string;
  items: DiscItem[];
}

export const BLOCKS: DiscBlock[] = [
  {
    id: "B01",
    items: [
      { letter: "a", dimension: "D", text_pt: "Direto e objetivo nas decisões" },
      { letter: "b", dimension: "I", text_pt: "Animado e expressivo nas conversas" },
      { letter: "c", dimension: "S", text_pt: "Paciente e atencioso com o ritmo dos outros" },
      { letter: "d", dimension: "C", text_pt: "Preciso e cuidadoso com detalhes" },
    ],
  },
  {
    id: "B02",
    items: [
      { letter: "a", dimension: "I", text_pt: "Otimista com novos cenários" },
      { letter: "b", dimension: "C", text_pt: "Analítico ao avaliar opções" },
      { letter: "c", dimension: "D", text_pt: "Competitivo em situações de desafio" },
      { letter: "d", dimension: "S", text_pt: "Calmo sob pressão" },
    ],
  },
  {
    id: "B03",
    items: [
      { letter: "a", dimension: "S", text_pt: "Leal aos colegas e ao grupo" },
      { letter: "b", dimension: "D", text_pt: "Tomo iniciativa antes dos outros" },
      { letter: "c", dimension: "C", text_pt: "Sigo procedimentos com rigor" },
      { letter: "d", dimension: "I", text_pt: "Sociável em ambientes novos" },
    ],
  },
  {
    id: "B04",
    items: [
      { letter: "a", dimension: "C", text_pt: "Avalio riscos antes de agir" },
      { letter: "b", dimension: "S", text_pt: "Mantenho rotinas previsíveis" },
      { letter: "c", dimension: "I", text_pt: "Persuado pela energia e entusiasmo" },
      { letter: "d", dimension: "D", text_pt: "Foco em resultado acima de processo" },
    ],
  },
  {
    id: "B05",
    items: [
      { letter: "a", dimension: "D", text_pt: "Assumo o comando quando preciso" },
      { letter: "b", dimension: "C", text_pt: "Questiono o que parece inconsistente" },
      { letter: "c", dimension: "I", text_pt: "Inspiro pessoas com ideias" },
      { letter: "d", dimension: "S", text_pt: "Concilio diferenças entre pessoas" },
    ],
  },
  {
    id: "B06",
    items: [
      { letter: "a", dimension: "I", text_pt: "Falo com facilidade em público" },
      { letter: "b", dimension: "S", text_pt: "Escuto antes de opinar" },
      { letter: "c", dimension: "D", text_pt: "Pressiono por decisões rápidas" },
      { letter: "d", dimension: "C", text_pt: "Documento o que faço" },
    ],
  },
  {
    id: "B07",
    items: [
      { letter: "a", dimension: "S", text_pt: "Coopero com tarefas de outros" },
      { letter: "b", dimension: "I", text_pt: "Crio relações com facilidade" },
      { letter: "c", dimension: "C", text_pt: "Verifico antes de entregar" },
      { letter: "d", dimension: "D", text_pt: "Assumo riscos calculados" },
    ],
  },
  {
    id: "B08",
    items: [
      { letter: "a", dimension: "C", text_pt: "Prefiro fatos a impressões" },
      { letter: "b", dimension: "D", text_pt: "Insisto até atingir o objetivo" },
      { letter: "c", dimension: "S", text_pt: "Mantenho a calma em conflitos" },
      { letter: "d", dimension: "I", text_pt: "Empolgo pessoas com causas" },
    ],
  },
  {
    id: "B09",
    items: [
      { letter: "a", dimension: "D", text_pt: "Confronto problemas de frente" },
      { letter: "b", dimension: "I", text_pt: "Trago bom humor pro ambiente" },
      { letter: "c", dimension: "S", text_pt: "Gosto de previsibilidade" },
      { letter: "d", dimension: "C", text_pt: "Busco padrões e regras claras" },
    ],
  },
  {
    id: "B10",
    items: [
      { letter: "a", dimension: "I", text_pt: "Entusiasta com mudanças" },
      { letter: "b", dimension: "C", text_pt: "Detalhista em entregas" },
      { letter: "c", dimension: "D", text_pt: "Independente nas decisões" },
      { letter: "d", dimension: "S", text_pt: "Estável no comportamento" },
    ],
  },
  {
    id: "B11",
    items: [
      { letter: "a", dimension: "S", text_pt: "Preocupado com bem-estar do grupo" },
      { letter: "b", dimension: "D", text_pt: "Decidido sob restrição de tempo" },
      { letter: "c", dimension: "C", text_pt: "Sigo o método correto" },
      { letter: "d", dimension: "I", text_pt: "Alegre e expansivo" },
    ],
  },
  {
    id: "B12",
    items: [
      { letter: "a", dimension: "C", text_pt: "Reservado até confiar no contexto" },
      { letter: "b", dimension: "I", text_pt: "Convicto ao defender ideias" },
      { letter: "c", dimension: "S", text_pt: "Tolerante a ritmos diferentes" },
      { letter: "d", dimension: "D", text_pt: "Direto pra apontar problemas" },
    ],
  },
  {
    id: "B13",
    items: [
      { letter: "a", dimension: "D", text_pt: "Audacioso em movimentos novos" },
      { letter: "b", dimension: "C", text_pt: "Conservador em riscos altos" },
      { letter: "c", dimension: "I", text_pt: "Espontâneo em interações" },
      { letter: "d", dimension: "S", text_pt: "Constante mesmo em crise" },
    ],
  },
  {
    id: "B14",
    items: [
      { letter: "a", dimension: "S", text_pt: "Empático com dificuldades alheias" },
      { letter: "b", dimension: "C", text_pt: "Crítico construtivo de ideias" },
      { letter: "c", dimension: "D", text_pt: "Determinado mesmo contrariado" },
      { letter: "d", dimension: "I", text_pt: "Otimista por natureza" },
    ],
  },
  {
    id: "B15",
    items: [
      { letter: "a", dimension: "I", text_pt: "Carismático ao apresentar ideias" },
      { letter: "b", dimension: "D", text_pt: "Pragmático ao lidar com obstáculos" },
      { letter: "c", dimension: "C", text_pt: "Cauteloso ao formar opinião" },
      { letter: "d", dimension: "S", text_pt: "Disposto a apoiar quem precisa" },
    ],
  },
  {
    id: "B16",
    items: [
      { letter: "a", dimension: "C", text_pt: "Organizado com prazos e listas" },
      { letter: "b", dimension: "S", text_pt: "Diplomático em desacordos" },
      { letter: "c", dimension: "I", text_pt: "Espiritualmente animado" },
      { letter: "d", dimension: "D", text_pt: "Energético na execução" },
    ],
  },
  {
    id: "B17",
    items: [
      { letter: "a", dimension: "D", text_pt: "Combativo quando contestado" },
      { letter: "b", dimension: "I", text_pt: "Influente em redes pessoais" },
      { letter: "c", dimension: "S", text_pt: "Confiável e previsível" },
      { letter: "d", dimension: "C", text_pt: "Lógico e estruturado" },
    ],
  },
  {
    id: "B18",
    items: [
      { letter: "a", dimension: "S", text_pt: "Modesto ao receber elogios" },
      { letter: "b", dimension: "I", text_pt: "Comunicativo em qualquer grupo" },
      { letter: "c", dimension: "D", text_pt: "Ousado pra propor caminhos novos" },
      { letter: "d", dimension: "C", text_pt: "Disciplinado com horários e rotina" },
    ],
  },
  {
    id: "B19",
    items: [
      { letter: "a", dimension: "I", text_pt: "Aberto a fazer amigos no trabalho" },
      { letter: "b", dimension: "C", text_pt: "Cuidadoso com tudo que assino" },
      { letter: "c", dimension: "D", text_pt: "Inquieto com ritmo lento" },
      { letter: "d", dimension: "S", text_pt: "Acolhedor e receptivo" },
    ],
  },
  {
    id: "B20",
    items: [
      { letter: "a", dimension: "C", text_pt: "Tradicional nas escolhas profissionais" },
      { letter: "b", dimension: "D", text_pt: "Aventureiro em territórios novos" },
      { letter: "c", dimension: "I", text_pt: "Liderança pelo carisma" },
      { letter: "d", dimension: "S", text_pt: "Liderança pelo exemplo" },
    ],
  },
  {
    id: "B21",
    items: [
      { letter: "a", dimension: "D", text_pt: "Resoluto e firme em negociações" },
      { letter: "b", dimension: "S", text_pt: "Acomodado com ambiente colaborativo" },
      { letter: "c", dimension: "C", text_pt: "Crítico ao ler dados" },
      { letter: "d", dimension: "I", text_pt: "Aberto a improvisar" },
    ],
  },
  {
    id: "B22",
    items: [
      { letter: "a", dimension: "S", text_pt: "Servidor nas equipes" },
      { letter: "b", dimension: "C", text_pt: "Perfeccionista quando necessário" },
      { letter: "c", dimension: "D", text_pt: "Resistente diante de adversidade" },
      { letter: "d", dimension: "I", text_pt: "Caloroso ao receber pessoas" },
    ],
  },
  {
    id: "B23",
    items: [
      { letter: "a", dimension: "I", text_pt: "Vibrante em apresentações" },
      { letter: "b", dimension: "S", text_pt: "Tranquilo em decisões importantes" },
      { letter: "c", dimension: "D", text_pt: "Insistente até resolver" },
      { letter: "d", dimension: "C", text_pt: "Sistemático em cada passo" },
    ],
  },
  {
    id: "B24",
    items: [
      { letter: "a", dimension: "C", text_pt: "Reflexivo antes de comprometer" },
      { letter: "b", dimension: "I", text_pt: "Persuasivo no informal" },
      { letter: "c", dimension: "S", text_pt: "Comprometido a longo prazo" },
      { letter: "d", dimension: "D", text_pt: "Independente de aprovações" },
    ],
  },
];

export const DIMENSIONS: Dimension[] = ["D", "I", "S", "C"];

/** Validação de balanceamento — cada dimensão deve aparecer 24x. */
export function validateBalance() {
  const counts: Record<Dimension, number> = { D: 0, I: 0, S: 0, C: 0 };
  for (const block of BLOCKS) {
    for (const item of block.items) counts[item.dimension]++;
  }
  return counts;
}
