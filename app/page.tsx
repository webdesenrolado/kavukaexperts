import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { jobs, candidates, applications, assessments, companies } from "@/db/schema";
import { sql, eq, desc, and, gte } from "drizzle-orm";
import {
  Briefcase,
  Users,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Sparkles,
  MapPin,
  Building2,
  KanbanSquare,
  Globe,
  UserCheck,
  Calendar,
  Award,
} from "lucide-react";
import { MapViewLoader, type MapPoint } from "@/components/map-view-loader";
import { parseLatLng } from "@/lib/geo";
import { JOB_STATUS_LABEL, STAGE_LABEL, SENIORITY_LABEL } from "@/lib/labels";
import { DashboardRangeSelector, RANGE_LABEL, type Range } from "./dashboard-range-selector";
import { DailyBarChart, type ChartPoint } from "./dashboard-chart";

const RANGE_DAYS: Record<Range, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  all: null,
};

function parseRange(value: string | undefined | null): Range {
  if (value === "7d" || value === "30d" || value === "90d" || value === "180d" || value === "all") {
    return value;
  }
  return "30d";
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function rangeBounds(range: Range): { since: Date | null; days: number; bucketBy: "day" | "week" | "month" } {
  const days = RANGE_DAYS[range];
  if (days === null) {
    return { since: null, days: 0, bucketBy: "month" };
  }
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  startOfDay(since);
  return {
    since: startOfDay(since),
    days,
    bucketBy: days <= 30 ? "day" : days <= 90 ? "week" : "week",
  };
}

function buildBuckets(
  rows: { day: string; count: number }[],
  range: Range,
): ChartPoint[] {
  const { since, days, bucketBy } = rangeBounds(range);
  if (since === null) {
    // "all": agrupa por mês a partir do candidato mais antigo
    if (rows.length === 0) return [];
    const map = new Map<string, number>();
    for (const r of rows) {
      const d = new Date(r.day);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + Number(r.count));
    }
    const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([key, value]) => {
      const [y, m] = key.split("-");
      const date = new Date(Number(y), Number(m) - 1, 1);
      return {
        label: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        value,
        iso: date.toISOString(),
      };
    });
  }

  // Preenche com zeros pra qualquer dia/semana sem cadastro
  const buckets: ChartPoint[] = [];
  const today = startOfDay(new Date());
  if (bucketBy === "day") {
    const map = new Map<string, number>();
    for (const r of rows) {
      const d = startOfDay(new Date(r.day));
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + Number(r.count));
    }
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.push({
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        value: map.get(key) ?? 0,
        iso: d.toISOString(),
      });
    }
  } else {
    // semana
    const weeks = Math.ceil(days / 7);
    const map = new Map<string, number>();
    for (const r of rows) {
      const d = startOfDay(new Date(r.day));
      // Identificador da semana = data da segunda-feira
      const dayOfWeek = (d.getDay() + 6) % 7; // 0=segunda
      const monday = new Date(d);
      monday.setDate(d.getDate() - dayOfWeek);
      const key = monday.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + Number(r.count));
    }
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    for (let i = weeks - 1; i >= 0; i--) {
      const monday = new Date(thisMonday);
      monday.setDate(thisMonday.getDate() - i * 7);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const key = monday.toISOString().slice(0, 10);
      buckets.push({
        label: `${monday.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`,
        value: map.get(key) ?? 0,
        iso: monday.toISOString(),
      });
    }
  }
  return buckets;
}

