"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Search } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  city?: string | null;
  currentRole?: string | null;
}

export function AddCandidateButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/candidatos")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = list.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.email.toLowerCase().includes(filter.toLowerCase()),
  );

  async function add(candidateId: string) {
    setBusyId(candidateId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, candidateId, source: "manual" }),
      });
      if (!res.ok) {
        alert("Falha ao adicionar candidato");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 shadow-lg shadow-[#ff6a00]/20 shrink-0"
      >
        <UserPlus size={16} />
        Adicionar candidato
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="font-semibold">Adicionar candidato à vaga</h2>
              <button onClick={() => setOpen(false)} className="opacity-60 hover:opacity-100">
                <X size={18} />
              </button>
            </header>

            <div className="p-4">
              <div className="relative mb-3">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                />
                <input
                  autoFocus
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm"
                  style={{ background: "var(--background)", borderColor: "var(--border)" }}
                />
              </div>

              <div
                className="max-h-80 overflow-y-auto rounded-lg border"
                style={{ borderColor: "var(--border)" }}
              >
                {loading ? (
                  <div className="p-8 text-center text-sm opacity-60">Carregando...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm opacity-60">
                    {list.length === 0
                      ? "Nenhum candidato cadastrado. Cadastre um primeiro."
                      : "Nenhum candidato corresponde à busca."}
                  </div>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => add(c.id)}
                      disabled={busyId === c.id}
                      className="w-full text-left p-3 hover:bg-black/5 dark:hover:bg-white/5 border-b last:border-b-0 disabled:opacity-50"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs opacity-60">
                        {c.email}
                        {c.currentRole && ` · ${c.currentRole}`}
                        {c.city && ` · ${c.city}`}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div
                className="mt-3 pt-3 border-t text-xs opacity-60 flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}
              >
                <span>Não está na lista?</span>
                <a href="/candidatos/novo" className="text-[#ff6a00] hover:underline">
                  Cadastrar novo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
