"use client";

import { Printer } from "lucide-react";

export function PrintKyidButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs"
    >
      <Printer size={12} />
      Baixar PDF
    </button>
  );
}
