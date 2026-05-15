/**
 * Gerador de narrativa ICH (Identidade de Conhecimento e Habilidades).
 *
 * Template-based — combina dados do candidato + scores das avaliações em
 * uma narrativa de 2-3 parágrafos em PT-BR. Sem LLM (zero custo de inferência).
 *
 * Linguagem responsável (NR-1/LGPD): "tendência a", "perfil de", "sinalização".
 */

import type { SkillsIndexResult } from "./skills-index";
import type { BehavioralIndexResult } from "./behavioral-index";

export interface NarrativeInputs {
  name: string;
  currentRole: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  city: string | null;
  state: string | null;
  summary: string | null;
  skills: SkillsIndexResult;
  behavioral: BehavioralIndexResult;
  experiencesCount: number;
  educationsCount: number;
  languagesCount: number;
}

export interface ICHNarrative {
  /** Headline (1 frase) */
  headline: string;
  /** 2-4 parágrafos */
  paragraphs: string[];
  /** Hashtags pra sumarizar */
  tags: string[];
}

const EDU_LABEL: Record<string, string> = {
  medio: "ensino médio",
  tecnico: "formação técnica",
  superior_incompleto: "superior em andamento",
  superior: "superior completo",
  pos: "pós-graduação",
  mestrado: "mestrado",
  doutorado: "doutorado",
};

function joinAnd(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1];
}

function bigFiveDescription(bf: NonNullable<BehavioralIndexResult["big_five"]>): string {
  // Identifica fatores acima da média (>3.5) e abaixo (<2.5)
  const high: string[] = [];
  const low: string[] = [];
  const map: Record<keyof typeof bf, string> = {
    O: "abertura à experiência",
    C: "organização",
    E: "extroversão",
    A: "afabilidade",
    S: "estabilidade emocional",
  };
  (Object.keys(bf) as (keyof typeof bf)[]).forEach((k) => {
    if (bf[k] >= 3.7) high.push(map[k]);
    else if (bf[k] <= 2.5) low.push(map[k]);
  });

  const parts: string[] = [];
  if (high.length > 0) parts.push(`destaque em ${joinAnd(high)}`);
  if (low.length > 0) parts.push(`reserva em ${joinAnd(low)}`);
  return parts.join(", ") || "perfil equilibrado nas cinco dimensões";
}

function discDescription(profile: string | null): string {
  if (!profile) return "";
  const map: Record<string, string> = {
    Executor:
      "perfil orientado a execução e resultado, decide rápido e age com autonomia",
    Estrategista:
      "combina análise rigorosa com poder de decisão; planeja antes de agir",
    Operador:
      "entrega com consistência e atenção a método, valoriza estabilidade",
    Influenciador:
      "energiza times pela comunicação e mobiliza pessoas em torno de causas",
  };
  return map[profile] || `perfil ${profile.toLowerCase()}`;
}

export function generateNarrative(input: NarrativeInputs): ICHNarrative {
  const { name, skills, behavioral } = input;
  const firstName = name.split(" ")[0];
  const paragraphs: string[] = [];
  const tags: string[] = [];

  // === Headline ===
  const eduTxt = input.educationLevel
    ? EDU_LABEL[input.educationLevel] || input.educationLevel
    : null;
  const expTxt =
    typeof input.yearsExperience === "number" && input.yearsExperience > 0
      ? `${input.yearsExperience}+ anos de experiência`
      : null;
  const headlineParts = [
    input.currentRole || "Profissional em construção",
    eduTxt,
    expTxt,
  ].filter(Boolean);
  const headline = headlineParts.join(" · ");

  // === Parágrafo 1: identidade profissional ===
  if (input.summary && input.summary.length > 30) {
    paragraphs.push(input.summary);
  } else {
    const p1Parts: string[] = [];
    p1Parts.push(`${firstName} é um(a) profissional`);
    if (input.currentRole) p1Parts.push(`atuando como ${input.currentRole}`);
    if (input.yearsExperience) p1Parts.push(`com cerca de ${input.yearsExperience} anos de experiência`);
    if (input.city && input.state) p1Parts.push(`baseado(a) em ${input.city}/${input.state}`);
    paragraphs.push(p1Parts.join(", ") + ".");
  }

  // === Parágrafo 2: habilidades ===
  if (skills.total > 0) {
    const topCats = Object.entries(skills.by_category)
      .sort(([, a], [, b]) => b.weighted - a.weighted)
      .slice(0, 3)
      .map(([k]) => k);
    const topSkills = skills.top.slice(0, 5).map((s) => s.skill);

    const p2 = [
      `Mantém um repertório de ${skills.total} habilidades cadastradas, com Índice de Habilidades ${skills.score}/100 (${skills.band}).`,
      topCats.length > 0
        ? `Áreas mais desenvolvidas: ${joinAnd(topCats)}.`
        : "",
      topSkills.length > 0
        ? `Entre as principais competências aparecem ${joinAnd(topSkills)}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    paragraphs.push(p2);

    tags.push(...topCats.slice(0, 2).map((c) => `#${c}`));
    tags.push(...topSkills.slice(0, 3).map((s) => `#${s.toLowerCase().replace(/\s+/g, "-")}`));
  }

  // === Parágrafo 3: perfil comportamental ===
  if (behavioral.instruments_count > 0) {
    const partes: string[] = [];
    partes.push(
      `O perfil comportamental foi medido por ${behavioral.instruments_count} ${
        behavioral.instruments_count === 1 ? "instrumento" : "instrumentos"
      } com Índice Comportamental ${behavioral.score}/100.`
    );
    if (behavioral.big_five) {
      partes.push(`Sinalização de ${bigFiveDescription(behavioral.big_five)}.`);
    }
    if (behavioral.disc_profile) {
      partes.push(`No DISC adaptado, ${discDescription(behavioral.disc_profile)}.`);
      tags.push(`#${behavioral.disc_profile.toLowerCase()}`);
    }
    if (behavioral.archetype) {
      const arq = behavioral.archetype;
      partes.push(
        `Arquétipo dominante: ${arq.dominant_label}, com sustentação do ${arq.secondary_label}.`
      );
      tags.push(`#${arq.dominant.replace(/_/g, "-")}`);
    }
    paragraphs.push(partes.join(" "));
  } else {
    paragraphs.push(
      "Avaliações comportamentais ainda não foram aplicadas. Complete LABEL, DISC e IPIP-NEO no portal pra construir o índice comportamental completo."
    );
  }

  // === Parágrafo 4: contexto/disclaimer ===
  paragraphs.push(
    "Esta ICH é um retrato consolidado de quem o(a) profissional é hoje, baseado em autodescrição e instrumentos validados. Os resultados são sinalizações, não diagnósticos clínicos, e podem ser revistos a qualquer momento (LGPD art. 20)."
  );

  return {
    headline,
    paragraphs,
    tags: [...new Set(tags)].slice(0, 8),
  };
}
