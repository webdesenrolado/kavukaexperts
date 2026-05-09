"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RadarChart, type RadarAxis } from "./radar-chart";

interface AssessmentRow {
  id: string;
  instrument: string;
  status: string;
  scoresJson: string | null;
  interpretationJson: string | null;
  qualityFlagsJson: string | null;
  completedAt: Date | null;
}

const INSTRUMENT_META: Record<string, { name: string; layer: string; color: string; icon: string }> = {
  "ipip-neo-120":     { name: "IPIP-NEO-120 (Big Five)", layer: "Camada 1 — Base",          color: "#ff6a00", icon: "🧬" },
  "bigfive-short":    { name: "Big Five curto (IPIP-50)", layer: "Camada 1 — Base",         color: "#ff8a3d", icon: "🧬" },
  "mbti-like":        { name: "MBTI-like (16 letras)",   layer: "Camada 1 — Base",          color: "#ff8a3d", icon: "🅻" },
  "disc-adapt":       { name: "DISC adaptado",            layer: "Camada 2 — Comportamento", color: "#0ea5e9", icon: "🎭" },
  "disc-adapted":     { name: "DISC adaptado",            layer: "Camada 2 — Comportamento", color: "#0ea5e9", icon: "🎭" },
  "label-guep":       { name: "Label GUÉP",               layer: "Camada 2 — Comportamento", color: "#0ea5e9", icon: "🏷️" },
  "label-adapted":    { name: "LABEL adaptado",           layer: "Camada 2 — Comportamento", color: "#0ea5e9", icon: "🏷️" },
  "gallup-adapt":     { name: "Gallup adaptado",          layer: "Camada 3 — Performance",   color: "#10b981", icon: "💪" },
  "dark-triad":       { name: "Dark Triad (Risco)",       layer: "Camada 4 — Risco",         color: "#a855f7", icon: "🌑" },
  "hogan-adapt":      { name: "Hogan HDS adaptado",       layer: "Camada 4 — Risco",         color: "#a855f7", icon: "⚠️" },
  "arquetipos":       { name: "Arquétipos (Jung)",        layer: "Camada 5 — Identidade",    color: "#f59e0b", icon: "🔮" },
  "eneagrama":        { name: "Eneagrama",                layer: "Camada 5 — Identidade",    color: "#f59e0b", icon: "♾️" },
  "score-humano":     { name: "Score Humano (Síntese)",   layer: "Camada 6 — Síntese",       color: "#10b981", icon: "✨" },
  "avaliacao-continua": { name: "Avaliação contínua",     layer: "Camada 6 — Síntese",       color: "#6b7280", icon: "🔄" },
};

