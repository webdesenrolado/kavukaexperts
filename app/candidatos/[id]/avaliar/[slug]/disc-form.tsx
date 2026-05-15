"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { DiscBlock } from "@/services/disc-adapted/src/items";
import { IntroScreen } from "./intro-screen";

interface DiscFormProps {
  candidateId: string;
  candidateName: string;
  blocks: DiscBlock[];
  endpoint?: string;
  redirectTo?: string;
}

type Pick = "most" | "least";

export function DiscForm({ candidateId, candidateName, blocks, endpoint, redirectTo }: DiscFormProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "form">("intro");
  const startedAtRef = useRef<number>(0);
  const [picks, setPicks] = useState<Record<string, { most?: string; least?: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function start() {
    setPhase("form");
    startedAtRef.current = Date.now();
  }

  const total = blocks.length;
  const completed = Object.values(picks).filter((p) => p.most && p.least).length;
  const progress = (completed / total) * 100;
  const allDone = completed === total;

  const firstUnfinished = useMemo(
    () => blocks.findIndex((b) => !picks[b.id]?.most || !picks[b.id]?.least),
    [blocks, picks]
  );

  useEffect(() => {
    function before(e: BeforeUnloadEvent) {
      if (phase === "form" && completed > 0 && !allDone) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [phase, completed, allDone]);

  if (phase === "intro") {
    return (
      <IntroScreen
        candidateId={candidateId}
        candidateName={candidateName}
        instrumentName="DISC adaptado · perfil comportamental"
        itemsLabel="24 blocos com 4 alternativas cada"
        durationLabel="10-15 minutos"
        description="Em cada bloco você escolhe a frase que MAIS te descreve e a que MENOS te descreve."
        onStart={start}
      />
    );
  }

  function setPick(blockId: string, pick: Pick, letter: string) {
    setPicks((prev) => {
      const cur = prev[blockId] || {};
      const next = { ...cur, [pick]: letter };
      // Se o "most" e "least" forem o mesmo, limpa o outro
      if (next.most && next.least && next.most === next.least) {
        if (pick === "most") next.least = undefined;
        else next.most = undefined;
      }
      return { ...prev, [blockId]: next };
    });
  }

  async function submit() {
    if (!allDone) return;
    setSubmitting(true);
    setError("");
    try {
      const completionTime = Math.round((Date.now() - startedAtRef.current) / 1000);
      const responses = blocks.flatMap((b) => {
        const p = picks[b.id];
        return [
          { item_id: `${b.id}-MOST`, value: p.most! },
          { item_id: `${b.id}-LEAST`, value: p.least! },
        ];
      });
      const url = endpoint || "/api/instruments/disc-adapted/apply";
      const body: any = {
        responses,
        channel: "web",
        language: "pt-BR",
        completionTimeSeconds: completionTime,
      };
      if (!endpoint) body.candidateId = candidateId;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Falha ao salvar avaliação");
        return;
      }
      router.push(redirectTo || `/candidatos/${candidateId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--background)" }}>
      {/* Progress sticky */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.6)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <Link
              href={`/candidatos/${candidateId}`}
              className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
            >
              <ArrowLeft size={12} /> {candidateName}
            </Link>
            <div className="text-xs opacity-70">
              <span className="font-mono">{completed}/{total}</span> blocos
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ff6a00, #ffcc00)" }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-1">DISC adaptado · perfil comportamental</h1>
        <p className="text-sm opacity-80 mb-6">
          Em cada bloco, escolha qual frase <strong>MAIS</strong> te descreve e qual{" "}
          <strong>MENOS</strong> te descreve. Não há respostas certas ou erradas — vá com a primeira impressão.
        </p>

        <div className="space-y-5">
          {blocks.map((block, idx) => {
            const p = picks[block.id] || {};
            return (
              <section
                key={block.id}
                id={`block-${block.id}`}
                className="border rounded-xl p-4"
                style={{
                  borderColor:
                    firstUnfinished === idx ? "rgba(255,106,0,0.5)" : "var(--border)",
                  background: "var(--card)",
                }}
              >
                <div className="flex items-center justify-between mb-3 text-xs opacity-60">
                  <span>
                    Bloco {idx + 1} de {blocks.length}
                  </span>
                  {p.most && p.least && (
                    <span className="text-[#10b981]">✓ completo</span>
                  )}
                </div>
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-1.5 sm:gap-x-2 gap-y-2 items-center">
                  <div></div>
                  <div></div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60 text-center w-12 sm:w-16">MAIS</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60 text-center w-12 sm:w-16">MENOS</div>

                  {block.items.map((item) => {
                    const isMost = p.most === item.letter;
                    const isLeast = p.least === item.letter;
                    return (
                      <div
                        key={item.letter}
                        className="contents"
                      >
                        <span className="text-xs opacity-50 font-mono w-4 sm:w-5 text-center">
                          {item.letter.toUpperCase()}
                        </span>
                        <p className="text-sm leading-snug py-1">{item.text_pt}</p>
                        <div className="flex justify-center w-12 sm:w-16">
                          <button
                            type="button"
                            onClick={() => setPick(block.id, "most", item.letter)}
                            className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                              isMost
                                ? "border-[#10b981] bg-[#10b981]"
                                : "border-white/20 hover:border-[#10b981]/60"
                            }`}
                            aria-label={`Mais: ${item.text_pt}`}
                          >
                            {isMost && <span className="text-black text-sm font-bold">✓</span>}
                          </button>
                        </div>
                        <div className="flex justify-center w-12 sm:w-16">
                          <button
                            type="button"
                            onClick={() => setPick(block.id, "least", item.letter)}
                            className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                              isLeast
                                ? "border-[#ef4444] bg-[#ef4444]"
                                : "border-white/20 hover:border-[#ef4444]/60"
                            }`}
                            aria-label={`Menos: ${item.text_pt}`}
                          >
                            {isLeast && <span className="text-white text-sm font-bold">×</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="mt-6 sticky bottom-4">
          <button
            type="button"
            onClick={submit}
            disabled={!allDone || submitting}
            className="w-full py-3 rounded-lg font-bold text-black disabled:opacity-50 text-base shadow-xl"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Calculando perfil...
              </span>
            ) : !allDone ? (
              `Faltam ${total - completed} bloco${total - completed === 1 ? "" : "s"}`
            ) : (
              "Calcular perfil DISC"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
