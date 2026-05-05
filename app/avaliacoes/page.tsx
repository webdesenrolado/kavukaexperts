import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { assessments, candidates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ClipboardList, ExternalLink, AlertTriangle } from "lucide-react";

async function listAssessments() {
  return db
    .select({
      id: assessments.id,
      instrument: assessments.instrument,
      version: assessments.instrumentVersion,
      status: assessments.status,
      channel: assessments.channel,
      candidateId: assessments.candidateId,
      candidateName: candidates.name,
      qualityFlagsJson: assessments.qualityFlagsJson,
      createdAt: assessments.createdAt,
      completedAt: assessments.completedAt,
    })
    .from(assessments)
    .leftJoin(candidates, eq(assessments.candidateId, candidates.id))
    .orderBy(desc(assessments.createdAt));
}

const STATUS_COLOR: Record<string, string> = {
  completed: "#10b981",
  in_progress: "#f59e0b",
  pending: "#6b7280",
  invalidated: "#ef4444",
};

export default async function AvaliacoesPage() {
  const list = await listAssessments();

  return (
    <AppShell>
      <div className="p-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
          <p className="opacity-70 mt-1">
            Histórico de aplicações de microsserviços de avaliação comportamental.
          </p>
        </header>

        {list.length === 0 ? (
          <div
            className="p-12 rounded-xl border text-center"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <ClipboardList size={36} className="mx-auto opacity-30 mb-3" />
            <h2 className="text-lg font-semibold">Nenhuma avaliação aplicada</h2>
            <p className="opacity-70 text-sm mt-1 mb-5">
              Aplique a primeira avaliação a partir do perfil de um candidato.
            </p>
            <Link
              href="/candidatos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00]"
            >
              Ir para candidatos
            </Link>
          </div>
        ) : (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid var(--border)` }}>
                  <th className="text-left p-3 font-medium text-xs uppercase tracking-wider opacity-60">
                    Candidato
                  </th>
                  <th className="text-left p-3 font-medium text-xs uppercase tracking-wider opacity-60">
                    Instrumento
                  </th>
                  <th className="text-left p-3 font-medium text-xs uppercase tracking-wider opacity-60">
                    Status
                  </th>
                  <th className="text-left p-3 font-medium text-xs uppercase tracking-wider opacity-60">
                    Qualidade
                  </th>
                  <th className="text-left p-3 font-medium text-xs uppercase tracking-wider opacity-60">
                    Data
                  </th>
                  <th className="text-right p-3 font-medium text-xs uppercase tracking-wider opacity-60">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const flags = a.qualityFlagsJson ? (JSON.parse(a.qualityFlagsJson) as string[]) : [];
                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ borderBottom: `1px solid var(--border)` }}
                    >
                      <td className="p-3">
                        {a.candidateName ? (
                          <Link href={`/candidatos/${a.candidateId}`} className="font-medium hover:underline">
                            {a.candidateName}
                          </Link>
                        ) : (
                          <span className="opacity-40">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-xs">{a.instrument}</div>
                        <div className="text-[10px] opacity-60">v{a.version}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            background: `${STATUS_COLOR[a.status] || "#6b7280"}1a`,
                            color: STATUS_COLOR[a.status] || "#6b7280",
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {flags.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-500">
                            <AlertTriangle size={11} /> {flags.length} flag{flags.length === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-40">limpa</span>
                        )}
                      </td>
                      <td className="p-3 text-xs opacity-70">
                        {a.completedAt
                          ? new Date(a.completedAt).toLocaleDateString("pt-BR")
                          : a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td className="p-3 text-right">
                        {a.status === "completed" && a.candidateId && (
                          <Link
                            href={`/candidatos/${a.candidateId}/avaliacoes/${a.id}`}
                            className="inline-flex items-center gap-1 text-xs text-[#ff6a00] hover:underline"
                          >
                            Super Trunfo <ExternalLink size={10} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
