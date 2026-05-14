/**
 * Registry of available assessment microservices, mapping slug → apply fn.
 * New instruments are registered here as they come online.
 */

import {
  applyIpipNeo120,
  INSTRUMENT_SLUG as IPIP_SLUG,
  INSTRUMENT_VERSION as IPIP_VERSION,
} from "@/services/ipip-neo-120/src/index";
import {
  applyDiscAdapted,
  INSTRUMENT_SLUG as DISC_SLUG,
  INSTRUMENT_VERSION as DISC_VERSION,
} from "@/services/disc-adapted/src/index";
import {
  applyLabelAdapted,
  INSTRUMENT_SLUG as LABEL_SLUG,
  INSTRUMENT_VERSION as LABEL_VERSION,
} from "@/services/label-adapted/src/index";
import {
  applyArquetipos,
  INSTRUMENT_SLUG as ARQ_SLUG,
  INSTRUMENT_VERSION as ARQ_VERSION,
} from "@/services/arquetipos/src/index";
import type { ApplyInput } from "@/services/_contract/schema";
import type { ApplicationResult } from "@/services/_contract/schema";

export type InstrumentApplyFn = (input: ApplyInput) => ApplicationResult;

interface InstrumentRegistration {
  slug: string;
  version: string;
  apply: InstrumentApplyFn;
}

export const INSTRUMENTS: Record<string, InstrumentRegistration> = {
  [IPIP_SLUG]: {
    slug: IPIP_SLUG,
    version: IPIP_VERSION,
    apply: applyIpipNeo120 as InstrumentApplyFn,
  },
  [DISC_SLUG]: {
    slug: DISC_SLUG,
    version: DISC_VERSION,
    apply: applyDiscAdapted as InstrumentApplyFn,
  },
  [LABEL_SLUG]: {
    slug: LABEL_SLUG,
    version: LABEL_VERSION,
    apply: applyLabelAdapted as InstrumentApplyFn,
  },
  [ARQ_SLUG]: {
    slug: ARQ_SLUG,
    version: ARQ_VERSION,
    apply: applyArquetipos as InstrumentApplyFn,
  },
};

export function getInstrument(slug: string): InstrumentRegistration | null {
  return INSTRUMENTS[slug] ?? null;
}

/** Catálogo público pra UI mostrar (descrição, duração, etc) */
export interface InstrumentMeta {
  slug: string;
  name: string;
  short: string;
  duration: string;
  items: string;
  color: string;
  /** Se candidato pode acessar diretamente do portal */
  candidate_facing: boolean;
}

export const INSTRUMENT_CATALOG: InstrumentMeta[] = [
  {
    slug: "label-adapted",
    name: "LABEL · perfil por adjetivos",
    short: "Você avalia 120 adjetivos em escala 1-5. Gera radar de 13 dimensões + Big Five.",
    duration: "15-20 min",
    items: "120 adjetivos",
    color: "#ff6a00",
    candidate_facing: true,
  },
  {
    slug: "disc-adapted",
    name: "DISC · perfil comportamental",
    short: "24 blocos forçada-escolha. Define seu perfil em 4 dimensões (D/I/S/C) e arquétipo profissional.",
    duration: "10-15 min",
    items: "24 blocos",
    color: "#0ea5e9",
    candidate_facing: true,
  },
  {
    slug: "arquetipos",
    name: "Arquétipos · 12 tipos jungianos",
    short: "36 afirmações que mapeiam seu arquétipo dominante: Herói, Sábio, Criador, Cuidador, etc.",
    duration: "5-10 min",
    items: "36 afirmações",
    color: "#a855f7",
    candidate_facing: true,
  },
  {
    slug: "ipip-neo-120",
    name: "IPIP-NEO-120 · Big Five completo",
    short: "120 afirmações que mapeiam 5 grandes traços de personalidade e 30 facetas.",
    duration: "20-25 min",
    items: "120 afirmações",
    color: "#10b981",
    candidate_facing: true,
  },
];
