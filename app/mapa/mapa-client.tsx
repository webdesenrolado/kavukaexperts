"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Map as MapIcon,
  Briefcase,
  Users,
  Flame,
  MapPin,
  X,
  Filter,
} from "lucide-react";

const MapInner = dynamic(() => import("./map-inner").then((m) => m.MapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-sm opacity-60">
      Carregando mapa...
    </div>
  ),
});

type Company = {
  id: string;
  name: string;
  lat: string | null;
  lng: string | null;
  city: string | null;
  state: string | null;
};

type Job = {
  id: string;
  title: string;
  companyId: string;
};

type Candidate = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  lat: string | null;
  lng: string | null;
};

type Application = {
  candidateId: string;
  jobId: string;
  stage: string;
};

export function MapaClient({
  companies,
  jobs,
  candidates,
  applications,
}: {
  companies: Company[];
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
}) {
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showCandidates, setShowCandidates] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [showLines, setShowLines] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const candidatesByJob = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of applications) {
      if (!map.has(a.jobId)) map.set(a.jobId, new Set());
      map.get(a.jobId)!.add(a.candidateId);
    }
    return map;
  }, [applications]);

  const jobsByCandidate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of applications) {
      if (!map.has(a.candidateId)) map.set(a.candidateId, []);
      map.get(a.candidateId)!.push(a.jobId);
    }
    return map;
  }, [applications]);

  const candidateCountByJob = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of applications) m.set(a.jobId, (m.get(a.jobId) || 0) + 1);
    return m;
  }, [applications]);

  // Filtra candidatos: se tem vaga selecionada, mostra só os dela
  const filteredCandidates = useMemo(() => {
    let list = candidates;
    if (selectedJobIds.size > 0) {
      const allowed = new Set<string>();
      for (const jobId of selectedJobIds) {
        const set = candidatesByJob.get(jobId);
        if (set) for (const c of set) allowed.add(c);
      }
      list = list.filter((c) => allowed.has(c.id));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.state?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [candidates, selectedJobIds, candidatesByJob, search]);

  function toggleJob(id: string) {
    const ns = new Set(selectedJobIds);
    if (ns.has(id)) ns.delete(id);
    else ns.add(id);
    setSelectedJobIds(ns);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div
        className="px-6 py-3 border-b flex items-center gap-4 flex-wrap"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="flex items-center gap-2">
          <MapIcon size={18} className="text-[#ff6a00]" />
          <h1 className="font-bold text-lg">Mapa de talentos</h1>
        </div>

        <div className="flex items-center gap-2 text-xs opacity-80">
          <span className="inline-flex items-center gap-1">
            <Users size={12} /> {filteredCandidates.length} candidatos
          </span>
          <span className="opacity-30">·</span>
          <span className="inline-flex items-center gap-1">
            <Briefcase size={12} /> {selectedJobIds.size || jobs.length} vagas
          </span>
          <span className="opacity-30">·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> {candidates.length} geocodificados de {jobsByCandidate.size}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ToggleBtn
            active={showHeatmap}
            onClick={() => setShowHeatmap(!showHeatmap)}
            icon={<Flame size={13} />}
            label="Heatmap"
          />
          <ToggleBtn
            active={showCandidates}
            onClick={() => setShowCandidates(!showCandidates)}
            icon={<Users size={13} />}
            label="Pontos"
          />
          <ToggleBtn
            active={showCompanies}
            onClick={() => setShowCompanies(!showCompanies)}
            icon={<Briefcase size={13} />}
            label="Empresas"
          />
          <ToggleBtn
            active={showLines}
            onClick={() => setShowLines(!showLines)}
            disabled={selectedJobIds.size === 0}
            icon={<span style={{ fontSize: 12 }}>↔</span>}
            label="Linhas"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar de filtros */}
        {!collapsed && (
          <aside
            className="w-72 border-r flex flex-col min-h-0"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider opacity-60 flex items-center gap-1">
                  <Filter size={11} /> Filtros
                </span>
                <button
                  onClick={() => setCollapsed(true)}
                  className="opacity-60 hover:opacity-100 text-xs"
                  title="Recolher"
                >
                  «
                </button>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou cidade..."
                className="w-full px-3 py-2 rounded-md border bg-transparent text-sm"
                style={{ borderColor: "var(--border)" }}
              />
              {selectedJobIds.size > 0 && (
                <button
                  onClick={() => setSelectedJobIds(new Set())}
                  className="mt-2 text-xs opacity-70 hover:opacity-100 flex items-center gap-1"
                >
                  <X size={11} /> Limpar {selectedJobIds.size} vaga(s)
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-wider opacity-60 mb-2">
                  Vagas ({jobs.length})
                </div>
                <div className="space-y-1">
                  {jobs.map((j) => {
                    const count = candidateCountByJob.get(j.id) || 0;
                    const active = selectedJobIds.has(j.id);
                    return (
                      <button
                        key={j.id}
                        onClick={() => toggleJob(j.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between gap-2 transition-colors ${
                          active
                            ? "bg-[#ff6a00]/15 border-[#ff6a00]/40"
                            : "hover:bg-black/5 dark:hover:bg-white/5 border-transparent"
                        } border`}
                      >
                        <span className="truncate">{j.title}</span>
                        <span
                          className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded ${
                            active ? "bg-[#ff6a00] text-black" : "bg-black/10 dark:bg-white/10"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="px-2 py-3 border-r hover:bg-white/5 text-xs"
            style={{ borderColor: "var(--border)" }}
            title="Expandir filtros"
          >
            »
          </button>
        )}

        {/* Mapa */}
        <div className="flex-1 relative min-h-0">
          <MapInner
            companies={showCompanies ? companies : []}
            candidates={showCandidates ? filteredCandidates : []}
            heatPoints={showHeatmap ? filteredCandidates : []}
            selectedJobIds={selectedJobIds}
            applications={applications}
            showLines={showLines}
          />

          {filteredCandidates.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="text-sm opacity-70 px-4 py-2 rounded-md"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                Nenhum candidato com geo + filtros aplicados
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 border transition-colors disabled:opacity-30 ${
        active
          ? "border-[#ff6a00]/40 bg-[#ff6a00]/15 text-[#ff6a00]"
          : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
      }`}
      style={!active ? { borderColor: "var(--border)" } : undefined}
    >
      {icon}
      {label}
    </button>
  );
}
