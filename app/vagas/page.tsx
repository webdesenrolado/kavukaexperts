import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { jobs, companies, users, applications } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Plus, Briefcase, MapPin, Users as UsersIcon } from "lucide-react";

const STAGE_LABEL: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "#6b7280" },
  open: { label: "Aberta", color: "#10b981" },
  paused: { label: "Pausada", color: "#f59e0b" },
  closed: { label: "Encerrada", color: "#ef4444" },
};

async function listJobs() {
  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      status: jobs.status,
      location: jobs.location,
      remote: jobs.remote,
      seniority: jobs.seniority,
      createdAt: jobs.createdAt,
      companyName: companies.name,
      ownerName: users.name,
      applicationCount: sql<number>`(select count(*) from ${applications} where ${applications.jobId} = ${jobs.id})`,
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .leftJoin(users, eq(jobs.ownerId, users.id))
    .orderBy(desc(jobs.createdAt));
}

export default async function VagasPage() {
  const list = await listJobs();

  return (
    <AppShell>
      <div className="p-8 max-w-7xl">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vagas</h1>
            <p className="opacity-70 mt-1">Gerencie processos seletivos e perfis ideais.</p>
          </div>
          <Link
            href="/vagas/nova"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 shadow-lg shadow-[#ff6a00]/20"
          >
            <Plus size={18} />
            Nova vaga
          </Link>
        </header>

        {list.length === 0 ? (
          <div
            className="p-12 rounded-xl border text-center"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <Briefcase size={36} className="mx-auto opacity-30 mb-3" />
            <h2 className="text-lg font-semibold">Nenhuma vaga cadastrada ainda</h2>
            <p className="opacity-70 text-sm mt-1 mb-5">
              Comece criando uma vaga e definindo o perfil ideal com avaliações comportamentais.
            </p>
            <Link
              href="/vagas/nova"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00]"
            >
              <Plus size={16} />
              Criar primeira vaga
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((job) => {
              const stage = STAGE_LABEL[job.status] || STAGE_LABEL.draft;
              return (
                <Link
                  key={job.id}
                  href={`/vagas/${job.id}`}
                  className="p-5 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold leading-snug flex-1">{job.title}</h3>
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${stage.color}1a`, color: stage.color }}
                    >
                      {stage.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs opacity-70">
                    {job.companyName && <div>{job.companyName}</div>}
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} /> {job.location}
                        {job.remote === "remote" && " · 100% remoto"}
                        {job.remote === "hybrid" && " · híbrido"}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <UsersIcon size={12} /> {job.applicationCount} candidato
                      {job.applicationCount === 1 ? "" : "s"}
                    </div>
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
