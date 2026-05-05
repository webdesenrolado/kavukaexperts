import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { jobs, companies, applications, candidates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  UserPlus,
  Mail,
  Building2,
  Navigation,
  KanbanSquare,
  Globe,
  Copy,
} from "lucide-react";
import { AddCandidateButton } from "./add-candidate";
import { MapViewLoader, type MapPoint } from "@/components/map-view-loader";
import { distanceKm, parseLatLng } from "@/lib/geo";
import {
  JOB_STATUS_LABEL,
  STAGE_LABEL,
  EMPLOYMENT_TYPE_LABEL,
  REMOTE_LABEL,
  SENIORITY_LABEL,
} from "@/lib/labels";
import { PublicLinkBadge } from "./public-link-badge";

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
      createdAt: applications.createdAt,
      candidateId: applications.candidateId,
      candidateName: candidates.name,
      candidateEmail: candidates.email,
      candidateCity: candidates.city,
      candidateRole: candidates.currentRole,
      candidateLat: candidates.lat,
      candidateLng: candidates.lng,
      candidateAvatarUrl: candidates.avatarUrl,
    })
    .from(applications)
    .leftJoin(candidates, eq(applications.candidateId, candidates.id))
    .where(eq(applications.jobId, id))
    .orderBy(desc(applications.scoreHumano));
  return { job, company, applications: apps };
}

