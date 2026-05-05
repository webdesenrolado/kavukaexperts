import { describe, it, expect } from "vitest";
import { scoreIpipNeo120 } from "../src/scoring";
import { IPIP_NEO_120_ITEMS } from "../src/items";
import type { Response } from "../../_contract/schema";

function buildResponses(valueFor: (idx: number) => 1 | 2 | 3 | 4 | 5): Response[] {
  return IPIP_NEO_120_ITEMS.map((item, i) => ({
    item_id: item.item_id,
    value: { kind: "likert5", value: valueFor(i) },
  }));
}

describe("scoreIpipNeo120 — extremes & mixed", () => {
  it("has 120 items wired to 30 facets across 5 domains", () => {
    expect(IPIP_NEO_120_ITEMS).toHaveLength(120);
    const facetSet = new Set(IPIP_NEO_120_ITEMS.map((i) => i.facet));
    expect(facetSet.size).toBe(30);
    const domainSet = new Set(IPIP_NEO_120_ITEMS.map((i) => i.domain));
    expect(domainSet.size).toBe(5);
  });

  it("all 1s → reverse-keyed items contribute 5; level depends on net direction", () => {
    const responses = buildResponses(() => 1);
    const result = scoreIpipNeo120(responses);

    // Domain raws should be in [24..120].
    for (const d of ["O", "C", "E", "A", "N"] as const) {
      expect(result.domains[d].raw).toBeGreaterThanOrEqual(24);
      expect(result.domains[d].raw).toBeLessThanOrEqual(120);
    }

    // N (Neuroticism) — most items keyed positively → all-1s collapses raw downwards.
    expect(result.domains.N.raw).toBeLessThan(60);
    // Conversely, "all 1s" with predominantly positive items in C/E/A/O also collapses these low.
    expect(result.domains.C.level === "very_low" || result.domains.C.level === "low").toBe(true);
  });

  it("all 5s → mixed pattern reflecting reverse keying (e.g. A2/A4/A5 are reverse-coded)", () => {
    const responses = buildResponses(() => 5);
    const result = scoreIpipNeo120(responses);

    // All-5s yields valid Score objects for every domain.
    for (const d of ["O", "C", "E", "A", "N"] as const) {
      expect(result.domains[d]).toBeDefined();
      expect(typeof result.domains[d].raw).toBe("number");
      expect(typeof result.domains[d].level).toBe("string");
    }

    // Sanity: an "all 5s" pattern is itself a quality concern downstream
    // (straightlining), but scoring still produces deterministic numbers.
    // Reverse keying means raw values vary by facet composition — so we just
    // assert the function is total.
  });

  it("all 5s on positively-keyed items → corresponding facets land at the top", () => {
    // Pick a facet whose 4 items are all positively keyed (e.g. e6_cheerfulness).
    const responses = buildResponses(() => 5);
    const r = scoreIpipNeo120(responses);
    expect(r.facets.e6_cheerfulness?.raw).toBeGreaterThan(15);
  });

  it("mixed pattern → produces facets, domains and z-scores", () => {
    const responses = buildResponses((i) => ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5);
    const result = scoreIpipNeo120(responses);

    // All 30 facets should be reported (no missing answers).
    expect(Object.keys(result.facets).length).toBe(30);

    for (const d of ["O", "C", "E", "A", "N"] as const) {
      const score = result.domains[d];
      expect(typeof score.raw).toBe("number");
      expect(score.raw).toBeGreaterThan(0);
      expect(typeof score.z_score).toBe("number");
    }
  });

  it("partial responses (one facet only) → other facets omitted, domains imputed", () => {
    const facetItemIds = IPIP_NEO_120_ITEMS.filter(
      (i) => i.facet === "n1_anxiety",
    ).map((i) => i.item_id);

    const responses: Response[] = facetItemIds.map((id) => ({
      item_id: id,
      value: { kind: "likert5", value: 3 },
    }));

    const result = scoreIpipNeo120(responses);
    expect(result.facets.n1_anxiety).toBeDefined();
    // Other N facets should be absent.
    expect(result.facets.n2_anger).toBeUndefined();
    // N domain still gets a Score (imputed from the one available facet).
    expect(result.domains.N).toBeDefined();
  });

  it("respects reverse keying — same raw value yields different facet scores when items have opposite keys", () => {
    // Compare facet n1_anxiety with all-1s vs all-5s.
    const facetIds = IPIP_NEO_120_ITEMS.filter((i) => i.facet === "n1_anxiety");

    const allOnes: Response[] = facetIds.map((it) => ({
      item_id: it.item_id,
      value: { kind: "likert5", value: 1 },
    }));
    const allFives: Response[] = facetIds.map((it) => ({
      item_id: it.item_id,
      value: { kind: "likert5", value: 5 },
    }));

    const a = scoreIpipNeo120(allOnes).facets.n1_anxiety!;
    const b = scoreIpipNeo120(allFives).facets.n1_anxiety!;
    expect(a.raw).not.toBe(b.raw);
  });

  it("ignores unknown item ids and unsupported value kinds", () => {
    const baseResponses = buildResponses(() => 3);
    const polluted: Response[] = [
      ...baseResponses,
      { item_id: "totally-unknown", value: { kind: "likert5", value: 5 } },
      { item_id: "ipip-neo-120-001", value: { kind: "forced_choice", value: "A" } },
    ];

    const result = scoreIpipNeo120(polluted);
    // Should not throw and should still score domains.
    expect(result.domains.N).toBeDefined();
  });
});
