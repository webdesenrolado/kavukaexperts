/**
 * Registry of available assessment microservices, mapping slug → apply fn.
 * New instruments are registered here as they come online.
 */

import {
  applyIpipNeo120,
  INSTRUMENT_SLUG as IPIP_SLUG,
  INSTRUMENT_VERSION as IPIP_VERSION,
} from "@/services/ipip-neo-120/src/index";
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
};

export function getInstrument(slug: string): InstrumentRegistration | null {
  return INSTRUMENTS[slug] ?? null;
}
