"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ArchetypeItem } from "@/services/arquetipos/src/items";
import { IntroScreen } from "./intro-screen";

interface Props {
  candidateId: string;
  candidateName: string;
  items: ArchetypeItem[];
  /** Endpoint custom. Default: recrutador. Portal: /api/portal/me/instruments/arquetipos/apply */
  endpoint?: string;
  /** Pra onde redirecionar após submit */
  redirectTo?: string;
}

const SCALE = [
  { value: 1, label: "Nada me descreve" },
  { value: 2, label: "Pouco" },
  { value: 3, label: "Mais ou menos" },
  { value: 4, label: "Bastante" },
  { value: 5, label: "Me descreve totalmente" },
];

export function ArquetiposForm({ candidateId, candidateName, items, endpoint, redirectTo }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "form">("intro");
  const startedAtRef = useRef<number>(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Shuffle determinístico por candidato pra reduzir viés posicional
  const shuffled = useMemo(() => {
    const arr = [...items];
    let seed = 0;
    for (const c of candidateId) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [items, candidateId]);

  const total = shuffled.length;
  const answered = Object.keys(responses).length;
  const progress = (answered / total) * 100;
  const allDone = answered === total;

  function start() {
    setPhase("form");
    startedAtRef.current = Date.now();
  }

  useEffect(() => {
    function before(e: BeforeUnloadEvent) {
      if (phase === "form" && answered > 0 && !allDone) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [phase, answered, allDone]);

  async function submit() {
    if (!allDone) return;
    setSubmitting(true);
    setError("");
    try {
      const completionTime = Math.round((Date.now() - startedAtRef.current) / 1000);
      const payload = items.map((it) => ({ item_id: it.id, value: responses[it.id] }));
      const url = endpoint || "/api/instruments/arquetipos/apply";
      const body: any = {
        responses: payload,
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

  if (phase === "intro") {
    return (
      <IntroScreen
        candidateId={candidateId}
        candidateName={candidateName}
        instrumentName="Arquétipos · 12 tipos jungianos"
        itemsLabel="36 afirmações em escala 1-5"
        durationLabel="5-10 minutos"
        description="Você vai indicar o quanto cada afirmação te descreve. Mapeia seu arquétipo dominante (Herói, Sábio, Criador, etc)."
        onStart={start}
      />
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--background)" }}>
      <div
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.6)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <Link
              href={`/candidatos/${candidateId}`}
              className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
            >
              <ArrowLeft size={12} /> {candidateName}
            </Link>
            <div className="text-xs opacity-70 font-mono">
              {answered}/{total}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #a855f7, #ec4899)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-1">Arquétipos</h1>
        <p className="text-sm opacity-80 mb-6">
          Vá com a primeira impressão pra cada afirmação. Não há certo ou errado.
        </p>

        <div className="space-y-3">
          {shuffled.map((item, idx) => {
            const value = responses[item.id];
            return (
              <div
                key={item.id}
                className="border rounded-xl p-4"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] opacity-50 font-mono">
                    {idx + 1}/{total}
                  </span>
                </div>
                <p className="text-sm mb-3 leading-relaxed">{item.text_pt}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {SCALE.map((s) => {
                    const active = value === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setResponses({ ...responses, [item.id]: s.value })}
                        className={`px-2 py-2.5 rounded-md text-[10px] border transition-all ${
                          active ? "scale-105" : "hover:scale-105"
                        }`}
                        style={{
                          borderColor: active ? "#a855f7" : "var(--border)",
                          background: active ? "rgba(168,85,247,0.15)" : "transparent",
                          color: active ? "#a855f7" : undefined,
                          fontWeight: active ? 700 : 400,
                        }}
                      >
                        <div className="text-base mb-0.5 font-mono">{s.value}</div>
                        <div className="opacity-80 leading-tight">{s.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
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
            className="w-full py-3 rounded-lg font-bold text-white disabled:opacity-50 text-base shadow-xl"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Calculando arquétipos...
              </span>
            ) : !allDone ? (
              `Faltam ${total - answered} afirmações`
            ) : (
              "Descobrir meu arquétipo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
