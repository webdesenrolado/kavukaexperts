"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type Range = "7d" | "30d" | "90d" | "180d" | "all";

export const RANGE_LABEL: Record<Range, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "3 meses",
  "180d": "6 meses",
  all: "Todo o tempo",
};

const ORDER: Range[] = ["7d", "30d", "90d", "180d", "all"];

export function DashboardRangeSelector({ current }: { current: Range }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function pick(r: Range) {
    const params = new URLSearchParams(searchParams);
    if (r === "30d") params.delete("range");
    else params.set("range", r);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div
      className="inline-flex rounded-lg border overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      {ORDER.map((r) => {
        const active = r === current;
        return (
          <button
            key={r}
            onClick={() => pick(r)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "text-black"
                : "opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            style={{
              background: active
                ? "linear-gradient(135deg, #ff6a00, #ffcc00)"
                : "transparent",
            }}
          >
            {RANGE_LABEL[r]}
          </button>
        );
      })}
    </div>
  );
}
