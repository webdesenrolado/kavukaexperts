import { describe, it, expect } from "vitest";
import { buildInterpretation } from "../src/interpretation";
import { scoreIpipNeo120 } from "../src/scoring";
import { IPIP_NEO_120_ITEMS } from "../src/items";
import type { Response } from "../../_contract/schema";

const FORBIDDEN_TERMS = [
  "neurótico",
  "neurotico",
  "psicopata",
  "psicopático",
  "psicopatico",
  "transtorno",
  "doente",
  "patológico",
  "patologico",
];

function buildResponses(valueFor: (idx: number) => 1 | 2 | 3 | 4 | 5): Response[] {
  return IPIP_NEO_120_ITEMS.map((item, i) => ({
    item_id: item.item_id,
    value: { kind: "likert5", value: valueFor(i) },
  }));
}

describe("buildInterpretation — language, structure, confidence", () => {
  it("produces strengths, watchouts, narrative, and confidence on a mixed input", () => {
    const responses = buildResponses((i) => ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5);
    const scores = scoreIpipNeo120(responses);
    const interp = buildInterpretation({ scores });

    expect(Array.isArray(interp.strengths)).toBe(true);
    expect(Array.isArray(interp.watchouts)).toBe(true);
    expect(typeof interp.narrative).toBe("string");
    expect(interp.narrative.length).toBeGreaterThan(50);
    expect(["low", "medium", "high"]).toContain(interp.confidence);
  });

  it("never uses clinical/forbidden vocabulary in any output", () => {
    for (const v of [1, 3, 5] as const) {
      const responses = buildResponses(() => v);
      const scores = scoreIpipNeo120(responses);
      const interp = buildInterpretation({ scores });

      const haystacks = [
        interp.narrative,
        ...interp.strengths,
        ...interp.watchouts,
      ].map((s) => s.toLowerCase());

      for (const term of FORBIDDEN_TERMS) {
        for (const h of haystacks) {
          expect(h).not.toContain(term);
        }
      }
    }
  });

  it("downgrades confidence when quality flags are present", () => {
    const responses = buildResponses(() => 3);
    const scores = scoreIpipNeo120(responses);

    const high = buildInterpretation({ scores, qualityFlags: [] });
    const medium = buildInterpretation({ scores, qualityFlags: ["incomplete"] });
    const low = buildInterpretation({
      scores,
      qualityFlags: ["incomplete", "too_fast", "straightlining"],
    });

    expect(high.confidence).toBe("high");
    expect(medium.confidence).toBe("medium");
    expect(low.confidence).toBe("low");
  });

  it("watchouts on very_high N use 'sensibilidade ao ambiente' framing, not clinical terms", () => {
    // Construct a synthetic high-N profile by answering the N items high and reverse-keyed accordingly.
    const responses: Response[] = IPIP_NEO_120_ITEMS.map((it) => ({
      item_id: it.item_id,
      value: {
        kind: "likert5",
        value: it.domain === "N"
          ? (it.reverse_keyed ? 1 : 5)
          : 3,
      },
    }));

    const scores = scoreIpipNeo120(responses);
    const interp = buildInterpretation({ scores });

    // N raw must be near the top.
    expect(scores.domains.N.raw).toBeGreaterThan(100);

    const all = [interp.narrative, ...interp.strengths, ...interp.watchouts]
      .join(" ")
      .toLowerCase();

    expect(all).toContain("sensibilidade");
    for (const term of FORBIDDEN_TERMS) {
      expect(all).not.toContain(term);
    }
  });

  it("includes one sentence per Big Five domain in the narrative", () => {
    const responses = buildResponses((i) => ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5);
    const scores = scoreIpipNeo120(responses);
    const interp = buildInterpretation({ scores });

    const labels = [
      "Abertura a Experiências",
      "Conscienciosidade",
      "Extroversão",
      "Amabilidade",
      "Estabilidade Emocional",
    ];
    for (const label of labels) {
      expect(interp.narrative).toContain(label);
    }
  });
});
