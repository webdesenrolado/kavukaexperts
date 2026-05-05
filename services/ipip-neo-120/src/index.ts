/**
 * Public surface of the IPIP-NEO-120 microservice.
 *
 * Consumers (currently the Kavuka Experts central platform) should import
 * exclusively from this entry point.
 */

export {
  applyIpipNeo120,
  INSTRUMENT_SLUG,
  INSTRUMENT_VERSION,
} from "./apply";

export {
  scoreIpipNeo120,
  levelFromZ,
  type IpipScores,
} from "./scoring";

export {
  buildInterpretation,
} from "./interpretation";

export {
  IPIP_NEO_120_ITEMS,
  ITEMS_BY_ID,
  FACETS,
  DOMAINS,
  FACET_TO_DOMAIN,
  type IpipDomain,
  type IpipFacet,
  type IpipItem,
} from "./items";

export {
  ipipScoresSchema,
  ipipApplicationResultSchema,
  type IpipScoresPayload,
  type IpipApplicationResult,
} from "./schema";

export {
  DOMAIN_NORMS,
  FACET_NORMS,
  type NormStats,
} from "./norms";
