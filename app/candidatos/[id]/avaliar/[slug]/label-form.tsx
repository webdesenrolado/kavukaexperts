"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Heart, Coffee, Clock, Brain } from "lucide-react";
import type { LabelItem } from "@/services/label-adapted/src/items";

interface LabelFormProps {
  candidateId: string;
  candidateName: string;
  items: LabelItem[];
}

const SCALE = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Indiferente" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo totalmente" },
];

export function LabelForm({ candidateId, candidateName, items }: LabelFormProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "form">("intro");
  const startedAtRef = useRef<number>(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Embaralha a ordem dos itens uma vez (reduz viés posicional)
  const shuffled = useMemo(() => {
    const arr = [...items];
    // Fisher-Yates determinístico baseado no candidateId pra ser estável por sessão
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

  function start() {
    setPhase("form");
    startedAtRef.current = Date.now();
  }

  async function submit() {
    if (!allDone) return;
    setSubmitting(true);
    setError("");
    try {
      const completionTime = Math.round((Date.now() - startedAtRef.current) / 1000);
      const payload = items.map((it) => ({ item_id: it.id, value: responses[it.id] }));
      const res = await fetch("/api/instruments/label-adapted/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          responses: payload,
          channel: "web",
          language: "pt-BR",
          completionTimeSeconds: completionTime,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Falha ao salvar avaliação");
        return;
      }
      router.push(`/candidatos/${candidateId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "intro") {
    return (
      <IntroScreen candidateName={candidateName} candidateId={candidateId} onStart={start} />
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
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ff6a00, #ffcc00)" }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-1">Avaliação por adjetivos</h1>
        <p className="text-sm opacity-80 mb-6">
          Para cada palavra abaixo, indique o quanto ela te descreve. Não há respostas certas ou erradas.
        </p>

        <div className="space-y-3">
          {shuffled.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              index={idx + 1}
              total={total}
              value={responses[item.id]}
              onChange={(v) => setResponses({ ...responses, [item.id]: v })}
            />
          ))}
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
              `Faltam ${total - answered} adjetivos`
            ) : (
              "Calcular perfil LABEL"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function IntroScreen({
  candidateName,
  candidateId,
  onStart,
}: {
  candidateName: string;
  candidateId: string;
  onStart: () => void;
}) {
  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-12" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl w-full">
        <Link
          href={`/candidatos/${candidateId}`}
          className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={12} /> Voltar
        </Link>

        <div
          className="rounded-2xl border p-6 mb-4"
          style={{
            borderColor: "var(--border)",
            background: "linear-gradient(135deg, rgba(255,106,0,0.06), rgba(255,204,0,0.02))",
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">
            Avaliação comportamental
          </div>
          <h1 className="text-2xl font-bold mb-2">LABEL · perfil por adjetivos</h1>
          <p className="text-sm opacity-80 leading-relaxed">
            Olá, <strong>{candidateName}</strong>. Você vai avaliar 120 adjetivos em uma escala
            de 1 a 5, indicando o quanto cada um te descreve. Leva cerca de <strong>15-20 minutos</strong>.
          </p>
        </div>

        <div
          className="rounded-2xl border p-6 mb-4"
          style={{ borderColor: "rgba(255,106,0,0.4)", background: "rgba(255,106,0,0.05)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-[#ff6a00]" />
            <h2 className="font-bold text-lg">Antes de começar</h2>
          </div>
          <p className="text-sm opacity-90 leading-relaxed mb-4">
            O resultado depende do seu <strong>estado emocional no momento da resposta</strong>.
            Para que o perfil seja fiel a quem você é (e não a como você está agora), siga estas
            recomendações:
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Brain size={16} className="text-[#ff6a00] shrink-0 mt-0.5" />
              <div>
                <strong>Esteja com a cabeça tranquila.</strong> Se você acabou de receber notícia
                difícil, brigou com alguém, ou está sob estresse agudo, <strong>adie</strong> a
                avaliação. O ideal é fazer em um dia comum.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={16} className="text-[#ff6a00] shrink-0 mt-0.5" />
              <div>
                <strong>Reserve tempo sem pressa.</strong> 15-20 minutos sem interrupção. Se
                precisar parar, suas respostas até então não são salvas — melhor fazer de uma vez.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Coffee size={16} className="text-[#ff6a00] shrink-0 mt-0.5" />
              <div>
                <strong>Ambiente calmo.</strong> De preferência num lugar silencioso, com água ou
                café por perto. Evite responder no transporte ou no meio de reunião.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#ff6a00] shrink-0 mt-0.5 font-bold">⟳</span>
              <div>
                <strong>Vá com a primeira impressão.</strong> Não passe muito tempo em cada item.
                A resposta mais espontânea costuma ser a mais fiel.
              </div>
            </li>
          </ul>
        </div>

        <div
          className="rounded-2xl border p-5 mb-6 text-xs opacity-80 leading-relaxed"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <strong>Sobre a privacidade:</strong> seus resultados são confidenciais e usados apenas
          para o processo seletivo da empresa que solicitou. Você pode pedir revisão humana de
          qualquer interpretação automática (LGPD art. 20). Os dados não são vendidos a terceiros.
        </div>

        <button
          onClick={onStart}
          className="w-full py-3 rounded-lg font-bold text-black text-base shadow-xl"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          Estou tranquilo(a), vamos começar
        </button>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  index,
  total,
  value,
  onChange,
}: {
  item: LabelItem;
  index: number;
  total: number;
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      className="border rounded-xl p-4"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] opacity-50 font-mono">
            {index}/{total}
          </span>
          <h3 className="text-lg font-semibold capitalize">{item.text_pt}</h3>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {SCALE.map((s) => {
          const active = value === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange(s.value)}
              className={`px-2 py-2.5 rounded-md text-[10px] border transition-all ${
                active ? "scale-105" : "hover:scale-105"
              }`}
              style={{
                borderColor: active ? "#ff6a00" : "var(--border)",
                background: active ? "rgba(255,106,0,0.15)" : "transparent",
                color: active ? "#ff6a00" : undefined,
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
}
