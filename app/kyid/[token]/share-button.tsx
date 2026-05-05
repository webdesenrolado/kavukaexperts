"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export function KyidShareButton({ candidateName }: { candidateName: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `KYID de ${candidateName}`,
          text: "Minha identidade comportamental Kavuka",
          url,
        });
        return;
      } catch {
        // fallthrough para copiar
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs"
    >
      {copied ? <Check size={12} className="text-[#10b981]" /> : <Share2 size={12} />}
      {copied ? "Copiado" : "Compartilhar"}
    </button>
  );
}
