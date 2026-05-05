import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { jobs, companies, applications, candidates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ArrowLeft, KanbanSquare, Briefcase, Building2 } from "lucide-react";
import { JOB_STATUS_LABEL } from "@/lib/labels";
import { KanbanBoard, type KanbanCard } from "./board";

async function getJob(id: string) {
  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, id) });
  if (!job) return null;
  const company = job.companyId
    ? await db.query.companies.findFirst({ where: eq(companies.id, job.companyId) })
    : null;
  const apps = await db
    .select({
      id: applications.id,
      stage: applications.stage,
      scoreFit: applications.scoreFit,
      scoreHumano: applications.scoreHumano,
      candidateId: applications.candidateId,
      candidateName: candidates.name,
      candidateEmail: candidates.email,
      candidateCity: candidates.city,
      candidateAvatarUrl: candidates.avatarUrl,
      candidateRole: candidates.currentRole,
    })
    .from(applications)
    .leftJoin(candidates, eq(applications.candidateId, candidates.id))
    .where(eq(applications.jobId, id))
    .orderBy(desc(applications.scoreHumano));
  return { job, company, applications: apps };
}

export default async function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getJob(id);
  if (!data) notFound();

  const { job, company, applications: apps } = data;
  const status = JOB_STATUS_LABEL[job.status] || JOB_STATUS_LABEL.draft;

  const cards: KanbanCard[] = apps.map((a) => ({
    id: a.id,
    stage: a.stage,
    candidateId: a.candidateId,
    candidateName: a.candidateName ?? "Candidato",
    candidateEmail: a.candidateEmail ?? "",
    candidateCity: a.candidateCity ?? null,
    candidateRole: a.candidateRole ?? null,
    candidateAvatarUrl: a.candidateAvatarUrl ?? null,
    scoreFit: a.scoreFit ?? null,
    scoreHumano: a.scoreHumano ?? null,
  }));

  return (
    <AppShell>
      <div className="p-6 max-w-[1800px]">
        <Link href={`/vagas/${id}`} className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-3">
          <ArrowLeft size={14} /> Voltar para vaga
        </Link>

        <header className="mb-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: `${status.color}1a`, color: status.color }}
              >
                {status.label}
              </span>
              {company && (
                <span className="text-xs opacity-60 flex items-center gap-1">
                  <Building2 size={10} /> {company.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <KanbanSquare size={22} className="text-[#ff6a00]" />
              {job.title}
            </h1>
            <p className="opacity-60 text-xs mt-1">
              {apps.length} candidato{apps.length === 1 ? "" : "s"} · arraste cards entre colunas para mudar etapa
            </p>
          </div>
          <Link
            href={`/vagas/${id}`}
            className="text-xs px-3 py-2 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: "var(--border)" }}
          >
            <Briefcase size={12} className="inline mr-1" /> Ver detalhe
          </Link>
        </header>

        <KanbanBoard cards={cards} />
      </div>
    </AppShell>
  );
}
