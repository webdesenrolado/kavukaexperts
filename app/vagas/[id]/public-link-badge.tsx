"use client";

import { useState } from "react";
import { Globe, Check, Copy } from "lucide-react";

export function PublicLinkBadge({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/carreiras/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 hover:opacity-80"
      style={{ background: "rgba(14,165,233,0.15)", color: "#0ea5e9" }}
      title="Clique para copiar o link público da vaga"
    >
      <Globe size={10} />
      Pública
      {copied ? <Check size={9} /> : <Copy size={9} className="opacity-60" />}
    </button>
  );
}
