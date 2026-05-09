import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Activity, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { companies, employees, nr1Campaigns } from "@/db/schema";
import { and, eq, count, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativa",
  closed: "Encerrada",
};
const STATUS_COLOR: Record<string, string> = {
  draft: "#71717a",
  active: "#10b981",
  closed: "#ff6a00",
};

export default async function CampanhasNR1({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await db.query.companies.findFirst({
    where: and(eq(companies.id, id), eq(companies.kind, "client")),
  });
  if (!company) notFound();

  const [{ empCount }] = await db
    .select({ empCount: count(employees.id) })
    .from(employees)
    .where(eq(employees.companyId, id));

  const list = await db
    .select()
    .from(nr1Campaigns)
    .where(eq(nr1Campaigns.companyId, id))
    .orderBy(desc(nr1Campaigns.createdAt));

  return (
    <AppShell>
      <div className="p-8 max-w-6xl">
        <Link
          href={`/empresas-clientes/${id}`}
          className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={14} /> Voltar para {company.name}
        </Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#10b981] mb-1">
              <Activity size={14} />
              <span className="text-xs uppercase tracking-wider opacity-70">NR-1 · Riscos psicossociais</span>
            </div>
            <h1 className="text-2xl font-bold">Campanhas de avaliação</h1>
            <p className="text-sm opacity-70 mt-1">
              {company.name} · {empCount} colaboradores cadastrados
            </p>
          </div>
          <Link
            href={`/empresas-clientes/${id}/nr1/nova`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-black"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            <Plus size={16} />
            Nova campanha
          </Link>
        </div>

        {Number(empCount) === 0 && (
          <div
            className="border rounded-xl p-5 mb-4 flex items-start gap-3"
            style={{ borderColor: "#f59e0b40", background: "rgba(245,158,11,0.08)" }}
          >
            <AlertCircle size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Cadastre colaboradores antes de criar campanha</p>
              <p className="text-xs opacity-80 mt-1">
                A campanha gera 1 link por colaborador. Sem colaboradores, não há quem responder.
              </p>
              <Link
                href={`/empresas-clientes/${id}/colaboradores`}
                className="inline-block mt-2 text-xs underline text-[#f59e0b]"
              >
                Abrir colaboradores →
              </Link>
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <div
            className="border rounded-xl p-12 text-center"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <Activity size={32} className="mx-auto opacity-40 mb-3" />
            <h3 className="font-semibold mb-1">Nenhuma campanha ainda</h3>
            <p className="text-sm opacity-70">Crie a primeira campanha para começar a coletar respostas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((c) => {
              const completion =
                (c.targetCount ?? 0) > 0
                  ? Math.round(((c.responseCount ?? 0) / (c.targetCount ?? 1)) * 100)
                  : 0;
              return (
                <Link
                  key={c.id}
                  href={`/empresas-clientes/${id}/nr1/${c.id}`}
                  className="block border rounded-xl p-5 hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{c.name}</h3>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                          style={{
                            color: STATUS_COLOR[c.status] || "#71717a",
                            background: `${STATUS_COLOR[c.status] || "#71717a"}20`,
                          }}
                        >
                          {STATUS_LABEL[c.status] || c.status}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-sm opacity-70 mb-2 line-clamp-2">{c.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs opacity-70 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} /> {c.targetCount ?? 0} alvo
                        </span>
                        <span className="opacity-30">·</span>
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> {c.responseCount ?? 0} respondidos
                        </span>
                        <span className="opacity-30">·</span>
                        <span>
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString("pt-BR")
                            : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="text-3xl font-bold"
                        style={{ color: "#10b981" }}
                      >
                        {completion}%
                      </div>
                      <div className="text-[10px] opacity-60">completude</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${completion}%`,
                        background: "linear-gradient(90deg, #10b981, #ffcc00)",
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
