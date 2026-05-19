import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import {
  candidates,
  applications,
  jobs,
  assessments,
  companies,
  candidateExperiences,
  candidateEducations,
  candidateSkills,
  candidateLanguages,
} from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
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
  User,
  Home,
  Languages,
  Wrench,
  Globe,
} from "lucide-react";
import { InviteButton } from "./invite-button";
import { MapViewLoader, type MapPoint } from "@/components/map-view-loader";
import { distanceKm, parseLatLng } from "@/lib/geo";
import { socialMeta } from "@/lib/social-links";
import { InstrumentCards } from "@/components/instrument-cards";

function LinkedinIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0z" />
    </svg>
  );
}

function GithubIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.16c-3.2.69-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
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

  const experiences = await db
    .select()
    .from(candidateExperiences)
    .where(eq(candidateExperiences.candidateId, id))
    .orderBy(asc(candidateExperiences.sortOrder), desc(candidateExperiences.startDate));

  const educations = await db
    .select()
    .from(candidateEducations)
    .where(eq(candidateEducations.candidateId, id))
    .orderBy(asc(candidateEducations.sortOrder), desc(candidateEducations.endYear));

  const skills = await db
    .select()
    .from(candidateSkills)
    .where(eq(candidateSkills.candidateId, id))
    .orderBy(asc(candidateSkills.sortOrder));

  const languages = await db
    .select()
    .from(candidateLanguages)
    .where(eq(candidateLanguages.candidateId, id))
    .orderBy(asc(candidateLanguages.sortOrder));

  return {
    candidate,
    applications: apps,
    assessments: assessmentList,
    experiences,
    educations,
    skills,
    languages,
  };
}

