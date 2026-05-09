"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ANCHORS, DIMENSIONS, type NR1Question } from "@/lib/nr1/questions";

const PROGRESS_MIN = 0.05;

export function FormClient({
  token,
  campaign,
  companyName,
  questions,
}: {
  token: string;
  campaign: { name: string; description: string | null; isAnonymous: boolean };
  companyName: string;
  questions: NR1Question[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [demographics, setDemographics] = useState({
    department: "",
    role: "",
    ageBand: "",
    tenureBand: "",
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(qid: string, v: number) {
    setAnswers({ ...answers, [qid]: v });
  }

  const completed = Object.keys(answers).length;
  const progress = Math.max(PROGRESS_MIN, completed / questions.length);

  async function submit() {
    if (completed < questions.length) {
      setError(`Faltam ${questions.length - completed} resposta(s)`);
      const firstUnanswered = questions.find((q) => !answers[q.id]);
      if (firstUnanswered) {
        document.getElementById(`q-${firstUnanswered.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/nr1/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          ...demographics,
          comment,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Falha ao enviar");
        return;
      }
      router.push(`/nr1/${token}/obrigado`);
    } finally {
      setSubmitting(false);
    }
  }

  // Agrupa por dimensão
  const byDim = new Map<string, NR1Question[]>();
  for (const q of questions) {
    if (!byDim.has(q.dimension)) byDim.set(q.dimension, []);
    byDim.get(q.dimension)!.push(q);
  }

  return (
    <div
      className="min-h-screen pb-32"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Progress sticky */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.6)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="opacity-70">{companyName} · {campaign.name}</span>
            <span className="opacity-60 font-mono">
              {completed}/{questions.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #ff6a00, #ffcc00)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold mb-2">Avaliação de saúde mental no trabalho</h1>
        <p className="text-sm opacity-80 mb-2">
          Sua participação ajuda <strong>{companyName}</strong> a entender e melhorar o ambiente de trabalho conforme a NR-1.
        </p>
        {campaign.isAnonymous && (
          <p className="text-xs opacity-70 mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]">
            🔒 Suas respostas são anônimas — nenhum dado individual é vinculado a você.
          </p>
        )}
        {campaign.description && (
          <p className="text-sm opacity-70 mb-6">{campaign.description}</p>
        )}

        {/* Demografia opcional (só se não-anônima OU pra segmentar dashboard) */}
        <section
          className="border rounded-xl p-5 mb-6"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-3">
            Sobre você (opcional, ajuda a segmentar o relatório)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Departamento / área">
              <input
                value={demographics.department}
                onChange={(e) => setDemographics({ ...demographics, department: e.target.value })}
                placeholder="ex: TI, Vendas, Operações"
                className="w-full px-3 py-2 rounded-md border bg-transparent text-sm"
                style={{ borderColor: "var(--border)" }}
              />
            </Field>
            <Field label="Cargo">
              <input
                value={demographics.role}
                onChange={(e) => setDemographics({ ...demographics, role: e.target.value })}
                placeholder="ex: Analista, Gerente"
                className="w-full px-3 py-2 rounded-md border bg-transparent text-sm"
                style={{ borderColor: "var(--border)" }}
              />
            </Field>
            <Field label="Faixa etária">
              <Select
                value={demographics.ageBand}
                onChange={(v) => setDemographics({ ...demographics, ageBand: v })}
                options={[
                  { value: "", label: "Prefiro não informar" },
                  { value: "18-24", label: "18-24 anos" },
                  { value: "25-34", label: "25-34 anos" },
                  { value: "35-44", label: "35-44 anos" },
                  { value: "45-54", label: "45-54 anos" },
                  { value: "55+", label: "55+ anos" },
                ]}
              />
            </Field>
            <Field label="Tempo de empresa">
              <Select
                value={demographics.tenureBand}
                onChange={(v) => setDemographics({ ...demographics, tenureBand: v })}
                options={[
                  { value: "", label: "Prefiro não informar" },
                  { value: "<1y", label: "Menos de 1 ano" },
                  { value: "1-3y", label: "1 a 3 anos" },
                  { value: "3-5y", label: "3 a 5 anos" },
                  { value: "5-10y", label: "5 a 10 anos" },
                  { value: "10+y", label: "Mais de 10 anos" },
                ]}
              />
            </Field>
          </div>
        </section>

        {/* Perguntas por dimensão */}
        {Array.from(byDim.entries()).map(([dimKey, qs], dIdx) => {
          const dim = DIMENSIONS[dimKey as keyof typeof DIMENSIONS];
          return (
            <section key={dimKey} className="mb-8">
              <div className="mb-3">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-0.5">
                  Bloco {dIdx + 1} de {byDim.size}
                </div>
                <h2 className="text-lg font-bold">{dim.label}</h2>
              </div>
              <div className="space-y-3">
                {qs.map((q) => (
                  <Question
                    key={q.id}
                    q={q}
                    value={answers[q.id]}
                    onChange={(v) => setAnswer(q.id, v)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Comentário aberto */}
        <section
          className="border rounded-xl p-5 mb-6"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-3">
            Comentário (opcional)
          </h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            rows={4}
            placeholder="Há algo que gostaria de relatar ou sugerir? Sua mensagem é tratada com confidencialidade."
            className="w-full px-3 py-2 rounded-md border bg-transparent text-sm resize-y"
            style={{ borderColor: "var(--border)" }}
          />
          <div className="text-[10px] opacity-50 text-right mt-1">{comment.length}/1000</div>
        </section>

        {error && (
          <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full py-3 rounded-lg font-bold text-black disabled:opacity-50 text-base"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          {submitting
            ? "Enviando..."
            : completed < questions.length
              ? `Responda as ${questions.length - completed} restantes`
              : "Enviar respostas"}
        </button>

        <p className="text-[10px] opacity-50 text-center mt-4 leading-relaxed">
          Conforme a NR-1 (MTE 2024), suas respostas alimentam o Programa de Gerenciamento de Riscos Psicossociais.
          {campaign.isAnonymous &&
            " Esta pesquisa é anônima — não há vinculação entre você e suas respostas."}
        </p>
      </div>
    </div>
  );
}

function Question({
  q,
  value,
  onChange,
}: {
  q: NR1Question;
  value?: number;
  onChange: (v: number) => void;
}) {
  const labels = ANCHORS[q.anchors];
  return (
    <div
      id={`q-${q.id}`}
      className="border rounded-xl p-4"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <p className="text-sm mb-3 leading-relaxed">{q.text}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`px-2 py-2.5 rounded-md text-xs border transition-all ${
                active ? "scale-105" : "hover:scale-105"
              }`}
              style={{
                borderColor: active ? "#ff6a00" : "var(--border)",
                background: active ? "rgba(255,106,0,0.15)" : "transparent",
                color: active ? "#ff6a00" : undefined,
                fontWeight: active ? 700 : 400,
              }}
            >
              <div className="text-base mb-0.5 font-mono">{n}</div>
              <div className="opacity-80 leading-tight">{labels[n - 1]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider opacity-70 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-md border bg-transparent text-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "var(--background)" }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