async function getOverview(range: Range) {
  const { since } = rangeBounds(range);

  // ====== Totais (sempre da base inteira, não filtrados pela janela) ======
  const [jobCount] = await db.select({ count: sql<number>`count(*)` }).from(jobs);
  const [openJobCount] = await db.select({ count: sql<number>`count(*)` }).from(jobs).where(sql`status = 'open'`);
  const [candidateCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates);
  const [applicationCount] = await db.select({ count: sql<number>`count(*)` }).from(applications);
  const [assessCount] = await db.select({ count: sql<number>`count(*)` }).from(assessments).where(sql`status = 'completed'`);

  // Perfis completos: candidato com 2+ instrumentos distintos completados
  const completeProfilesRows = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*)::int AS count FROM (
      SELECT candidate_id
      FROM ${assessments}
      WHERE status = 'completed'
      GROUP BY candidate_id
      HAVING COUNT(DISTINCT instrument) >= 2
    ) sub
  `);
  const completeProfilesCount =
    Array.isArray(completeProfilesRows) && completeProfilesRows.length > 0
      ? completeProfilesRows[0].count
      : 0;

  // Score Humano médio
  const scoresRows = await db
    .select({ scoresJson: assessments.scoresJson })
    .from(assessments)
    .where(eq(assessments.instrument, "score-humano"));
  const scoreHumanoAvg =
    scoresRows.length === 0
      ? null
      : Math.round(
          scoresRows
            .map((r) => (r.scoresJson ? JSON.parse(r.scoresJson).score ?? 0 : 0))
            .reduce((a, b) => a + b, 0) / scoresRows.length,
        );

  // ====== Métricas dentro da janela escolhida ======
  const windowFilter = since ? gte(candidates.createdAt, since) : undefined;
  const [candidatesInWindow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(candidates)
    .where(windowFilter ?? sql`1=1`);

  const [applicationsInWindow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .where(since ? gte(applications.createdAt, since) : sql`1=1`);

  const [assessmentsInWindow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(assessments)
    .where(
      since
        ? and(eq(assessments.status, "completed"), gte(assessments.completedAt, since))!
        : eq(assessments.status, "completed"),
    );

  // Série temporal: cadastros agregados por dia (DB faz o group)
  const dailyResult = since
    ? await db.execute<{ day: string; count: number }>(sql`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS count
        FROM ${candidates}
        WHERE created_at >= ${since.toISOString()}
        GROUP BY day
        ORDER BY day ASC
      `)
    : await db.execute<{ day: string; count: number }>(sql`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS count
        FROM ${candidates}
        GROUP BY day
        ORDER BY day ASC
      `);
  const dailyRows = Array.isArray(dailyResult) ? (dailyResult as { day: string; count: number }[]) : [];
  const chartData = buildBuckets(dailyRows, range);

  // Vagas com contagem + breakdown por stage
  const jobsList = await db
    .select({
      id: jobs.id,
      slug: jobs.slug,
      title: jobs.title,
      status: jobs.status,
      location: jobs.location,
      seniority: jobs.seniority,
      remote: jobs.remote,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      publiclyOpen: jobs.publiclyOpen,
      lat: companies.lat,
      lng: companies.lng,
      companyName: companies.name,
      candidateCount: sql<number>`(select count(*) from ${applications} where ${applications.jobId} = ${jobs.id})`,
      avgFit: sql<number>`(select avg(score_fit) from ${applications} where ${applications.jobId} = ${jobs.id} and score_fit is not null)`,
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .orderBy(desc(sql`(select count(*) from ${applications} where ${applications.jobId} = ${jobs.id})`))
    .limit(8);

  // Stage breakdown por vaga
  const stageRows = await db
    .select({
      jobId: applications.jobId,
      stage: applications.stage,
      count: sql<number>`count(*)`,
    })
    .from(applications)
    .groupBy(applications.jobId, applications.stage);

  const stagesByJob: Record<string, Record<string, number>> = {};
  for (const r of stageRows) {
    stagesByJob[r.jobId] = stagesByJob[r.jobId] || {};
    stagesByJob[r.jobId][r.stage] = r.count;
  }

  // Mapa: filtra outliers fora do estado de SP (centra a visão metro)
  const jobsForMap = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      lat: companies.lat,
      lng: companies.lng,
      companyName: companies.name,
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(sql`${companies.lat} is not null`);

  const candidatesForMap = await db
    .select({
      id: candidates.id,
      name: candidates.name,
      city: candidates.city,
      state: candidates.state,
      lat: candidates.lat,
      lng: candidates.lng,
    })
    .from(candidates)
    .where(sql`${candidates.lat} is not null AND ${candidates.state} = 'SP'`);

  return {
    stats: {
      jobs: jobCount.count,
      openJobs: openJobCount.count,
      candidates: candidateCount.count,
      applications: applicationCount.count,
      assessments: assessCount.count,
      completeProfiles: completeProfilesCount,
      scoreHumanoAvg,
    },
    window: {
      candidates: candidatesInWindow.count,
      applications: applicationsInWindow.count,
      assessments: assessmentsInWindow.count,
    },
    chartData,
    jobsList,
    stagesByJob,
    jobsForMap,
    candidatesForMap,
  };
}

const STAGE_ORDER = ["applied", "screening", "assessment", "interview", "practical", "offer", "hired"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const data = await getOverview(range);
  const { stats, window, chartData, jobsList, stagesByJob, jobsForMap, candidatesForMap } = data;
  const completeShare =
    stats.candidates > 0 ? Math.round((stats.completeProfiles / stats.candidates) * 100) : 0;

  const points: MapPoint[] = [];
  for (const j of jobsForMap) {
    const c = parseLatLng(j.lat, j.lng);
    if (c) {
      points.push({
        id: `job-${j.id}`,
        lat: c.lat,
        lng: c.lng,
        label: j.title,
        sublabel: j.companyName ?? undefined,
        kind: "job",
        href: `/vagas/${j.id}`,
      });
    }
  }
  for (const cand of candidatesForMap) {
    const c = parseLatLng(cand.lat, cand.lng);
    if (c) {
      points.push({
        id: `cand-${cand.id}`,
        lat: c.lat,
        lng: c.lng,
        label: cand.name,
        sublabel: cand.city ?? undefined,
        kind: "candidate",
        href: `/candidatos/${cand.id}`,
      });
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-7xl">
        <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="opacity-70 mt-1">
              Visão geral da operação Kavuka — vagas, candidatos e inteligência humana.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase tracking-wider opacity-60">Janela</span>
            <DashboardRangeSelector current={range} />
          </div>
        </header>

        {/* KPIs PRINCIPAIS (totais da base inteira) */}
        <h2 className="text-[10px] uppercase tracking-wider opacity-60 mb-2">Totais</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-5">
          <Stat
            label="Vagas abertas"
            value={stats.openJobs}
            sub={`/ ${stats.jobs} totais`}
            icon={Briefcase}
            color="#10b981"
          />
          <Stat
            label="Candidatos"
            value={stats.candidates}
            sub="banco de talentos"
            icon={Users}
            color="#0ea5e9"
          />
          <Stat
            label="Perfis completos"
            value={stats.completeProfiles}
            sub={`${completeShare}% da base · 2+ avaliações`}
            icon={UserCheck}
            color="#a855f7"
          />
          <Stat
            label="Avaliações concluídas"
            value={stats.assessments}
            sub="instrumentos aplicados"
            icon={ClipboardList}
            color="#ff6a00"
          />
          <Stat
            label="Score Humano"
            value={stats.scoreHumanoAvg ?? "—"}
            sub={stats.scoreHumanoAvg !== null ? "média da base" : "sem dados ainda"}
            icon={Sparkles}
            color="#10b981"
          />
        </div>

        {/* KPIs DA JANELA */}
        <h2 className="text-[10px] uppercase tracking-wider opacity-60 mb-2">
          Nos últimos {RANGE_LABEL[range].toLowerCase()}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <Stat
            label="Novos cadastros"
            value={window.candidates}
            sub={range === "all" ? "todos os candidatos da base" : "candidatos que entraram"}
            icon={Calendar}
            color="#ff6a00"
            big
          />
          <Stat
            label="Aplicações a vagas"
            value={window.applications}
            sub="candidaturas no período"
            icon={ArrowRight}
            color="#a855f7"
            big
          />
          <Stat
            label="Avaliações concluídas"
            value={window.assessments}
            sub="no período escolhido"
            icon={Award}
            color="#0ea5e9"
            big
          />
        </div>

        {/* GRÁFICO DE CADASTROS POR DIA */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold">Cadastros por {chartData.length > 31 || range === "all" ? (range === "all" ? "mês" : "semana") : "dia"}</h2>
              <p className="text-[11px] opacity-60">
                Janela: <strong>{RANGE_LABEL[range]}</strong>
                {chartData.length > 0 && (
                  <>
                    {" · "}
                    Granularidade automática conforme tamanho da janela
                  </>
                )}
              </p>
            </div>
          </div>
          <DailyBarChart data={chartData} color="#ff6a00" emptyMsg="Nenhum cadastro nessa janela." />
        </div>

        {/* VAGAS — DESTAQUE */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Vagas em andamento</h2>
              <p className="text-xs opacity-60 mt-0.5">Ordenadas por volume de candidatos · cada vaga tem seu Kanban</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/carreiras"
                target="_blank"
                rel="noopener"
                className="text-xs px-3 py-2 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center gap-1.5"
                style={{ borderColor: "var(--border)" }}
              >
                <Globe size={12} /> Portal público
              </Link>
              <Link
                href="/vagas"
                className="text-xs px-3 py-2 rounded-lg bg-[#ff6a00]/10 text-[#ff6a00] font-semibold hover:bg-[#ff6a00]/20 inline-flex items-center gap-1.5"
              >
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {jobsList.length === 0 ? (
            <div
              className="p-12 rounded-xl border text-center"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <Briefcase size={36} className="mx-auto opacity-30 mb-3" />
              <h3 className="text-lg font-semibold mb-1">Nenhuma vaga ainda</h3>
              <Link
                href="/vagas/nova"
                className="inline-flex items-center gap-2 text-xs text-[#ff6a00] hover:underline mt-2"
              >
                Criar primeira vaga <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobsList.map((j) => {
                const status = JOB_STATUS_LABEL[j.status] ?? JOB_STATUS_LABEL.draft;
                const stages = stagesByJob[j.id] || {};
                const fmtSalary =
                  j.salaryMin || j.salaryMax
                    ? `R$ ${(j.salaryMin ?? 0).toLocaleString("pt-BR")}${j.salaryMax ? ` – ${j.salaryMax.toLocaleString("pt-BR")}` : ""}`
                    : null;
                return (
                  <div
                    key={j.id}
                    className="rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all relative group"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                  >
                    {/* Faixa colorida no topo */}
                    <div className="h-1 w-full" style={{ background: status.color }} />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <Link href={`/vagas/${j.id}`} className="block">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ background: `${status.color}1a`, color: status.color }}
                              >
                                {status.label}
                              </span>
                              {j.publiclyOpen && (
                                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(14,165,233,0.15)", color: "#0ea5e9" }}>
                                  <Globe size={9} /> Pública
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-base leading-tight group-hover:text-[#ff6a00] transition-colors">
                              {j.title}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] opacity-70 mt-1.5">
                            {j.companyName && (
                              <span className="inline-flex items-center gap-1">
                                <Building2 size={9} /> {j.companyName}
                              </span>
                            )}
                            {j.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={9} /> {j.location}
                              </span>
                            )}
                            {j.seniority && (
                              <span>{SENIORITY_LABEL[j.seniority] ?? j.seniority}</span>
                            )}
                          </div>
                        </div>

                        {/* Big number candidatos */}
                        <div className="text-right shrink-0">
                          <div className="text-3xl font-black leading-none" style={{ color: j.candidateCount > 0 ? "#ff6a00" : undefined, opacity: j.candidateCount > 0 ? 1 : 0.3 }}>
                            {j.candidateCount}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider opacity-60 mt-0.5">candidatos</div>
                        </div>
                      </div>

                      {fmtSalary && (
                        <div className="text-xs font-bold text-[#10b981] mb-3">{fmtSalary}</div>
                      )}

                      {/* Mini funnel */}
                      {j.candidateCount > 0 && (
                        <div className="mb-3">
                          <div className="flex h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                            {STAGE_ORDER.map((stage) => {
                              const count = stages[stage] || 0;
                              if (count === 0) return null;
                              const pct = (count / j.candidateCount) * 100;
                              const meta = STAGE_LABEL[stage];
                              return (
                                <div
                                  key={stage}
                                  className="h-full"
                                  style={{ width: `${pct}%`, background: meta.color }}
                                  title={`${meta.label}: ${count}`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] mt-2 opacity-80">
                            {STAGE_ORDER.map((stage) => {
                              const count = stages[stage] || 0;
                              if (count === 0) return null;
                              const meta = STAGE_LABEL[stage];
                              return (
                                <span key={stage} className="inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                                  {meta.label}: <strong>{count}</strong>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                        {j.avgFit !== null && j.avgFit !== undefined ? (
                          <span className="text-xs opacity-70">
                            Fit médio:{" "}
                            <span className="font-mono font-bold" style={{ color: j.avgFit >= 75 ? "#10b981" : j.avgFit >= 60 ? "#f59e0b" : "#ef4444" }}>
                              {Math.round(j.avgFit)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs opacity-40">Aguardando avaliações</span>
                        )}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/vagas/${j.id}/kanban`}
                            className="text-[10px] px-2 py-1 rounded-md bg-[#ff6a00]/10 text-[#ff6a00] font-semibold hover:bg-[#ff6a00]/20 inline-flex items-center gap-1"
                          >
                            <KanbanSquare size={10} /> Kanban
                          </Link>
                          <Link
                            href={`/vagas/${j.id}`}
                            className="text-[10px] px-2 py-1 rounded-md border hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center gap-1"
                            style={{ borderColor: "var(--border)" }}
                          >
                            Detalhe <ArrowRight size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MAPA */}
        {points.length > 0 && (
          <section className="mb-6">
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#ff6a00]" />
                  <span className="font-semibold text-sm">Distribuição geográfica · São Paulo metro</span>
                </div>
                <div className="text-[10px] flex items-center gap-3 opacity-70">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00] border border-white" />
                    Vagas ({jobsForMap.length})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0ea5e9] border border-white" />
                    Candidatos ({candidatesForMap.length})
                  </span>
                </div>
              </div>
              <MapViewLoader points={points} height={320} />
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  sub,
  icon: Icon,
  color,
  big = false,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  big?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider opacity-60">{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <div className={`font-bold ${big ? "text-3xl" : "text-2xl"}`} style={{ color: big ? color : undefined }}>
        {value}
      </div>
      <div className="text-[10px] opacity-60 mt-1">{sub}</div>
    </div>
  );
}
