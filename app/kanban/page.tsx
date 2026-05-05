import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { jobs, applications, candidates, companies } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { KanbanSquare } from "lucide-react";
import { GlobalKanbanClient, type GlobalCard, type JobOption } from "./client";

async function getData() {
  const openJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      companyName: companies.name,
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(jobs.status, "open"))
    .orderBy(desc(jobs.createdAt));

  const apps = await db
    .select({
      id: applications.id,
      stage: applications.stage,
      scoreFit: applications.scoreFit,
      scoreHumano: applications.scoreHumano,
      jobId: applications.jobId,
      jobTitle: jobs.title,
      candidateId: applications.candidateId,
      candidateName: candidates.name,
      candidateCity: candidates.city,
      candidateAvatarUrl: candidates.avatarUrl,
      candidateRole: candidates.currentRole,
    })
    .from(applications)
    .leftJoin(candidates, eq(applications.candidateId, candidates.id))
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(sql`${jobs.status} = 'open'`)
    .orderBy(desc(applications.scoreHumano));

  return { openJobs, apps };
}

export default async function GlobalKanbanPage({
  searchParams,
}: {
  searchParams: Promise<{ vaga?: string }>;
}) {
  const { vaga } = await searchParams;
  const { openJobs, apps } = await getData();

  const cards: GlobalCard[] = apps.map((a) => ({
    id: a.id,
    stage: a.stage,
    jobId: a.jobId,
    jobTitle: a.jobTitle ?? "",
    candidateId: a.candidateId,
    candidateName: a.candidateName ?? "Candidato",
    candidateCity: a.candidateCity ?? null,
    candidateRole: a.candidateRole ?? null,
    candidateAvatarUrl: a.candidateAvatarUrl ?? null,
    scoreFit: a.scoreFit ?? null,
    scoreHumano: a.scoreHumano ?? null,
  }));

  const jobOptions: JobOption[] = openJobs.map((j) => ({
    id: j.id,
    title: j.title,
    companyName: j.companyName ?? null,
    candidateCount: apps.filter((a) => a.jobId === j.id).length,
  }));

  return (
    <AppShell>
      <div className="p-6 max-w-[1800px]">
        <header className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <KanbanSquare size={22} className="text-[#ff6a00]" />
            <h1 className="text-2xl font-bold tracking-tight">Kanban geral</h1>
          </div>
          <p className="opacity-60 text-xs">
            Todos os candidatos × {jobOptions.length} vaga{jobOptions.length === 1 ? "" : "s"} aberta{jobOptions.length === 1 ? "" : "s"} · arraste para mudar etapa · filtre por vaga
          </p>
        </header>

        <GlobalKanbanClient cards={cards} jobs={jobOptions} initialFilter={vaga ?? "all"} />
      </div>
    </AppShell>
  );
}
