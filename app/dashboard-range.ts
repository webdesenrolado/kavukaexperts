/**
 * Tipo e helpers da janela temporal do dashboard.
 * Arquivo neutro (sem "use client") — pode ser importado por server e client components.
 */

export type Range = "7d" | "30d" | "90d" | "180d" | "all";

export const RANGE_LABEL: Record<Range, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "3 meses",
  "180d": "6 meses",
  all: "Todo o tempo",
};

export const RANGE_DAYS: Record<Range, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  all: null,
};

export const RANGE_ORDER: Range[] = ["7d", "30d", "90d", "180d", "all"];

export function parseRange(value: string | undefined | null): Range {
  if (value === "7d" || value === "30d" || value === "90d" || value === "180d" || value === "all") {
    return value;
  }
  return "30d";
}
