import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { candidates, applications, jobs, assessments, companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  GraduationCap,
  DollarSign,
  Clock,
  Building2,
  Navigation,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { InviteButton } from "./invite-button";
import { MapViewLoader, type MapPoint } from "@/components/map-view-loader";
import { distanceKm, parseLatLng } from "@/lib/geo";
import { InstrumentCards } from "@/components/instrument-cards";

function LinkedinIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0z" />
    </svg>
  );
}

const STAGE_LABEL: Record<string, string> = {
  applied: "Inscrito",
  screening: "Triagem",
  assessment: "Em avaliação",
  interview: "Entrevista",
  practical: "Teste prático",
  offer: "Proposta",
  hired: "Contratado",
  rejected: "Encerrado",
  talent_pool: "Banco de talentos",
};

const EDU_LABEL: Record<string, string> = {
  medio: "Ensino médio",
  tecnico: "Técnico",
  superior_incompleto: "Superior incompleto",
  superior: "Superior",
  pos: "Pós-graduação",
  mestrado: "Mestrado",
  doutorado: "Doutorado",
};

async function getCandidateData(id: string) {
  const candidate = await db.query.candidates.findFirst({ where: eq(candidates.id, id) });
  if (!candidate) return null;

  const apps = await db
    .select({
      id: applications.id,
      stage: applications.stage,
      jobId: applications.jobId,
      jobTitle: jobs.title,
      jobLocation: jobs.location,
      jobLat: companies.lat,
      jobLng: companies.lng,
      jobCompanyName: companies.name,
      scoreFit: applications.scoreFit,
      scoreHumano: applications.scoreHumano,
      createdAt: applications.createdAt,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(applications.candidateId, id))
    .orderBy(desc(applications.createdAt));

  const assessmentList = await db
    .select()
    .from(assessments)
    .where(eq(assessments.candidateId, id))
    .orderBy(desc(assessments.createdAt));

  return { candidate, applications: apps, assessments: assessmentList };
}

export default async function CandidatoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCandidateData(id);
  if (!data) notFound();
  const { candidate, applications: apps, assessments: assessmentList } = data;

  // Score Humano sintético (do instrumento score-humano se existir)
  const scoreHumanoAssess = assessmentList.find((a) => a.instrument === "score-humano");
  const scoreHumano = scoreHumanoAssess?.scoresJson
    ? JSON.parse(scoreHumanoAssess.scoresJson).score ?? null
    : null;
  const scoreBand = scoreHumanoAssess?.scoresJson
    ? JSON.parse(scoreHumanoAssess.scoresJson).band ?? null
    : null;

  // Instrumentos completos (não conta avaliacao-continua status pending)
  const completedInstruments = assessmentList.filter((a) => a.status === "completed");

  // Map points
  const candCoords = parseLatLng(candidate.lat, candidate.lng);
  const points: MapPoint[] = [];
  if (candCoords) {
    points.push({
      id: `cand-${candidate.id}`,
      lat: candCoords.lat,
      lng: candCoords.lng,
      label: candidate.name,
      sublabel: candidate.city ?? undefined,
      kind: "candidate-star",
      score: scoreHumano ?? undefined,
    });
  }
  const jobsWithDistance = apps.map((a) => {
    const jc = parseLatLng(a.jobLat ?? null, a.jobLng ?? null);
    const dist = jc && candCoords
      ? distanceKm(candCoords.lat, candCoords.lng, jc.lat, jc.lng)
      : null;
    if (jc) {
      points.push({
        id: `job-${a.jobId}`,
        lat: jc.lat,
        lng: jc.lng,
        label: a.jobTitle ?? "Vaga",
        sublabel: a.jobCompanyName ?? undefined,
        kind: "job",
        href: `/vagas/${a.jobId}`,
      });
    }
    return { ...a, distanceKm: dist };
  });

  return (
    <AppShell>
      <div className="p-8 max-w-7xl">
        <Link href="/candidatos" className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4">
          <ArrowLeft size={14} /> Voltar
        </Link>

        {/* HERO */}
        <header
          className="rounded-2xl border p-6 mb-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,106,0,0.06), rgba(255,204,0,0.02))",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {candidate.avatarUrl ? (
                <img
                  src={candidate.avatarUrl}
                  alt={candidate.name}
                  className="w-20 h-20 rounded-2xl shadow-lg ring-2 ring-white/10 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-2xl font-black text-black shrink-0">
                  {candidate.name?.[0] ?? "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">
                  Identidade de Conhecimento e Habilidades
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{candidate.name}</h1>
                {(candidate.currentRole || candidate.currentCompany) && (
                  <div className="opacity-80 mt-1">
                    {candidate.currentRole}
                    {candidate.currentRole && candidate.currentCompany && " · "}
                    {candidate.currentCompany && (
                      <span className="opacity-70">
                        <Building2 size={11} className="inline mr-1 mb-0.5" />
                        {candidate.currentCompany}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                  {candidate.email && (
                    <span className="inline-flex items-center gap-1 opacity-70">
                      <Mail size={12} /> {candidate.email}
                    </span>
                  )}
                  {candidate.phone && (
                    <span className="inline-flex items-center gap-1 opacity-70">
                      <Phone size={12} /> {candidate.phone}
                    </span>
                  )}
                  {candidate.city && (
                    <span className="inline-flex items-center gap-1 opacity-70">
                      <MapPin size={12} /> {candidate.city}
                      {candidate.state && `/${candidate.state}`}
                    </span>
                  )}
                  {candidate.linkedinUrl && (
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-[#0a66c2] hover:underline"
                    >
                      <LinkedinIcon size={12} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <InviteButton candidateId={id} candidateName={candidate.name} />
            </div>
          </div>
        </header>

        {/* VITAL STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <BigStat
            label="Score Humano"
            value={scoreHumano !== null ? scoreHumano.toString() : "—"}
            sub={scoreBand ? `banda ${scoreBand}` : "aguardando síntese"}
            color="#10b981"
            big
          />
          <BigStat
            label="Instrumentos"
            value={completedInstruments.length.toString()}
            sub={`/ 12 aplicados`}
            color="#ff6a00"
          />
          <BigStat
            label="Experiência"
            value={candidate.yearsExperience ? `${candidate.yearsExperience}a` : "—"}
            sub={candidate.educationLevel ? EDU_LABEL[candidate.educationLevel] ?? candidate.educationLevel : "—"}
            color="#0ea5e9"
            icon={<GraduationCap size={14} />}
          />
          <BigStat
            label="Pretensão"
            value={candidate.expectedSalary ? `R$ ${candidate.expectedSalary.toLocaleString("pt-BR")}` : "—"}
            sub="salarial"
            color="#a855f7"
            icon={<DollarSign size={14} />}
          />
          <BigStat
            label="Vagas"
            value={apps.length.toString()}
            sub={`em ${new Set(apps.map((a) => a.stage)).size} etapas`}
            color="#f59e0b"
            icon={<Briefcase size={14} />}
          />
          <BigStat
            label="LGPD"
            value={candidate.consentLgpdAt ? "OK" : "Pendente"}
            sub={
              candidate.consentLgpdAt
                ? new Date(candidate.consentLgpdAt).toLocaleDateString("pt-BR")
                : "Sem consentimento"
            }
            color={candidate.consentLgpdAt ? "#10b981" : "#ef4444"}
            icon={<ShieldCheck size={14} />}
          />
        </div>

        {/* MAP + Vagas */}
        {points.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Navigation size={14} className="text-[#ff6a00]" />
                    <span className="font-semibold text-sm">Localização do candidato × vagas aplicadas</span>
                  </div>
                  <div className="text-[10px] flex items-center gap-3 opacity-70">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white" />
                      Candidato
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00] border border-white" />
                      Vagas
                    </span>
                  </div>
                </div>
                <MapViewLoader points={points} height={320} drawLinesFromKind="candidate" />
              </div>
            </div>

            <aside
              className="rounded-xl border overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-[#ffcc00]" />
                  <span className="font-semibold text-sm">Em {apps.length} processo{apps.length === 1 ? "" : "s"}</span>
                </div>
              </div>
              <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
                {jobsWithDistance.length === 0 ? (
                  <p className="text-xs opacity-60 p-4 text-center">Nenhuma vaga ainda.</p>
                ) : (
                  jobsWithDistance.map((a) => (
                    <Link
                      key={a.id}
                      href={`/vagas/${a.jobId}`}
                      className="block p-3 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-xs truncate">{a.jobTitle}</span>
                        {a.distanceKm !== null && (
                          <span className="text-[10px] font-mono opacity-60 shrink-0">{a.distanceKm.toFixed(1)} km</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[10px] opacity-70">
                        <span>{STAGE_LABEL[a.stage]}</span>
                        {a.scoreFit !== null && a.scoreFit !== undefined && (
                          <span>
                            Fit: <span className="font-mono font-bold" style={{ color: a.scoreFit >= 75 ? "#10b981" : "#f59e0b" }}>{a.scoreFit}</span>
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </aside>
          </div>
        )}

        {/* INSTRUMENTOS */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Análise comportamental ({completedInstruments.length} instrumentos)</h2>
            <span className="text-xs opacity-60">Clique em um card para ver detalhes</span>
          </div>
          {completedInstruments.length === 0 ? (
            <div
              className="p-8 rounded-xl border text-center"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <p className="opacity-70 text-sm">
                Nenhum instrumento aplicado ainda. Use "Aplicar avaliação" para começar pelo IPIP-NEO-120.
              </p>
            </div>
          ) : (
            <InstrumentCards
              assessments={completedInstruments.map((a) => ({
                id: a.id,
                instrument: a.instrument,
                status: a.status,
                scoresJson: a.scoresJson,
                interpretationJson: a.interpretationJson,
                qualityFlagsJson: a.qualityFlagsJson,
                completedAt: a.completedAt,
              }))}
            />
          )}
        </section>

        {/* CV / ICH */}
        <section
          className="rounded-xl border p-5 mb-4"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-[#ff6a00]" />
            <h2 className="font-semibold">ICH — Identidade de Conhecimento e Habilidades</h2>
          </div>
          {candidate.ichJson ? (
            <pre className="text-xs opacity-80 overflow-auto p-3 rounded-lg" style={{ background: "var(--background)" }}>
              {candidate.ichJson}
            </pre>
          ) : (
            <p className="text-sm opacity-60">
              ICH ainda não preenchida. Pode ser construída por entrevista, importação de currículo
              (parser PDF) ou autopreenchimento via WhatsApp.
            </p>
          )}
        </section>

        {/* AVISOS */}
        <section className="text-xs opacity-50 leading-relaxed border rounded-xl p-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <div>
              <strong>Linguagem responsável:</strong> resultados são <em>sinalizações</em>, não diagnóstico
              clínico. Decisões devem combinar dados comportamentais com entrevista, contexto e revisão
              humana (LGPD art. 20). Candidato pode contestar qualquer decisão automatizada.
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function BigStat({
  label,
  value,
  sub,
  color,
  big = false,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  big?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider opacity-60">{label}</span>
        {icon && <span style={{ color }}>{icon}</span>}
      </div>
      <div className={`font-bold ${big ? "text-3xl" : "text-xl"}`} style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>
    </div>
  );
}
