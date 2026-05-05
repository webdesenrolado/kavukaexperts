"use client";

import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface DomainScore {
  raw: number;
  level: "very_low" | "low" | "average" | "high" | "very_high";
  z_score?: number;
  percentile?: number;
}

interface IpipScores {
  domains: {
    O: DomainScore;
    C: DomainScore;
    E: DomainScore;
    A: DomainScore;
    N: DomainScore;
  };
  facets?: Record<string, DomainScore | undefined>;
}

interface Interpretation {
  strengths: string[];
  watchouts: string[];
  narrative: string;
  confidence: "low" | "medium" | "high";
}

interface SuperTrunfoProps {
  candidateName: string;
  scores: IpipScores;
  interpretation: Interpretation;
  scoreWeight: number;
  normSource: string;
  qualityFlags: string[];
  appliedAt: string;
}

const DOMAIN_LABELS: Record<keyof IpipScores["domains"], { name: string; full: string; color: string }> = {
  O: { name: "Abertura", full: "Abertura a Experiências", color: "#a855f7" },
  C: { name: "Conscienciosidade", full: "Conscienciosidade", color: "#0ea5e9" },
  E: { name: "Extroversão", full: "Extroversão", color: "#f59e0b" },
  A: { name: "Amabilidade", full: "Amabilidade", color: "#10b981" },
  N: { name: "Sensibilidade", full: "Sensibilidade ao ambiente (Neuroticismo)", color: "#ef4444" },
};

const LEVEL_LABEL: Record<DomainScore["level"], string> = {
  very_low: "Muito baixo",
  low: "Baixo",
  average: "Médio",
  high: "Alto",
  very_high: "Muito alto",
};

const LEVEL_PCT: Record<DomainScore["level"], number> = {
  very_low: 12,
  low: 30,
  average: 50,
  high: 70,
  very_high: 88,
};

export function SuperTrunfo({
  candidateName,
  scores,
  interpretation,
  scoreWeight,
  normSource,
  qualityFlags,
  appliedAt,
}: SuperTrunfoProps) {
  const [showFacets, setShowFacets] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className="p-6 rounded-2xl border relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,106,0,0.06), rgba(255,204,0,0.03))",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">Super Trunfo · IPIP-NEO-120</div>
            <h2 className="text-2xl font-bold">{candidateName}</h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider opacity-60">Confiança</div>
            <div
              className={`text-sm font-bold ${
                interpretation.confidence === "high"
                  ? "text-[#10b981]"
                  : interpretation.confidence === "medium"
                  ? "text-[#f59e0b]"
                  : "text-[#ef4444]"
              }`}
            >
              {interpretation.confidence === "high"
                ? "Alta"
                : interpretation.confidence === "medium"
                ? "Média"
                : "Baixa"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] opacity-60 mt-3">
          <span>Aplicado: {new Date(appliedAt).toLocaleString("pt-BR")}</span>
          <span>·</span>
          <span>Norma: {normSource}</span>
          <span>·</span>
          <span>Peso no Score Humano: {(scoreWeight * 100).toFixed(0)}%</span>
        </div>

        {qualityFlags.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <span>Flags de qualidade: {qualityFlags.join(", ")}</span>
          </div>
        )}
      </div>

      <div
        className="p-6 rounded-xl border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="font-semibold mb-4">Big Five — perfil sinalizado</h3>
        <div className="space-y-4">
          {(Object.keys(DOMAIN_LABELS) as Array<keyof IpipScores["domains"]>).map((key) => {
            const d = scores.domains[key];
            const meta = DOMAIN_LABELS[key];
            const pct = LEVEL_PCT[d.level];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
                      style={{ background: meta.color }}
                    >
                      {key}
                    </span>
                    <span className="font-medium text-sm">{meta.full}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: meta.color }}>
                    {LEVEL_LABEL[d.level]}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: meta.color }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] opacity-60">
                  <span>raw {d.raw.toFixed(0)}</span>
                  {d.z_score !== undefined && <span>z {d.z_score.toFixed(2)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="p-5 rounded-xl border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-[#10b981]" />
            <h3 className="font-semibold">Forças sinalizadas</h3>
          </div>
          {interpretation.strengths.length === 0 ? (
            <p className="text-sm opacity-60">Nenhuma força destacada neste perfil.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {interpretation.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#10b981]">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="p-5 rounded-xl border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-[#f59e0b]" />
            <h3 className="font-semibold">Pontos de atenção</h3>
          </div>
          {interpretation.watchouts.length === 0 ? (
            <p className="text-sm opacity-60">Nenhum ponto de atenção destacado.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {interpretation.watchouts.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#f59e0b]">·</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        className="p-5 rounded-xl border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h3 className="font-semibold mb-3">Narrativa</h3>
        <p className="text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{interpretation.narrative}</p>
      </div>

      {scores.facets && Object.keys(scores.facets).length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setShowFacets((v) => !v)}
            className="w-full p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5"
          >
            <div className="text-left">
              <h3 className="font-semibold">30 facetas (drill-down)</h3>
              <p className="text-xs opacity-60 mt-0.5">Visão granular dentro de cada domínio Big Five</p>
            </div>
            {showFacets ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showFacets && (
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(scores.facets).map(([k, f]) => {
                if (!f) return null;
                const domain = k[0].toUpperCase() as keyof IpipScores["domains"];
                const color = DOMAIN_LABELS[domain]?.color || "#999";
                return (
                  <div
                    key={k}
                    className="p-2.5 rounded-lg border text-xs flex items-center justify-between"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="opacity-80">
                      <span className="font-mono mr-2 opacity-60">{k.slice(0, 2).toUpperCase()}</span>
                      {k.slice(3).replace(/_/g, " ")}
                    </span>
                    <span style={{ color }} className="font-medium text-[10px]">
                      {LEVEL_LABEL[f.level]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border p-4 text-[11px] opacity-60" style={{ borderColor: "var(--border)" }}>
        <strong>Aviso:</strong> Este resultado é uma <em>sinalização</em> de tendências comportamentais — não é
        diagnóstico clínico. Decisões de contratação devem combinar este sinal com entrevista, contexto e revisão
        humana (LGPD art. 20). O candidato pode contestar o resultado a qualquer momento.
      </div>
    </div>
  );
}
