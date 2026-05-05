"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  MapPin,
  Briefcase,
  ClipboardList,
  Search,
  X,
  Filter,
} from "lucide-react";
import type { CandidateRow } from "./page";
import { EDUCATION_LABEL } from "@/lib/labels";

interface Props {
  candidates: CandidateRow[];
}

const TRAIT_LABELS: Record<string, string> = {
  O: "Abertura (curiosidade)",
  C: "Conscienciosidade (foco)",
  E: "Extroversão (energia social)",
  A: "Amabilidade (cooperação)",
  N: "Sensibilidade emocional",
};

const LEVEL_RANK: Record<string, number> = {
  very_low: 1, low: 2, average: 3, high: 4, very_high: 5,
};

interface FilterState {
  q: string;
  city: string;
  educationLevel: string;
  minExperience: string;
  maxSalary: string;
  // Big Five — para cada um, "any" (sem filtro), "high" (high+very_high), "low" (low+very_low)
  bigFive: Partial<Record<"O" | "C" | "E" | "A" | "N", "any" | "high" | "low">>;
  discProfile: string;
  labelGuep: string;
  hasAssessments: boolean;
  minScoreHumano: string;
}

const EMPTY_FILTERS: FilterState = {
  q: "",
  city: "",
  educationLevel: "",
  minExperience: "",
  maxSalary: "",
  bigFive: {},
  discProfile: "",
  labelGuep: "",
  hasAssessments: false,
  minScoreHumano: "",
};

