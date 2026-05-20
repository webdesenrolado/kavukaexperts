/**
 * Arquétipos — 36 itens autorais em PT-BR, 3 por arquétipo.
 *
 * Base teórica: 12 arquétipos jungianos clássicos (domínio público,
 * Jung 1875-1961 + popularização posterior por Pearson/Mark).
 *
 * Itens são SELECIONADOS POR NÓS — não reproduzem listas comerciais
 * (Brand Archetypes, Hero's Journey, etc).
 *
 * Likert 1-5 (1 = não me descreve, 5 = me descreve totalmente).
 * Score por arquétipo = média dos 3 itens, normalizado pra 0-100.
 */

export type Archetype =
  | "inocente"
  | "sabio"
  | "explorador"
  | "rebelde"
  | "mago"
  | "heroi"
  | "amante"
  | "bobo"
  | "cuidador"
  | "criador"
  | "governante"
  | "pessoa_comum";

export const ARCHETYPES: Archetype[] = [
  "inocente",
  "sabio",
  "explorador",
  "rebelde",
  "mago",
  "heroi",
  "amante",
  "bobo",
  "cuidador",
  "criador",
  "governante",
  "pessoa_comum",
];

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  inocente: "Inocente",
  sabio: "Sábio",
  explorador: "Explorador",
  rebelde: "Rebelde",
  mago: "Mago",
  heroi: "Herói",
  amante: "Amante",
  bobo: "O Curinga",
  cuidador: "Cuidador",
  criador: "Criador",
  governante: "Governante",
  pessoa_comum: "Pessoa Comum",
};

export interface ArchetypeItem {
  id: string;
  archetype: Archetype;
  text_pt: string;
}

/** 36 itens — 3 por arquétipo. */
export const ITEMS: ArchetypeItem[] = [
  // INOCENTE — otimismo, fé, simplicidade
  { id: "ar01", archetype: "inocente", text_pt: "Costumo acreditar que as coisas tendem a dar certo." },
  { id: "ar02", archetype: "inocente", text_pt: "Prefiro caminhos simples a soluções rebuscadas." },
  { id: "ar03", archetype: "inocente", text_pt: "Mantenho minha boa-fé mesmo quando outros desconfiam." },

  // SÁBIO — verdade, conhecimento, análise
  { id: "ar04", archetype: "sabio", text_pt: "Busco entender as coisas a fundo antes de opinar." },
  { id: "ar05", archetype: "sabio", text_pt: "Aprender continuamente é uma necessidade pra mim." },
  { id: "ar06", archetype: "sabio", text_pt: "Antes de decidir, gosto de pesar todos os ângulos." },

  // EXPLORADOR — liberdade, descoberta
  { id: "ar07", archetype: "explorador", text_pt: "Me sinto inquieto quando fico muito tempo no mesmo lugar." },
  { id: "ar08", archetype: "explorador", text_pt: "Topo provar coisas novas mesmo sem garantia de gostar." },
  { id: "ar09", archetype: "explorador", text_pt: "Liberdade vale mais do que segurança pra mim." },

  // REBELDE — quebra de regras, contestação
  { id: "ar10", archetype: "rebelde", text_pt: "Questiono regras que considero injustas, mesmo correndo risco." },
  { id: "ar11", archetype: "rebelde", text_pt: "Tenho menos paciência com tradição do que a média." },
  { id: "ar12", archetype: "rebelde", text_pt: "Prefiro provocar mudança a manter as coisas como estão." },

  // MAGO — transformação, visão
  { id: "ar13", archetype: "mago", text_pt: "Vejo conexões entre ideias que outros não percebem." },
  { id: "ar14", archetype: "mago", text_pt: "Acredito que posso transformar realidades complexas." },
  { id: "ar15", archetype: "mago", text_pt: "Gosto de criar processos que multiplicam resultados." },

  // HERÓI — coragem, conquista
  { id: "ar16", archetype: "heroi", text_pt: "Me energizo diante de desafios difíceis." },
  { id: "ar17", archetype: "heroi", text_pt: "Tenho coragem de assumir riscos por algo que vale a pena." },
  { id: "ar18", archetype: "heroi", text_pt: "Quando algo precisa ser feito, costumo ser o primeiro a agir." },

  // AMANTE — paixão, conexão, estética
  { id: "ar19", archetype: "amante", text_pt: "Valorizo profundamente as conexões com as pessoas próximas." },
  { id: "ar20", archetype: "amante", text_pt: "Beleza e estética têm peso real nas minhas decisões." },
  { id: "ar21", archetype: "amante", text_pt: "Coloco emoção em tudo que faço com vontade." },

  // BOBO DA CORTE — humor, espontaneidade
  { id: "ar22", archetype: "bobo", text_pt: "Costumo usar humor pra desarmar tensões." },
  { id: "ar23", archetype: "bobo", text_pt: "Levo a vida com mais leveza do que a maioria das pessoas." },
  { id: "ar24", archetype: "bobo", text_pt: "Gosto de criar momentos divertidos onde estou." },

  // CUIDADOR — compaixão, proteção
  { id: "ar25", archetype: "cuidador", text_pt: "Me sinto realizado quando ajudo alguém com algo importante." },
  { id: "ar26", archetype: "cuidador", text_pt: "Tendo a colocar as necessidades dos outros antes das minhas." },
  { id: "ar27", archetype: "cuidador", text_pt: "Costumo perceber quando alguém ao meu lado está mal." },

  // CRIADOR — criatividade, expressão
  { id: "ar28", archetype: "criador", text_pt: "Tenho a necessidade frequente de criar coisas novas." },
  { id: "ar29", archetype: "criador", text_pt: "Sinto-me incompleto quando passo muito tempo sem expressar uma ideia." },
  { id: "ar30", archetype: "criador", text_pt: "Costumo ver possibilidades de melhoria no que está pronto." },

  // GOVERNANTE — controle, ordem
  { id: "ar31", archetype: "governante", text_pt: "Gosto de estar no controle das decisões que me afetam." },
  { id: "ar32", archetype: "governante", text_pt: "Estabeleço padrões e cobro que sejam mantidos." },
  { id: "ar33", archetype: "governante", text_pt: "Penso a longo prazo, organizando estrutura e governança." },

  // PESSOA COMUM — pertencimento, autenticidade
  { id: "ar34", archetype: "pessoa_comum", text_pt: "Valorizo me sentir parte de um grupo, não acima dele." },
  { id: "ar35", archetype: "pessoa_comum", text_pt: "Sou desconfortável com tratamento de privilégio." },
  { id: "ar36", archetype: "pessoa_comum", text_pt: "Confio em quem é genuíno mais do que em quem é brilhante." },
];

export function validateBalance(): Record<Archetype, number> {
  const counts = {} as Record<Archetype, number>;
  for (const a of ARCHETYPES) counts[a] = 0;
  for (const it of ITEMS) counts[it.archetype]++;
  return counts;
}
