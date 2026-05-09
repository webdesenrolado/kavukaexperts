"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { IntroScreen } from "./intro-screen";

interface Item {
  item_id: string;
  text: string;
}

interface IpipFormProps {
  candidateId: string;
  candidateName: string;
  items: Item[];
}

const SCALE = [
  { value: 1, label: "Discordo totalmente", short: "DT" },
  { value: 2, label: "Discordo", short: "D" },
  { value: 3, label: "Indiferente", short: "I" },
  { value: 4, label: "Concordo", short: "C" },
  { value: 5, label: "Concordo totalmente", short: "CT" },
];

const SCALE_COLORS = ["#ef4444", "#f97316", "#94a3b8", "#22c55e", "#10b981"];

export function IpipForm({ candidateId, candidateName, items }: IpipFormProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "form">("intro");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({});
  const startedAtRef = useRef<number>(0);
  const lastInteractionRef = useRef<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function start() {
    setPhase("form");
    const now = Date.now();
    startedAtRef.current = now;
    lastInteractionRef.current = now;
  }

  const total = items.length;
  const answered = Object.keys(responses).length;
  const progress = (answered / total) * 100;
  const allDone = answered === total;

  const firstUnanswered = useMemo(
    () => items.findIndex((it) => responses[it.item_id] === undefined),
    [items, responses],
  );

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

  if (phase === "intro") {
    return (
      <IntroScreen
        candidateId={candidateId}
        candidateName={candidateName}
        instrumentName="IPIP-NEO-120 · Big Five (5 grandes traços)"
        itemsLabel="120 afirmações em escala 1-5"
        durationLabel="20-25 minutos"
        description="Você vai indicar o quanto cada afirmação te descreve."
        onStart={start}
      />
    );
  }

  function setResponse(itemId: string, value: number) {
    const now = Date.now();
    const dt = now - lastInteractionRef.current;
    lastInteractionRef.current = now;
    setResponses((r) => ({ ...r, [itemId]: value }));
    setResponseTimes((t) => ({ ...t, [itemId]: dt }));
  }

  async function handleSubmit() {
    if (!allDone) {
      setError(`Faltam ${total - answered} item(s) sem resposta.`);
      const target = document.getElementById(`item-${firstUnanswered}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const completionTime = Math.round((Date.now() - startedAtRef.current) / 1000);
      const payload = {
        candidateId,
        channel: "web" as const,
        language: "pt-BR" as const,
        completionTimeSeconds: completionTime,
        responses: items.map((it) => ({
          item_id: it.item_id,
          value: { kind: "likert5" as const, value: responses[it.item_id] },
          response_time_ms: responseTimes[it.item_id] ?? 2000,
        })),
      };
      const res = await fetch("/api/instruments/ipip-neo-120/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao enviar avaliação.");
        return;
      }
      router.push(`/candidatos/${candidateId}/avaliacoes/${data.application_id}`);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <header
        className="sticky top-0 z-20 border-b backdrop-blur-md"
        style={{ background: "rgba(0,0,0,0.5)", borderColor: "var(--border)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/candidatos/${candidateId}`}
              className="inline-flex items-center gap-2 text-xs opacity-70 hover:opacity-100"
            >
              <ArrowLeft size={12} /> Sair sem enviar
            </Link>
            <span className="text-xs">
              <span className="font-bold">{answered}</span>
              <span className="opacity-60"> / {total}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #ff6a00, #ffcc00)",
              }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">IPIP-NEO-120 · Big Five</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">Olá, {candidateName.split(" ")[0]}</h1>
          <p className="opacity-70 mt-2 text-sm leading-relaxed">
            Você verá 120 afirmações. Para cada uma, escolha o quanto ela combina com você. Não há respostas certas
            ou erradas — responda da forma mais espontânea possível. Tempo estimado: 15-20 minutos.
          </p>
          <p className="opacity-50 mt-3 text-xs">
            <strong>Importante:</strong> seus resultados são uma sinalização, não diagnóstico clínico. Você pode
            contestar o resultado a qualquer momento.
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const value = responses[item.item_id];
            return (
              <div
                key={item.item_id}
                id={`item-${idx}`}
                className="p-4 rounded-xl border transition-colors"
                style={{
                  background: "var(--card)",
                  borderColor: value !== undefined ? "rgba(255,106,0,0.4)" : "var(--border)",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="text-[10px] font-mono opacity-50 mt-0.5 shrink-0 w-8"
                    aria-label={`Item ${idx + 1}`}
                  >
                    {String(idx + 1).padStart(3, "0")}
                  </span>
                  <span className="text-sm md:text-base leading-relaxed">{item.text}</span>
                </div>
                <div className="flex gap-1.5 ml-11">
                  {SCALE.map((s, i) => {
                    const selected = value === s.value;
                    return (
                      <button
                        key={s.value}
                        onClick={() => setResponse(item.item_id, s.value)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                          selected ? "scale-105 shadow-md" : "hover:scale-102 opacity-70 hover:opacity-100"
                        }`}
                        style={{
                          background: selected ? SCALE_COLORS[i] : "transparent",
                          borderColor: selected ? SCALE_COLORS[i] : "var(--border)",
                          color: selected ? "#fff" : "var(--foreground)",
                        }}
                        title={s.label}
                      >
                        <div className="hidden md:block">{s.label}</div>
                        <div className="md:hidden font-bold">{s.short}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 disabled:opacity-50 shadow-xl shadow-[#ff6a00]/20"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Calculando perfil...
              </>
            ) : (
              <>
                <Send size={18} />
                {allDone ? "Enviar respostas" : `Faltam ${total - answered} respostas`}
              </>
            )}
          </button>
          {allDone && !submitting && (
            <p className="text-xs opacity-60">Você poderá ver o resultado completo em seguida.</p>
          )}
        </div>
      </div>
    </div>
  );
}