export default async function VagaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getJob(id);
  if (!data) notFound();

  const { job, company, applications: apps } = data;
  const assessmentSlugs: string[] = job.assessmentsJson ? JSON.parse(job.assessmentsJson) : [];
  const status = JOB_STATUS_LABEL[job.status] || JOB_STATUS_LABEL.draft;

  const companyCoords = company ? parseLatLng(company.lat, company.lng) : null;
  const points: MapPoint[] = [];
  if (company && companyCoords) {
    points.push({
      id: `company-${company.id}`,
      lat: companyCoords.lat,
      lng: companyCoords.lng,
      label: company.name,
      sublabel: [company.address, company.city].filter(Boolean).join(", "),
      kind: "company",
    });
  }

  const candidatesWithDistance = apps.map((a) => {
    const candCoords = parseLatLng(a.candidateLat ?? null, a.candidateLng ?? null);
    const dist = candCoords && companyCoords
      ? distanceKm(companyCoords.lat, companyCoords.lng, candCoords.lat, candCoords.lng)
      : null;
    if (candCoords) {
      points.push({
        id: `cand-${a.candidateId}`,
        lat: candCoords.lat,
        lng: candCoords.lng,
        label: a.candidateName ?? "Candidato",
        sublabel: a.candidateCity ?? undefined,
        kind: a.scoreHumano && a.scoreHumano >= 75 ? "candidate-star" : "candidate",
        score: a.scoreHumano ?? undefined,
        href: `/candidatos/${a.candidateId}`,
      });
    }
    return { ...a, distanceKm: dist };
  });

  const stageCount = candidatesWithDistance.reduce<Record<string, number>>((acc, a) => {
    acc[a.stage] = (acc[a.stage] || 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="p-8 max-w-7xl">
        <Link href="/vagas" className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4">
          <ArrowLeft size={14} /> Voltar para vagas
        </Link>

        <header className="mb-6 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
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
              {job.publiclyOpen && job.slug && <PublicLinkBadge slug={job.slug} />}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm opacity-70">
              {job.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {job.location}
                </span>
              )}
              {job.seniority && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase size={14} /> {SENIORITY_LABEL[job.seniority] ?? job.seniority}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Users size={14} /> {apps.length} candidato{apps.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/vagas/${id}/kanban`}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              <KanbanSquare size={14} /> Kanban
            </Link>
            <AddCandidateButton jobId={id} />
          </div>
        </header>

        {/* Funnel */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          {Object.entries(STAGE_LABEL).slice(0, 7).map(([key, meta]) => {
            const count = stageCount[key] || 0;
            return (
              <div
                key={key}
                className="p-3 rounded-lg border"
                style={{ background: "var(--card)", borderColor: "var(--border)", opacity: count === 0 ? 0.5 : 1 }}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-60">{meta.label}</div>
                <div className="text-2xl font-bold mt-1" style={{ color: count > 0 ? meta.color : undefined }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-[#ff6a00]" />
                  <span className="font-semibold text-sm">Mapa: vaga × candidatos</span>
                </div>
                <div className="text-[10px] flex items-center gap-3 opacity-70">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff6a00] border border-white" />Empresa
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white" />Top candidato
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0ea5e9] border border-white" />Candidato
                  </span>
                </div>
              </div>
              <MapViewLoader points={points} height={360} drawLinesFromKind="company" />
            </div>
          </div>

          <aside className="space-y-3">
            <div className="p-4 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Avaliações configuradas</h3>
              {assessmentSlugs.length === 0 ? (
                <p className="text-sm opacity-60">Nenhuma avaliação selecionada.</p>
              ) : (
                <ul className="space-y-1.5">
                  {assessmentSlugs.map((slug) => (
                    <li key={slug} className="text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6a00]" />
                      <span className="font-mono">{slug}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Detalhes</h3>
              <dl className="space-y-1.5 text-xs">
                {job.employmentType && (
                  <div className="flex justify-between">
                    <dt className="opacity-60">Vínculo</dt>
                    <dd className="font-medium">{EMPLOYMENT_TYPE_LABEL[job.employmentType] ?? job.employmentType}</dd>
                  </div>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex justify-between">
                    <dt className="opacity-60">Salário</dt>
                    <dd className="font-medium">
                      {job.salaryMin && `R$ ${job.salaryMin}`}
                      {job.salaryMin && job.salaryMax && "–"}
                      {job.salaryMax && `R$ ${job.salaryMax}`}
                    </dd>
                  </div>
                )}
                {job.remote && (
                  <div className="flex justify-between">
                    <dt className="opacity-60">Modalidade</dt>
                    <dd className="font-medium">{REMOTE_LABEL[job.remote] ?? job.remote}</dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>

        {/* Pipeline */}
        <section className="rounded-xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm">Pipeline ({apps.length})</h2>
            <span className="text-[10px] opacity-60">Ordenado por Score Humano</span>
          </div>
          {apps.length === 0 ? (
            <div className="py-12 text-center text-sm opacity-60">
              <UserPlus size={32} className="mx-auto opacity-30 mb-2" />
              Ainda não há candidatos.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead style={{ background: "var(--background)" }}>
                <tr style={{ borderBottom: `1px solid var(--border)` }}>
                  <th className="text-left p-3 font-medium text-[10px] uppercase tracking-wider opacity-60">Candidato</th>
                  <th className="text-left p-3 font-medium text-[10px] uppercase tracking-wider opacity-60">Local</th>
                  <th className="text-right p-3 font-medium text-[10px] uppercase tracking-wider opacity-60">Distância</th>
                  <th className="text-right p-3 font-medium text-[10px] uppercase tracking-wider opacity-60">Fit</th>
                  <th className="text-right p-3 font-medium text-[10px] uppercase tracking-wider opacity-60">Score Humano</th>
                  <th className="text-left p-3 font-medium text-[10px] uppercase tracking-wider opacity-60">Etapa</th>
                </tr>
              </thead>
              <tbody>
                {candidatesWithDistance.map((a) => {
                  const stage = STAGE_LABEL[a.stage] || STAGE_LABEL.applied;
                  return (
                    <tr key={a.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <Link href={`/candidatos/${a.candidateId}`} className="flex items-center gap-2">
                          {a.candidateAvatarUrl ? (
                            <img src={a.candidateAvatarUrl} alt="" className="w-7 h-7 rounded-full" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-500/20 flex items-center justify-center text-[10px] font-bold opacity-70">
                              {a.candidateName?.[0] || "?"}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{a.candidateName}</div>
                            <div className="text-[10px] opacity-60 flex items-center gap-1">
                              <Mail size={9} /> {a.candidateEmail}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="p-3 text-xs opacity-80">{a.candidateCity ?? "—"}</td>
                      <td className="p-3 text-right text-xs">
                        {a.distanceKm !== null ? (
                          <span className="font-mono">{a.distanceKm.toFixed(1)} km</span>
                        ) : (
                          <span className="opacity-40">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {a.scoreFit !== null && a.scoreFit !== undefined ? <ScoreCell value={a.scoreFit} /> : <span className="opacity-40 text-xs">—</span>}
                      </td>
                      <td className="p-3 text-right">
                        {a.scoreHumano !== null && a.scoreHumano !== undefined ? <ScoreCell value={a.scoreHumano} bold /> : <span className="opacity-40 text-xs">—</span>}
                      </td>
                      <td className="p-3">
                        <span
                          className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: `${stage.color}1a`, color: stage.color }}
                        >
                          {stage.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {job.description && (
          <section className="mt-4 p-5 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="font-semibold mb-2">Descrição</h2>
            <p className="text-sm opacity-80 whitespace-pre-wrap">{job.description}</p>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function ScoreCell({ value, bold = false }: { value: number; bold?: boolean }) {
  const color = value >= 75 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <span className={`font-mono ${bold ? "font-bold text-base" : "text-xs"}`} style={{ color }}>
      {value}
    </span>
  );
}
