"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Sparkles } from "lucide-react";
import { STAGES_KANBAN, STAGE_LABEL } from "@/lib/labels";

export interface KanbanCard {
  id: string;
  stage: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateCity: string | null;
  candidateRole: string | null;
  candidateAvatarUrl: string | null;
  scoreFit: number | null;
  scoreHumano: number | null;
}

const COLUMNS = [...STAGES_KANBAN, "rejected"];

export function KanbanBoard({ cards: initialCards }: { cards: KanbanCard[] }) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [error, setError] = useState("");

  const grouped: Record<string, KanbanCard[]> = {};
  for (const stage of COLUMNS) grouped[stage] = [];
  for (const c of cards) {
    if (grouped[c.stage]) grouped[c.stage].push(c);
    else grouped[c.stage] = [c];
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStage = destination.droppableId;
    // Atualização otimista
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

  return (
    <div>
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
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div
                      className="px-3 py-2.5 border-b flex items-center justify-between"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                        <span className="font-semibold text-xs uppercase tracking-wider">{meta.label}</span>
                      </div>
                      <span className="text-[10px] opacity-60 font-mono">{list.length}</span>
                    </div>

                    <div
                      className="p-2 space-y-2 overflow-y-auto"
                      style={{ maxHeight: "calc(100vh - 260px)" }}
                    >
                      {list.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-6 text-[10px] opacity-40">
                          arraste para cá
                        </div>
                      )}

                      {list.map((card, idx) => (
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
                              }}
                            >
                              <div className="flex items-start gap-2">
                                {card.candidateAvatarUrl ? (
                                  <img
                                    src={card.candidateAvatarUrl}
                                    alt=""
                                    className="w-8 h-8 rounded-lg shrink-0"
                                  />
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
                      ))}
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