export function CandidatesListClient({ candidates }: Props) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(true);

  const cities = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.city).filter(Boolean))) as string[],
    [candidates],
  );
  const discProfiles = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.discProfile).filter(Boolean))) as string[],
    [candidates],
  );
  const labels = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.labelGuep).filter(Boolean))) as string[],
    [candidates],
  );

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const haystack = [
          c.name, c.email, c.currentRole, c.currentCompany, c.labelGuep, c.mbti,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.city && c.city !== filters.city) return false;
      if (filters.educationLevel && c.educationLevel !== filters.educationLevel) return false;
      if (filters.minExperience && (c.yearsExperience ?? 0) < parseInt(filters.minExperience)) return false;
      if (filters.maxSalary && (c.expectedSalary ?? Infinity) > parseInt(filters.maxSalary)) return false;
      if (filters.discProfile && c.discProfile !== filters.discProfile) return false;
      if (filters.labelGuep && c.labelGuep !== filters.labelGuep) return false;
      if (filters.hasAssessments && c.assessmentCount === 0) return false;
      if (filters.minScoreHumano && (c.scoreHumano ?? 0) < parseInt(filters.minScoreHumano)) return false;
      for (const k of ["O", "C", "E", "A", "N"] as const) {
        const want = filters.bigFive[k];
        if (!want || want === "any") continue;
        const lvl = c.bigFive[k];
        if (!lvl) return false;
        const r = LEVEL_RANK[lvl];
        if (want === "high" && r < 4) return false;
        if (want === "low" && r > 2) return false;
      }
      return true;
    });
  }, [candidates, filters]);

  const activeFilterCount =
    (filters.q ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.educationLevel ? 1 : 0) +
    (filters.minExperience ? 1 : 0) +
    (filters.maxSalary ? 1 : 0) +
    (filters.discProfile ? 1 : 0) +
    (filters.labelGuep ? 1 : 0) +
    (filters.hasAssessments ? 1 : 0) +
    (filters.minScoreHumano ? 1 : 0) +
    Object.values(filters.bigFive).filter((v) => v && v !== "any").length;

  return (
    <div className="p-8 max-w-7xl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banco de Talentos</h1>
          <p className="opacity-70 mt-1">
            {filtered.length} de {candidates.length} candidatos · use os filtros para encontrar perfis específicos
          </p>
        </div>
        <Link
          href="/candidatos/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 shadow-lg shadow-[#ff6a00]/20"
        >
          <Plus size={18} />
          Novo candidato
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SIDEBAR FILTERS */}
        <aside className={`lg:col-span-1 ${showFilters ? "" : "hidden lg:block"}`}>
          <div
            className="rounded-xl border p-4 space-y-4 sticky top-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter size={14} />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ff6a00]/20 text-[#ff6a00] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-[10px] text-[#ff6a00] hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            <FilterField label="Buscar">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                  placeholder="nome, email, cargo..."
                  className="filter-input pl-7"
                />
              </div>
            </FilterField>

            <FilterField label="Cidade">
              <select
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="filter-input"
              >
                <option value="">Todas</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FilterField>

            <FilterField label="Escolaridade mínima">
              <select
                value={filters.educationLevel}
                onChange={(e) => setFilters((f) => ({ ...f, educationLevel: e.target.value }))}
                className="filter-input"
              >
                <option value="">Qualquer</option>
                {Object.entries(EDUCATION_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Experiência mínima (anos)">
              <input
                type="number"
                min={0}
                value={filters.minExperience}
                onChange={(e) => setFilters((f) => ({ ...f, minExperience: e.target.value }))}
                className="filter-input"
              />
            </FilterField>

            <FilterField label="Pretensão máxima (R$)">
              <input
                type="number"
                min={0}
                value={filters.maxSalary}
                onChange={(e) => setFilters((f) => ({ ...f, maxSalary: e.target.value }))}
                className="filter-input"
              />
            </FilterField>

            <FilterField label="Score Humano mínimo">
              <input
                type="number"
                min={0}
                max={100}
                value={filters.minScoreHumano}
                onChange={(e) => setFilters((f) => ({ ...f, minScoreHumano: e.target.value }))}
                className="filter-input"
              />
            </FilterField>

            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-60 mb-2">Perfil Big Five</div>
              <div className="space-y-1.5">
                {(["A", "C", "E", "O", "N"] as const).map((k) => (
                  <div key={k} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-32 opacity-80">{TRAIT_LABELS[k]}</span>
                    <select
                      value={filters.bigFive[k] ?? "any"}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          bigFive: { ...f.bigFive, [k]: e.target.value as any },
                        }))
                      }
                      className="filter-input flex-1 py-1 text-[11px]"
                    >
                      <option value="any">qualquer</option>
                      <option value="high">alto</option>
                      <option value="low">baixo</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {discProfiles.length > 0 && (
              <FilterField label="Perfil DISC">
                <select
                  value={filters.discProfile}
                  onChange={(e) => setFilters((f) => ({ ...f, discProfile: e.target.value }))}
                  className="filter-input"
                >
                  <option value="">Qualquer</option>
                  {discProfiles.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </FilterField>
            )}

            {labels.length > 0 && (
              <FilterField label="Label GUÉP">
                <select
                  value={filters.labelGuep}
                  onChange={(e) => setFilters((f) => ({ ...f, labelGuep: e.target.value }))}
                  className="filter-input"
                >
                  <option value="">Qualquer</option>
                  {labels.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </FilterField>
            )}

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasAssessments}
                onChange={(e) => setFilters((f) => ({ ...f, hasAssessments: e.target.checked }))}
              />
              Apenas com avaliações aplicadas
            </label>
          </div>
        </aside>

        {/* RESULTS */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div
              className="p-12 rounded-xl border text-center"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <Users size={36} className="mx-auto opacity-30 mb-3" />
              <h2 className="text-lg font-semibold">
                {candidates.length === 0 ? "Nenhum candidato cadastrado" : "Nenhum resultado para os filtros"}
              </h2>
              <p className="opacity-70 text-sm mt-1 mb-5">
                {candidates.length === 0
                  ? "Cadastre o primeiro ou aguarde aplicações via página pública de carreiras."
                  : "Tente afrouxar os critérios."}
              </p>
              {candidates.length === 0 && (
                <Link
                  href="/candidatos/novo"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00]"
                >
                  <Plus size={16} /> Cadastrar
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  href={`/candidatos/${c.id}`}
                  className="p-4 rounded-xl border hover:shadow-lg hover:-translate-y-0.5 transition-all flex gap-3"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt="" className="w-12 h-12 rounded-xl shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center font-bold opacity-70 shrink-0">
                      {c.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{c.name}</div>
                        <div className="text-[10px] opacity-60 truncate">
                          {c.currentRole}
                          {c.currentCompany && ` · ${c.currentCompany}`}
                        </div>
                      </div>
                      {c.scoreHumano !== null && (
                        <span
                          className="text-xs font-bold font-mono shrink-0"
                          style={{ color: c.scoreHumano >= 75 ? "#10b981" : c.scoreHumano >= 60 ? "#f59e0b" : "#ef4444" }}
                          title="Score Humano"
                        >
                          {c.scoreHumano}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] opacity-70 mt-2">
                      {c.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={9} /> {c.city}
                        </span>
                      )}
                      {c.yearsExperience !== null && (
                        <span>{c.yearsExperience}a exp.</span>
                      )}
                      {c.expectedSalary !== null && (
                        <span>R$ {c.expectedSalary.toLocaleString("pt-BR")}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {(["O", "C", "E", "A", "N"] as const).map((k) => {
                        const lvl = c.bigFive[k];
                        if (!lvl) return null;
                        const high = lvl === "high" || lvl === "very_high";
                        const low = lvl === "low" || lvl === "very_low";
                        return (
                          <span
                            key={k}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{
                              background: high ? "rgba(16,185,129,0.15)" : low ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                              color: high ? "#10b981" : low ? "#ef4444" : undefined,
                            }}
                            title={`${TRAIT_LABELS[k]}: ${lvl.replace("_", " ")}`}
                          >
                            {k}
                            {high ? "↑" : low ? "↓" : "·"}
                          </span>
                        );
                      })}
                      {c.mbti && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#0ea5e9]">
                          {c.mbti}
                        </span>
                      )}
                      {c.labelGuep && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#a855f7]/10 text-[#a855f7]">
                          {c.labelGuep}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2 pt-2 border-t text-[10px] opacity-70" style={{ borderColor: "var(--border)" }}>
                      <span className="flex items-center gap-1">
                        <Briefcase size={10} /> {c.applicationCount} vaga{c.applicationCount === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList size={10} /> {c.assessmentCount} avaliaç{c.assessmentCount === 1 ? "ão" : "ões"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .filter-input {
          width: 100%;
          padding: 0.4rem 0.6rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.4rem;
          font-size: 0.75rem;
          color: var(--foreground);
        }
        .filter-input:focus {
          outline: none;
          border-color: #ff6a00;
        }
      `}</style>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider opacity-60 mb-1">{label}</span>
      {children}
    </label>
  );
}
