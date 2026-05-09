"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  RefreshCw,
  Send,
  Users,
  TrendingUp,
} from "lucide-react";

type Aggregate = {
  company: { id: string; name: string };
  campaign: any;
  counts: { total: number; opened: number; completed: number; completionRate: number };
  overall: { score: number | null; bandDist: { high: number; medium: number; low: number } };
  dimensions: Array<{ key: string; label: string; description: string; score: number | null }>;
  perQuestion: Array<{ id: string; text: string; dimension: string; dist: number[] }>;
  byDepartment: Array<{
    department: string;
    count: number;
    flags: number;
    scores: Record<string, number | null>;
  }>;
  alerts: Array<{
    id: string;
    department: string | null;
    role: string | null;
    flags: string[];
    submittedAt: string;
  }>;
  comments: Array<{
    id: string;
    department: string | null;
    role: string | null;
    ageBand: string | null;
    comment: string;
    submittedAt: string;
    riskBand: string | null;
  }>;
};

const DIM_COLORS: Record<string, string> = {
  demandas: "#ef4444",
  autonomia: "#3b82f6",
  lideranca: "#8b5cf6",
  risco: "#f59e0b",
  bemestar: "#10b981",
};

export function CampaignDashboardClient({
  companyId,
  campaignId,
}: {
  companyId: string;
  campaignId: string;
}) {
  const [data, setData] = useState<Aggregate | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<"overview" | "links" | "details">("overview");

  async function refresh() {
    setBusy(true);
    try {
      const [agg, detail] = await Promise.all([
        fetch(`/api/empresas-clientes/${companyId}/nr1/campaigns/${campaignId}/aggregate`).then((r) =>
          r.json()
        ),
        fetch(`/api/empresas-clientes/${companyId}/nr1/campaigns/${campaignId}`).then((r) => r.json()),
      ]);
      setData(agg);
      setCampaignDetail(detail);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [campaignId]);

  async function generateTokens() {
    setGenerating(true);
    try {
      const res = await fetch(
        `/api/empresas-clientes/${companyId}/nr1/campaigns/${campaignId}/generate-tokens`,
        { method: "POST" }
      );
      if (res.ok) await refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function changeStatus(status: "active" | "closed") {
    await fetch(`/api/empresas-clientes/${companyId}/nr1/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
  }

  if (!data || busy) {
    return <div className="opacity-60 text-sm">Carregando dashboard...</div>;
  }

  const { counts, overall, dimensions } = data;
  const noResponses = counts.completed === 0;
  const noLinks = counts.total === 0;

  return (
    <div>
      {/* Tabs */}
      <div
        className="flex gap-1 border-b mb-5"
        style={{ borderColor: "var(--border)" }}
      >
        {[
          { key: "overview" as const, label: "Visão geral" },
          { key: "links" as const, label: `Links (${counts.total})` },
          { key: "details" as const, label: "Por departamento e perguntas" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#10b981] text-[#10b981]"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={refresh}
            className="opacity-60 hover:opacity-100 p-2"
            title="Atualizar"
          >
            <RefreshCw size={14} />
          </button>
          {campaignDetail?.campaign?.status === "active" ? (
            <button
              onClick={() => changeStatus("closed")}
              className="text-xs px-3 py-1.5 rounded-md border hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              Encerrar campanha
            </button>
          ) : (
            <button
              onClick={() => changeStatus("active")}
              className="text-xs px-3 py-1.5 rounded-md text-[#10b981] border border-[#10b981]/30"
            >
              Reativar
            </button>
          )}
        </div>
      </div>

      {tab === "overview" && (
        <Overview
          data={data}
          noResponses={noResponses}
          noLinks={noLinks}
          onGenerate={generateTokens}
          generating={generating}
        />
      )}

      {tab === "links" && (
        <LinksTab
          companyId={companyId}
          campaignId={campaignId}
          campaignDetail={campaignDetail}
          companyName={data.company.name}
          campaignName={data.campaign.name}
          onGenerate={generateTokens}
          generating={generating}
          onRefresh={refresh}
        />
      )}

      {tab === "details" && <DetailsTab data={data} />}
    </div>
  );
}

function Overview({
  data,
  noResponses,
  noLinks,
  onGenerate,
  generating,
}: {
  data: Aggregate;
  noResponses: boolean;
  noLinks: boolean;
  onGenerate: () => void;
  generating: boolean;
}) {
  const { counts, overall, dimensions, alerts, comments } = data;

  return (
    <div className="space-y-5">
      {/* Estado vazio: sem links */}
      {noLinks && (
        <div
          className="border rounded-xl p-6 flex items-start justify-between gap-4 flex-wrap"
          style={{
            borderColor: "rgba(16,185,129,0.4)",
            background: "rgba(16,185,129,0.06)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Send size={16} className="text-[#10b981]" />
              <h3 className="font-bold">Gere os links da campanha</h3>
            </div>
            <p className="text-sm opacity-80">
              Crie 1 link único por colaborador ativo. Você copia/baixa esses links e envia por
              email, WhatsApp ou outra forma — a campanha só rola depois disso.
            </p>
          </div>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="px-4 py-2.5 rounded-lg font-bold text-black disabled:opacity-50 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            {generating ? "Gerando..." : "Gerar links agora"}
          </button>
        </div>
      )}

      {/* Estado vazio: sem respostas */}
      {!noLinks && noResponses && (
        <div
          className="border rounded-xl p-5"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <p className="text-sm opacity-80">
            <strong>{counts.total} links gerados</strong>, aguardando respostas. Vá pra aba{" "}
            <strong>Links</strong> pra copiar e distribuir.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Convites" value={counts.total.toString()} sub="links gerados" color="#71717a" />
        <Stat
          label="Abertos"
          value={counts.opened.toString()}
          sub={`${counts.total > 0 ? Math.round((counts.opened / counts.total) * 100) : 0}% acessaram`}
          color="#3b82f6"
        />
        <Stat
          label="Completados"
          value={counts.completed.toString()}
          sub={`${counts.completionRate}% taxa`}
          color="#10b981"
          big
        />
        <Stat
          label="Score geral"
          value={overall.score !== null ? `${overall.score}` : "—"}
          sub={overall.score !== null ? `${overall.score >= 75 ? "saudável" : overall.score >= 50 ? "moderado" : "crítico"}` : "aguardando"}
          color={
            overall.score === null
              ? "#71717a"
              : overall.score >= 75
                ? "#10b981"
                : overall.score >= 50
                  ? "#f59e0b"
                  : "#ef4444"
          }
          big
        />
      </div>

      {/* Cards das 5 dimensões */}
      <div>
        <h3 className="text-sm uppercase tracking-wider opacity-60 mb-3">5 dimensões NR-1</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {dimensions.map((d) => (
            <DimensionCard key={d.key} dim={d} />
          ))}
        </div>
      </div>

      {/* Distribuição banda de risco */}
      {!noResponses && (
        <div>
          <h3 className="text-sm uppercase tracking-wider opacity-60 mb-3">
            Distribuição de risco entre respondentes
          </h3>
          <div
            className="border rounded-xl p-5"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <div className="flex h-6 rounded-md overflow-hidden mb-3">
              {overall.bandDist.high > 0 && (
                <div
                  style={{
                    width: `${(overall.bandDist.high / counts.completed) * 100}%`,
                    background: "#ef4444",
                  }}
                  title={`Alto: ${overall.bandDist.high}`}
                />
              )}
              {overall.bandDist.medium > 0 && (
                <div
                  style={{
                    width: `${(overall.bandDist.medium / counts.completed) * 100}%`,
                    background: "#f59e0b",
                  }}
                  title={`Médio: ${overall.bandDist.medium}`}
                />
              )}
              {overall.bandDist.low > 0 && (
                <div
                  style={{
                    width: `${(overall.bandDist.low / counts.completed) * 100}%`,
                    background: "#10b981",
                  }}
                  title={`Saudável: ${overall.bandDist.low}`}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <Legend color="#ef4444" label={`Alto risco: ${overall.bandDist.high}`} />
              <Legend color="#f59e0b" label={`Médio: ${overall.bandDist.medium}`} />
              <Legend color="#10b981" label={`Saudável: ${overall.bandDist.low}`} />
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {alerts.length > 0 && (
        <div>
          <h3 className="text-sm uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#ef4444]" />
            Alertas obrigatórios — assédio/discriminação ({alerts.length})
          </h3>
          <div
            className="border border-[#ef4444]/40 rounded-xl p-4"
            style={{ background: "rgba(239,68,68,0.05)" }}
          >
            <p className="text-xs opacity-80 mb-3">
              Respostas marcaram presença ou ocorrência de assédio/discriminação (Q10 ≥ "Às vezes"). Conforme NR-1,
              estas situações exigem investigação e tratativa formal.
            </p>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 text-xs px-3 py-2 rounded-md"
                  style={{ background: "rgba(239,68,68,0.08)" }}
                >
                  <span className="opacity-90">
                    {a.department || "Departamento não informado"}
                    {a.role && ` · ${a.role}`}
                  </span>
                  <span className="opacity-60 font-mono">
                    {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("pt-BR") : ""}
                  </span>
                </div>
              ))}
              {alerts.length > 5 && (
                <p className="text-xs opacity-60 pt-2">+{alerts.length - 5} alertas</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comentários */}
      {comments.length > 0 && (
        <div>
          <h3 className="text-sm uppercase tracking-wider opacity-60 mb-3">
            Comentários ({comments.length})
          </h3>
          <div className="space-y-2">
            {comments.slice(0, 6).map((c) => {
              const bandColor =
                c.riskBand === "high"
                  ? "#ef4444"
                  : c.riskBand === "medium"
                    ? "#f59e0b"
                    : "#10b981";
              return (
                <div
                  key={c.id}
                  className="border rounded-lg p-4"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2 text-[10px] opacity-60">
                    <span>
                      {c.department || "—"}
                      {c.role && ` · ${c.role}`}
                      {c.ageBand && ` · ${c.ageBand}`}
                    </span>
                    {c.riskBand && (
                      <span
                        className="px-1.5 py-0.5 rounded font-bold uppercase"
                        style={{
                          color: bandColor,
                          background: `${bandColor}20`,
                        }}
                      >
                        {c.riskBand === "high" ? "alto risco" : c.riskBand === "medium" ? "médio" : "saudável"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{c.comment}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LinksTab({
  companyId,
  campaignId,
  campaignDetail,
  companyName,
  campaignName,
  onGenerate,
  generating,
  onRefresh,
}: {
  companyId: string;
  campaignId: string;
  campaignDetail: any;
  companyName: string;
  campaignName: string;
  onGenerate: () => void;
  generating: boolean;
  onRefresh: () => void;
}) {
  const invs: any[] = campaignDetail?.invitations || [];
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  function copy(token: string) {
    navigator.clipboard.writeText(`${baseUrl}/nr1/${token}`);
  }

  function copyAll() {
    const text = invs.map((i) => `${i.email || i.phone || ""}\t${baseUrl}/nr1/${i.token}`).join("\n");
    navigator.clipboard.writeText(text);
  }

  function downloadCsv() {
    const header = "email,telefone,canal,link,status\n";
    const rows = invs
      .map(
        (i) =>
          `"${i.email || ""}","${i.phone || ""}","${i.channel || ""}","${baseUrl}/nr1/${i.token}","${
            i.completedAt ? "respondeu" : i.openedAt ? "abriu" : "pendente"
          }"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nr1-${campaignName.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function whatsappLink(phone: string, link: string) {
    const msg = encodeURIComponent(
      `Olá! A ${companyName} convidou você pra responder uma pesquisa rápida sobre saúde mental no trabalho (NR-1). É anônima e leva ~5min:\n\n${link}\n\nObrigado!`
    );
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <p className="text-sm opacity-70">
          {invs.length} link{invs.length === 1 ? "" : "s"} gerado{invs.length === 1 ? "" : "s"} ·{" "}
          {invs.filter((i) => i.completedAt).length} respondidos
        </p>
        <div className="flex items-center gap-2 text-xs">
          {invs.length > 0 && (
            <>
              <button
                onClick={copyAll}
                className="px-3 py-1.5 rounded-md border flex items-center gap-1"
                style={{ borderColor: "var(--border)" }}
              >
                <Copy size={11} /> Copiar todos
              </button>
              <button
                onClick={downloadCsv}
                className="px-3 py-1.5 rounded-md border flex items-center gap-1"
                style={{ borderColor: "var(--border)" }}
              >
                <Download size={11} /> Baixar CSV
              </button>
            </>
          )}
          <button
            onClick={onGenerate}
            disabled={generating}
            className="px-3 py-1.5 rounded-md font-bold text-black text-xs flex items-center gap-1 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            <Users size={11} /> {generating ? "..." : "Gerar links faltantes"}
          </button>
        </div>
      </div>

      {invs.length === 0 ? (
        <div
          className="border rounded-xl p-12 text-center"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <p className="text-sm opacity-60">
            Nenhum link ainda. Clique em "Gerar links" pra criar 1 link por colaborador ativo.
          </p>
        </div>
      ) : (
        <div
          className="border rounded-xl overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <table className="w-full text-sm">
            <thead style={{ background: "rgba(255,255,255,0.03)" }}>
              <tr className="text-left text-[10px] uppercase tracking-wider opacity-60">
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3 hidden md:table-cell">Status</th>
                <th className="px-4 py-3 w-1/2">Link</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {invs.map((i) => {
                const link = `${baseUrl}/nr1/${i.token}`;
                const status = i.completedAt
                  ? { label: "Respondeu", color: "#10b981" }
                  : i.openedAt
                    ? { label: "Abriu", color: "#3b82f6" }
                    : { label: "Pendente", color: "#71717a" };
                return (
                  <tr
                    key={i.id}
                    className="border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-4 py-3 text-xs">
                      <div className="font-medium">{i.email || "—"}</div>
                      {i.phone && <div className="opacity-60">{i.phone}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                        style={{ color: status.color, background: `${status.color}20` }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="font-mono text-[10px] truncate opacity-70 max-w-md"
                        title={link}
                      >
                        {link}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copy(i.token)}
                          className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-xs"
                          title="Copiar link"
                        >
                          <Copy size={11} />
                        </button>
                        {i.phone && (
                          <a
                            href={whatsappLink(i.phone, link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded hover:bg-[#25d366]/10 hover:text-[#25d366] text-xs"
                            title="Abrir WhatsApp"
                          >
                            WA
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DetailsTab({ data }: { data: Aggregate }) {
  const { byDepartment, perQuestion } = data;

  return (
    <div className="space-y-6">
      {/* Heatmap por depto x dimensão */}
      {byDepartment.length > 0 && (
        <div>
          <h3 className="text-sm uppercase tracking-wider opacity-60 mb-3">
            Heatmap por departamento (média 0-100, saudável → verde)
          </h3>
          <div
            className="border rounded-xl overflow-x-auto"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <table className="w-full text-xs">
              <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                <tr>
                  <th className="px-3 py-2 text-left">Departamento</th>
                  <th className="px-3 py-2 text-center">N</th>
                  <th className="px-3 py-2 text-center">Demandas</th>
                  <th className="px-3 py-2 text-center">Autonomia</th>
                  <th className="px-3 py-2 text-center">Liderança</th>
                  <th className="px-3 py-2 text-center">Risco</th>
                  <th className="px-3 py-2 text-center">Bem-estar</th>
                  <th className="px-3 py-2 text-center">Alertas</th>
                </tr>
              </thead>
              <tbody>
                {byDepartment.map((d) => (
                  <tr key={d.department} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-3 py-2 font-medium">{d.department}</td>
                    <td className="px-3 py-2 text-center opacity-70">{d.count}</td>
                    <HeatCell value={d.scores.demandas} />
                    <HeatCell value={d.scores.autonomia} />
                    <HeatCell value={d.scores.lideranca} />
                    <HeatCell value={d.scores.risco} />
                    <HeatCell value={d.scores.bemestar} />
                    <td className="px-3 py-2 text-center">
                      {d.flags > 0 ? (
                        <span className="text-[#ef4444] font-bold">⚠ {d.flags}</span>
                      ) : (
                        <span className="opacity-30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribuição Likert por pergunta */}
      <div>
        <h3 className="text-sm uppercase tracking-wider opacity-60 mb-3">
          Distribuição de respostas por pergunta
        </h3>
        <div className="space-y-2">
          {perQuestion.map((q) => {
            const total = q.dist.reduce((a, b) => a + b, 0);
            return (
              <div
                key={q.id}
                className="border rounded-lg p-3"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs leading-snug">{q.text}</p>
                  <span className="text-[10px] opacity-50 shrink-0 font-mono">{total} resp.</span>
                </div>
                <div className="flex h-4 rounded overflow-hidden">
                  {q.dist.map((n, i) => {
                    if (n === 0) return null;
                    const colors = ["#ef4444", "#f97316", "#facc15", "#84cc16", "#10b981"];
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-center text-[9px] font-bold text-black"
                        style={{
                          width: `${(n / total) * 100}%`,
                          background: colors[i],
                        }}
                        title={`Nota ${i + 1}: ${n}`}
                      >
                        {n > 0 && (n / total) * 100 > 8 ? n : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeatCell({ value }: { value: number | null }) {
  if (value === null) {
    return <td className="px-3 py-2 text-center opacity-30">—</td>;
  }
  // Color: low score (0) = vermelho, mid (50) = amarelo, high (100) = verde
  const color =
    value < 50 ? "#ef4444" : value < 75 ? "#f59e0b" : "#10b981";
  const bg = value < 50 ? "rgba(239,68,68,0.18)" : value < 75 ? "rgba(245,158,11,0.18)" : "rgba(16,185,129,0.18)";
  return (
    <td
      className="px-3 py-2 text-center font-mono font-bold"
      style={{ color, background: bg }}
    >
      {value}
    </td>
  );
}

function Stat({
  label,
  value,
  sub,
  color,
  big = false,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  big?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">{label}</div>
      <div className={`font-bold ${big ? "text-3xl" : "text-xl"}`} style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>
    </div>
  );
}

function DimensionCard({
  dim,
}: {
  dim: { key: string; label: string; description: string; score: number | null };
}) {
  const color = DIM_COLORS[dim.key] || "#71717a";
  const bandColor =
    dim.score === null
      ? "#71717a"
      : dim.score >= 75
        ? "#10b981"
        : dim.score >= 50
          ? "#f59e0b"
          : "#ef4444";
  return (
    <div
      className="border rounded-xl p-4"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider opacity-70">{dim.label}</span>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      </div>
      <div className="text-2xl font-bold" style={{ color: bandColor }}>
        {dim.score !== null ? dim.score : "—"}
      </div>
      <p className="text-[10px] opacity-60 mt-2 leading-snug">{dim.description}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