export default async function CandidatoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCandidateData(id);
  if (!data) notFound();
  const {
    candidate,
    applications: apps,
    assessments: assessmentList,
    experiences,
    educations,
    skills,
    languages,
  } = data;

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
                      className="inline-flex items-center gap-1 text-[#0a66c2] hover:underline font-semibold"
                    >
                      <LinkedinIcon size={12} />
                      {socialMeta(candidate.linkedinUrl)?.label ?? "Ver perfil no LinkedIn"} →
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/candidatos/${id}/apostila`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--border)" }}
              >
                📄 Currículo ICH
              </Link>
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

        {/* RESUMO PROFISSIONAL */}
        {candidate.summary && (
          <Section icon={<Sparkles size={16} className="text-[#ff6a00]" />} title="Resumo profissional">
            <p className="text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{candidate.summary}</p>
          </Section>
        )}

        {/* DADOS PESSOAIS */}
        <Section icon={<User size={16} className="text-[#0ea5e9]" />} title="Dados pessoais">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="CPF" value={candidate.cpf} mono />
            <Field label="RG" value={candidate.rg} mono />
            <Field
              label="Nascimento"
              value={
                candidate.birthDate
                  ? new Date(candidate.birthDate).toLocaleDateString("pt-BR")
                  : null
              }
            />
            <Field label="Idade" value={candidate.age ? `${candidate.age} anos` : null} />
            <Field label="Gênero" value={candidate.gender} />
            <Field label="Estado civil" value={candidate.maritalStatus} />
            <Field label="Nacionalidade" value={candidate.nationality} />
            <Field label="Telefone alt" value={candidate.phoneAlt} mono />
          </div>
        </Section>

        {/* ENDEREÇO */}
        <Section icon={<Home size={16} className="text-[#10b981]" />} title="Endereço">
          {candidate.cep || candidate.address || candidate.city ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="CEP" value={candidate.cep} mono />
              <Field label="Logradouro" value={candidate.address} />
              <Field label="Número" value={candidate.addressNumber} />
              <Field label="Complemento" value={candidate.addressComplement} />
              <Field label="Bairro" value={candidate.neighborhood} />
              <Field label="Cidade" value={candidate.city} />
              <Field label="UF" value={candidate.state} />
            </div>
          ) : (
            <EmptyState message="Endereço ainda não cadastrado." />
          )}
        </Section>

        {/* FORMAÇÃO */}
        <Section
          icon={<GraduationCap size={16} className="text-[#a855f7]" />}
          title={`Formação acadêmica${educations.length ? ` (${educations.length})` : ""}`}
        >
          {educations.length === 0 ? (
            <EmptyState message="Nenhuma formação cadastrada." />
          ) : (
            <div className="space-y-3">
              {educations.map((e) => (
                <div
                  key={e.id}
                  className="border rounded-lg p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold">{e.course || e.level || "—"}</div>
                      <div className="text-sm opacity-80">{e.institution}</div>
                      {e.description && (
                        <p className="text-xs opacity-70 mt-2">{e.description}</p>
                      )}
                    </div>
                    <div className="text-xs opacity-70 text-right shrink-0">
                      {e.startYear && e.endYear
                        ? `${e.startYear} – ${e.endYear}`
                        : e.endYear
                          ? `Concluído em ${e.endYear}`
                          : e.startYear
                            ? `Desde ${e.startYear}`
                            : ""}
                      {e.status && (
                        <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 capitalize">
                          {e.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* EXPERIÊNCIAS */}
        <Section
          icon={<Briefcase size={16} className="text-[#ff6a00]" />}
          title={`Experiência profissional${experiences.length ? ` (${experiences.length})` : ""}`}
        >
          {experiences.length === 0 ? (
            <EmptyState message="Nenhuma experiência cadastrada." />
          ) : (
            <div className="space-y-3">
              {experiences.map((x) => (
                <div
                  key={x.id}
                  className="border rounded-lg p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-semibold">{x.role}</div>
                      <div className="text-sm opacity-80 inline-flex items-center gap-1">
                        <Building2 size={11} className="inline" />
                        {x.company}
                        {x.location && (
                          <span className="opacity-70 ml-2">· {x.location}</span>
                        )}
                      </div>
                      {x.description && (
                        <p className="text-xs opacity-70 mt-2 whitespace-pre-wrap">{x.description}</p>
                      )}
                      {x.achievements && (
                        <div className="text-xs opacity-80 mt-2 pl-3 border-l-2" style={{ borderColor: "#ff6a00" }}>
                          <strong className="text-[#ff6a00]">Principais entregas:</strong>{" "}
                          {x.achievements}
                        </div>
                      )}
                    </div>
                    <div className="text-xs opacity-70 text-right shrink-0">
                      {x.startDate && (
                        <div>
                          {x.startDate}
                          {" – "}
                          {x.current ? (
                            <strong className="text-[#10b981]">atual</strong>
                          ) : (
                            x.endDate || "?"
                          )}
                        </div>
                      )}
                      {x.employmentType && (
                        <div className="mt-1 capitalize opacity-60">{x.employmentType}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* SKILLS */}
        <Section
          icon={<Wrench size={16} className="text-[#f59e0b]" />}
          title={`Skills${skills.length ? ` (${skills.length})` : ""}`}
        >
          {skills.length === 0 ? (
            <EmptyState message="Nenhuma skill cadastrada." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  title={s.category ?? undefined}
                >
                  {s.skill}
                  {s.level && <span className="opacity-60 text-[10px] uppercase">· {s.level}</span>}
                  {s.yearsOfUse && <span className="opacity-60 text-[10px]">· {s.yearsOfUse}a</span>}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* IDIOMAS */}
        <Section
          icon={<Languages size={16} className="text-[#0ea5e9]" />}
          title={`Idiomas${languages.length ? ` (${languages.length})` : ""}`}
        >
          {languages.length === 0 ? (
            <EmptyState message="Nenhum idioma cadastrado." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map((l) => (
                <div
                  key={l.id}
                  className="border rounded-lg p-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="font-semibold text-sm">{l.language}</div>
                  {l.level && (
                    <div className="text-xs opacity-70 capitalize mt-0.5">{l.level}</div>
                  )}
                  {l.certification && (
                    <div className="text-[10px] opacity-60 mt-1">{l.certification}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* LINKS / CURRÍCULO ORIGINAL */}
        {(candidate.resumeUrl || candidate.githubUrl || candidate.portfolioUrl) && (
          <Section icon={<Globe size={16} className="text-[#a855f7]" />} title="Links e currículo">
            <div className="flex flex-wrap gap-3">
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <FileText size={14} className="text-[#ff6a00]" />
                  Currículo original (PDF)
                  <ExternalLink size={11} className="opacity-60" />
                </a>
              )}
              {candidate.githubUrl && (
                <a
                  href={candidate.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 text-sm font-semibold"
                  style={{ borderColor: "var(--border)" }}
                >
                  <GithubIcon size={14} />
                  {socialMeta(candidate.githubUrl)?.label ?? "Ver perfil no GitHub"}
                  <ExternalLink size={11} className="opacity-60" />
                </a>
              )}
              {candidate.portfolioUrl && (
                <a
                  href={candidate.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 text-sm font-semibold"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Globe size={14} className="text-[#0ea5e9]" />
                  {socialMeta(candidate.portfolioUrl)?.label ?? "Ver portfólio"}
                  <ExternalLink size={11} className="opacity-60" />
                </a>
              )}
            </div>
          </Section>
        )}

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

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border p-5 mb-4"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">{label}</div>
      <div className={`text-sm ${mono ? "font-mono" : ""} ${value ? "" : "opacity-40 italic"}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="p-6 rounded-lg border border-dashed text-center"
      style={{ borderColor: "var(--border)" }}
    >
      <p className="text-sm opacity-60">{message}</p>
      <p className="text-[10px] opacity-40 mt-1">
        Será preenchido quando o candidato acessar o portal self-service.
      </p>
    </div>
  );
}
