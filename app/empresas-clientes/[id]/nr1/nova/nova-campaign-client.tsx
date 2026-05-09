"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NovaCampaignClient({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/empresas-clientes/${companyId}/nr1/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, endsAt, isAnonymous }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Falha");
        return;
      }
      const j = await res.json();
      router.push(`/empresas-clientes/${companyId}/nr1/${j.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 border rounded-xl p-6"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <Field label="Nome da campanha *">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Pesquisa NR-1 — 1º trimestre 2026"
          className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm"
          style={{ borderColor: "var(--border)" }}
        />
      </Field>
      <Field label="Descrição (mostrada ao colaborador)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Esta pesquisa é confidencial e ajuda a melhorar o ambiente de trabalho..."
          className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm resize-y"
          style={{ borderColor: "var(--border)" }}
        />
      </Field>
      <Field label="Data limite (opcional)">
        <input
          type="date"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm"
          style={{ borderColor: "var(--border)" }}
        />
      </Field>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm">
          <strong>Pesquisa anônima</strong>
          <br />
          <span className="opacity-70 text-xs">
            (Recomendado) Respostas não são vinculadas ao colaborador. Aumenta a participação e a honestidade,
            essencial pra atender NR-1.
          </span>
        </span>
      </label>
      {err && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {err}
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading || !name}
          className="px-5 py-2.5 rounded-lg font-bold text-black disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          {loading ? "Criando..." : "Criar campanha"}
        </button>
      </div>
    </form>
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