export function InstrumentCards({ assessments }: { assessments: AssessmentRow[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {assessments.map((a) => (
        <InstrumentCard key={a.id} assessment={a} />
      ))}
    </div>
  );
}

function InstrumentCard({ assessment }: { assessment: AssessmentRow }) {
  const [open, setOpen] = useState(false);
  const meta = INSTRUMENT_META[assessment.instrument] || {
    name: assessment.instrument,
    layer: "—",
    color: "#6b7280",
    icon: "📊",
  };
  const scores = assessment.scoresJson ? JSON.parse(assessment.scoresJson) : null;
  const interp = assessment.interpretationJson ? JSON.parse(assessment.interpretationJson) : null;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 flex items-start gap-3 hover:bg-black/5 dark:hover:bg-white/5 text-left"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{ background: `${meta.color}1a` }}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm">{meta.name}</h3>
            {open ? <ChevronUp size={14} className="opacity-60" /> : <ChevronDown size={14} className="opacity-60" />}
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-60 mt-0.5">{meta.layer}</div>
          <InstrumentSummary instrument={assessment.instrument} scores={scores} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border)" }}>
          <InstrumentDetail instrument={assessment.instrument} scores={scores} color={meta.color} />
          {interp && (
            <div className="mt-3 space-y-2 text-xs">
              {interp.strengths?.length > 0 && (
                <div>
                  <div className="font-medium opacity-70 mb-1">Forças sinalizadas</div>
                  <ul className="space-y-0.5">
                    {interp.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#10b981]">·</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {interp.watchouts?.length > 0 && (
                <div>
                  <div className="font-medium opacity-70 mb-1">Atenção</div>
                  <ul className="space-y-0.5">
                    {interp.watchouts.map((w: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#f59e0b]">·</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {interp.narrative && <p className="opacity-70 leading-relaxed pt-1">{interp.narrative}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InstrumentSummary({ instrument, scores }: { instrument: string; scores: any }) {
  if (!scores) return null;

  if (instrument === "ipip-neo-120" || instrument === "bigfive-short") {
    const d = scores.domains;
    return (
      <div className="flex gap-1 mt-2">
        {["O", "C", "E", "A", "N"].map((k) => {
          const lvl = d?.[k]?.level;
          return (
            <span
              key={k}
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{
                background: lvl === "high" || lvl === "very_high" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                color: lvl === "high" || lvl === "very_high" ? "#10b981" : undefined,
              }}
            >
              {k}
            </span>
          );
        })}
      </div>
    );
  }

  if (instrument === "mbti-like") {
    return <div className="text-lg font-mono font-bold mt-1">{scores.type ?? "—"}</div>;
  }

  if (instrument === "disc-adapt" || instrument === "disc-adapted") {
    const profile = scores.profile ?? scores.dominant ?? "—";
    return (
      <div className="text-xs mt-1 opacity-80">
        Perfil: <span className="font-mono font-bold">{profile}</span>
      </div>
    );
  }

  if (instrument === "label-guep" || instrument === "label-adapted") {
    // LABEL adaptado: mostra os 3 fatores Big Five mais altos
    const bf = scores.big_five || {};
    const top = (Object.entries(bf) as [string, number][])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => k);
    return (
      <div className="text-xs mt-1 opacity-80 flex gap-1">
        {top.map((k) => (
          <span key={k} className="font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
            {k}
          </span>
        ))}
      </div>
    );
  }

  if (instrument === "gallup-adapt") {
    return (
      <div className="text-xs mt-1 opacity-80 truncate">{scores.top5?.slice(0, 3).join(" · ")}</div>
    );
  }

  if (instrument === "dark-triad") {
    return (
      <div className="text-xs mt-1 opacity-80">
        Risco geral:{" "}
        <span className="font-bold text-[#10b981]">
          {scores.overall_risk?.replace("_", " ") ?? "—"}
        </span>
      </div>
    );
  }

  if (instrument === "hogan-adapt") {
    return (
      <div className="text-xs mt-1 opacity-80">
        Derailers em alto risco: <span className="font-bold">{scores.high_risk_count ?? 0}</span>
      </div>
    );
  }

  if (instrument === "arquetipos") {
    return (
      <div className="text-xs mt-1 opacity-80">
        Dominante: <span className="font-bold text-[#f59e0b]">{scores.primary}</span>
      </div>
    );
  }

  if (instrument === "eneagrama") {
    return (
      <div className="text-xs mt-1 opacity-80">
        Tipo <span className="font-mono font-bold">{scores.type}</span>{" "}
        <span className="opacity-60">— {scores.type_name}</span>
      </div>
    );
  }

  if (instrument === "score-humano") {
    return (
      <div className="text-xs mt-1 opacity-80">
        <span className="text-2xl font-bold text-[#10b981]">{scores.score}</span>
        <span className="opacity-60 text-[10px] ml-1">/ 100 · banda {scores.band}</span>
      </div>
    );
  }

  return null;
}

function InstrumentDetail({ instrument, scores, color }: { instrument: string; scores: any; color: string }) {
  if (!scores) return null;

  if (instrument === "ipip-neo-120" || instrument === "bigfive-short") {
    const d = scores.domains || {};
    const labels: Record<string, string> = {
      O: "Abertura", C: "Conscienciosidade", E: "Extroversão", A: "Amabilidade", N: "Sensibilidade",
    };
    const levelPct: Record<string, number> = {
      very_low: 12, low: 30, average: 50, high: 70, very_high: 88,
    };
    return (
      <div className="space-y-2 pt-3">
        {Object.entries(labels).map(([k, name]) => {
          const item = d[k];
          if (!item) return null;
          return (
            <div key={k}>
              <div className="flex justify-between text-[10px] mb-1">
                <span>{name}</span>
                <span className="opacity-60">{item.level?.replace("_", " ")}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${levelPct[item.level] ?? 50}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (instrument === "disc-adapt" || instrument === "disc-adapted") {
    const labels: Record<string, string> = { D: "Dominância", I: "Influência", S: "Estabilidade", C: "Conformidade" };
    return (
      <div className="space-y-2 pt-3">
        {(["D", "I", "S", "C"] as const).map((k) => {
          // disc-adapt antigo guarda em scores.scores; disc-adapted guarda direto em scores
          const v = scores[k] ?? scores.scores?.[k] ?? 0;
          return (
            <div key={k}>
              <div className="flex justify-between text-[10px] mb-1">
                <span>{labels[k]}</span>
                <span className="opacity-60 font-mono">{v}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (instrument === "label-adapted") {
    return <LabelAdaptedDetail scores={scores} color={color} />;
  }

  if (instrument === "mbti-like") {
    const dims = scores.dimensions ?? {};
    return (
      <div className="grid grid-cols-4 gap-2 pt-3">
        {Object.entries(dims).map(([k, v]: any) => (
          <div key={k} className="text-center p-2 rounded-lg" style={{ background: "var(--background)" }}>
            <div className="text-2xl font-bold font-mono" style={{ color }}>{v.letter}</div>
            <div className="text-[9px] opacity-60 mt-0.5">{v.magnitude}</div>
          </div>
        ))}
      </div>
    );
  }

  if (instrument === "gallup-adapt") {
    return (
      <div className="pt-3">
        <ol className="space-y-1.5">
          {scores.top5?.map((s: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: `${color}33`, color }}
              >
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (instrument === "dark-triad") {
    const labels: Record<string, string> = {
      machiavellianism: "Maquiavelismo (estilo direto)",
      narcissism: "Narcisismo subclínico",
      boldness: "Ousadia/Distanciamento",
    };
    return (
      <div className="space-y-2 pt-3">
        {Object.entries(labels).map(([k, label]) => {
          const v = scores[k];
          if (!v) return null;
          const pct = (v.raw / 5) * 100;
          return (
            <div key={k}>
              <div className="flex justify-between text-[10px] mb-1">
                <span>{label}</span>
                <span className="opacity-60">{v.level?.replace("_", " ")}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (instrument === "hogan-adapt") {
    const d = scores.derailers ?? {};
    const sorted = Object.entries(d).sort((a: any, b: any) => b[1] - a[1]);
    return (
      <div className="grid grid-cols-2 gap-1.5 pt-3">
        {sorted.map(([k, v]: any) => (
          <div key={k} className="flex justify-between p-1.5 rounded text-[10px]" style={{ background: "var(--background)" }}>
            <span className="capitalize opacity-80">{k}</span>
            <span className="font-mono" style={{ color: v > 60 ? "#ef4444" : v > 40 ? "#f59e0b" : color }}>{v}</span>
          </div>
        ))}
      </div>
    );
  }

  if (instrument === "arquetipos") {
    const dist = scores.distribution ?? {};
    const sorted = Object.entries(dist).sort((a: any, b: any) => b[1] - a[1]).slice(0, 6);
    return (
      <div className="space-y-1.5 pt-3">
        {sorted.map(([k, v]: any) => (
          <div key={k}>
            <div className="flex justify-between text-[10px] mb-1">
              <span>{k}</span>
              <span className="opacity-60 font-mono">{v}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (instrument === "eneagrama") {
    const dist = scores.distribution ?? {};
    return (
      <div className="grid grid-cols-9 gap-1 pt-3">
        {Object.entries(dist).map(([k, v]: any) => {
          const isMain = parseInt(k) === scores.type;
          return (
            <div
              key={k}
              className="text-center p-2 rounded-lg"
              style={{
                background: isMain ? color : "var(--background)",
                color: isMain ? "#fff" : undefined,
                opacity: isMain ? 1 : 0.6,
              }}
            >
              <div className="text-sm font-bold">{k}</div>
              <div className="text-[9px]">{v}</div>
            </div>
          );
        })}
      </div>
    );
  }

  if (instrument === "score-humano") {
    const c = scores.components ?? {};
    return (
      <div className="space-y-2 pt-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-3xl font-bold" style={{ color }}>{scores.score}</div>
          <div className="text-xs opacity-60">/ 100 · {scores.fit_categoria}</div>
        </div>
        {Object.entries(c).map(([k, v]: any) => (
          <div key={k}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="capitalize">{k.replace(/_/g, " ")}</span>
              <span className="opacity-60 font-mono">peso {(v.weight * 100).toFixed(0)}% · contribui {v.contribution}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(v.contribution / scores.score) * 100}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function LabelAdaptedDetail({ scores, color }: { scores: any; color: string }) {
  const bf = scores?.big_five || {};
  const dims = scores?.dimensions || {};

  const BF_LABEL: Record<string, string> = {
    O: "Abertura",
    C: "Conscienciosidade",
    E: "Extroversão",
    A: "Afabilidade",
    S: "Estabilidade emocional",
  };
  const DIM_LABEL: Record<string, string> = {
    fragilidade: "Fragilidade",
    estabilidade: "Estabilidade",
    adaptabilidade: "Adaptabilidade",
    metodo: "Método",
    racionalidade: "Racionalidade",
    motivacao: "Motivação",
    combatividade: "Combatividade",
    autoridade: "Autoridade",
    expansividade: "Expansividade",
    originalidade: "Originalidade",
    sociabilidade: "Sociabilidade",
    altruismo: "Altruísmo",
    dependencia: "Dependência",
  };
  const RADAR_ORDER = [
    "fragilidade", "estabilidade", "adaptabilidade", "metodo", "racionalidade",
    "motivacao", "combatividade", "autoridade", "expansividade",
    "originalidade", "sociabilidade", "altruismo", "dependencia",
  ];
  const NORMS: Record<string, { mean: number; sd: number }> = {
    estabilidade: { mean: 3.0, sd: 0.7 },
    adaptabilidade: { mean: 3.2, sd: 0.6 },
    metodo: { mean: 3.1, sd: 0.7 },
    racionalidade: { mean: 3.2, sd: 0.6 },
    motivacao: { mean: 3.4, sd: 0.6 },
    combatividade: { mean: 2.8, sd: 0.7 },
    autoridade: { mean: 3.0, sd: 0.7 },
    expansividade: { mean: 3.1, sd: 0.7 },
    originalidade: { mean: 3.3, sd: 0.6 },
    sociabilidade: { mean: 3.4, sd: 0.7 },
    altruismo: { mean: 3.6, sd: 0.5 },
    dependencia: { mean: 2.9, sd: 0.6 },
    fragilidade: { mean: 3.0, sd: 0.7 },
  };

  const radarAxes: RadarAxis[] = RADAR_ORDER.map((k) => ({
    key: k,
    label: DIM_LABEL[k],
    value: dims[k] ?? 3,
    norm: NORMS[k]?.mean ?? 3,
    sd: NORMS[k]?.sd ?? 0.7,
  }));

  return (
    <div className="pt-4 space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-wider opacity-60 mb-2">Big Five</div>
        <div className="space-y-1.5">
          {(["O", "C", "E", "A", "S"] as const).map((k) => {
            const v = typeof bf[k] === "number" ? bf[k] : 3;
            const pct = ((v - 1) / 4) * 100;
            return (
              <div key={k}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span>{BF_LABEL[k]}</span>
                  <span className="opacity-60 font-mono">{v.toFixed(1)} / 5</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider opacity-60 mb-2">
          Como me apresentei — 13 dimensões
        </div>
        <RadarChart axes={radarAxes} size={460} fillColor={color} />
      </div>
    </div>
  );
}
