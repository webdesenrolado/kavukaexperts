"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { MapPin, Sparkles, Briefcase } from "lucide-react";
import { STAGES_KANBAN, STAGE_LABEL } from "@/lib/labels";

export interface GlobalCard {
  id: string;
  stage: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateCity: string | null;
  candidateRole: string | null;
  candidateAvatarUrl: string | null;
  scoreFit: number | null;
  scoreHumano: number | null;
}

export interface JobOption {
  id: string;
  title: string;
  companyName: string | null;
  candidateCount: number;
}

const COLUMNS = [...STAGES_KANBAN, "rejected"];

const JOB_COLORS = ["#ff6a00", "#0ea5e9", "#10b981", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export function GlobalKanbanClient({
  cards: initialCards,
  jobs,
  initialFilter,
}: {
  cards: GlobalCard[];
  jobs: JobOption[];
  initialFilter: string;
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [filter, setFilter] = useState(initialFilter);
  const [error, setError] = useState("");

  // Mapeia jobId → cor (consistente)
  const jobColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    jobs.forEach((j, i) => {
      m[j.id] = JOB_COLORS[i % JOB_COLORS.length];
    });
    return m;
  }, [jobs]);

  const filteredCards = useMemo(() => {
    if (filter === "all") return cards;
    return cards.filter((c) => c.jobId === filter);
  }, [cards, filter]);

  const grouped: Record<string, GlobalCard[]> = {};
  for (const stage of COLUMNS) grouped[stage] = [];
  for (const c of filteredCards) {
    if (grouped[c.stage]) grouped[c.stage].push(c);
    else grouped[c.stage] = [c];
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStage = destination.droppableId;
    setCards((prev) => prev.map((c) => (c.id === draggableId ? { ...c, stage: newStage } : c)));

    try {
      const res = await fetch(`/api/applications/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) {
        setError("Falha ao mover. Recarregando...");
        setTimeout(() => router.refresh(), 800);
      }
    } catch {
      setError("Sem conexão. Recarregando...");
      setTimeout(() => router.refresh(), 800);
    }
  }

  function selectFilter(jobId: string) {
    setFilter(jobId);
    const url = new URL(window.location.href);
    if (jobId === "all") url.searchParams.delete("vaga");
    else url.searchParams.set("vaga", jobId);
    window.history.replaceState(null, "", url.pathname + url.search);
  }

  // Contadores agregados (sobre os cards filtrados)
  const stageCounts: Record<string, number> = {};
  for (const stage of COLUMNS) stageCounts[stage] = 0;
  for (const c of filteredCards) {
    stageCounts[c.stage] = (stageCounts[c.stage] ?? 0) + 1;
  }

  return (
    <div>
      {/* CONTADORES POR ETAPA — destaque no topo */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-5">
        {COLUMNS.slice(0, 7).map((stage) => {
          const meta = STAGE_LABEL[stage];
          const count = stageCounts[stage] ?? 0;
          return (
            <div
              key={stage}
              className="p-3 rounded-xl border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                opacity: count === 0 ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-[10px] uppercase tracking-wider opacity-60">{meta.label}</span>
              </div>
              <div className="text-3xl font-black" style={{ color: count > 0 ? meta.color : undefined }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtro de vagas */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => selectFilter("all")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 ${
            filter === "all" ? "bg-[#ff6a00] text-black border-[#ff6a00] font-bold" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
          style={{ borderColor: filter === "all" ? "#ff6a00" : "var(--border)" }}
        >
          <Briefcase size={11} /> Todas
          <span className="opacity-70">({cards.length})</span>
        </button>
        {jobs.map((j) => {
          const active = filter === j.id;
          const color = jobColorMap[j.id];
          return (
            <button
              key={j.id}
              onClick={() => selectFilter(j.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 ${
                active ? "font-bold text-white" : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              style={{
                background: active ? color : "transparent",
                borderColor: color,
                color: active ? "#fff" : undefined,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#fff" : color }} />
              {j.title}
              <span className="opacity-70">({j.candidateCount})</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-3 p-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
          {error}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
          {COLUMNS.map((stage) => {
            const meta = STAGE_LABEL[stage];
            const list = grouped[stage] || [];
            return (
              <Droppable droppableId={stage} key={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`shrink-0 w-72 rounded-xl border ${snapshot.isDraggingOver ? "ring-2 ring-[#ff6a00]/40" : ""}`}
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                  >
                    <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                        <span className="font-semibold text-xs uppercase tracking-wider">{meta.label}</span>
                      </div>
                      <span className="text-[10px] opacity-60 font-mono">{list.length}</span>
                    </div>

                    <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
                      {list.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-6 text-[10px] opacity-40">vazio</div>
                      )}

                      {list.map((card, idx) => {
                        const jobColor = jobColorMap[card.jobId];
                        return (
                          <Draggable draggableId={card.id} index={idx} key={card.id}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`p-3 rounded-lg border bg-[var(--background)] ${snap.isDragging ? "shadow-2xl ring-2 ring-[#ff6a00]/50 rotate-2" : "hover:border-[#ff6a00]/40"}`}
                                style={{
                                  ...prov.draggableProps.style,
                                  borderColor: snap.isDragging ? "#ff6a00" : "var(--border)",
                                  borderLeft: `3px solid ${jobColor}`,
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  {card.candidateAvatarUrl ? (
                                    <img src={card.candidateAvatarUrl} alt="" className="w-8 h-8 rounded-lg shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center text-[10px] font-bold opacity-70 shrink-0">
                                      {card.candidateName[0]}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      href={`/candidatos/${card.candidateId}`}
                                      className="font-semibold text-xs truncate block hover:text-[#ff6a00]"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {card.candidateName}
                                    </Link>
                                    {card.candidateRole && (
                                      <div className="text-[10px] opacity-60 truncate">{card.candidateRole}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Vaga (sempre mostra) */}
                                <Link
                                  href={`/vagas/${card.jobId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="block mt-2 text-[10px] truncate font-medium hover:underline"
                                  style={{ color: jobColor }}
                                  title={card.jobTitle}
                                >
                                  · {card.jobTitle}
                                </Link>

                                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t text-[10px]" style={{ borderColor: "var(--border)" }}>
                                  {card.candidateCity ? (
                                    <span className="inline-flex items-center gap-1 opacity-70">
                                      <MapPin size={9} /> {card.candidateCity}
                                    </span>
                                  ) : (
                                    <span className="opacity-40">—</span>
                                  )}
                                  <div className="flex items-center gap-2">
                                    {card.scoreFit !== null && (
                                      <span title="Fit vaga-pessoa" className="font-mono">
                                        <span className="opacity-50">F</span>{" "}
                                        <span style={{ color: card.scoreFit >= 75 ? "#10b981" : card.scoreFit >= 60 ? "#f59e0b" : "#ef4444" }}>
                                          {card.scoreFit}
                                        </span>
                                      </span>
                                    )}
                                    {card.scoreHumano !== null && (
                                      <span title="Score Humano" className="font-mono font-bold">
                                        <Sparkles size={9} className="inline" />{" "}
                                        <span style={{ color: card.scoreHumano >= 75 ? "#10b981" : card.scoreHumano >= 60 ? "#f59e0b" : "#ef4444" }}>
                                          {card.scoreHumano}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
