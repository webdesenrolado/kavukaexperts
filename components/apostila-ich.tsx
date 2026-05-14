"use client";

import { useEffect, useState } from "react";
import { Printer, Award, Briefcase, GraduationCap, Wrench, Languages, Heart, Brain, Sparkles, MapPin, Mail, Phone, FileText } from "lucide-react";
import type { SkillsIndexResult } from "@/lib/ich/skills-index";
import type { BehavioralIndexResult } from "@/lib/ich/behavioral-index";
import type { ICHNarrative } from "@/lib/ich/narrative";
import { RadarChart, type RadarAxis } from "./radar-chart";

export interface ApostilaCandidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birthDate: string | null;
  age: number | null;
  cep: string | null;
  address: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  summary: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  kyidToken: string | null;
}

export interface ApostilaExperience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean | null;
  description: string | null;
  achievements: string | null;
}

export interface ApostilaEducation {
  id: string;
  institution: string;
  course: string | null;
  level: string | null;
  status: string | null;
  startYear: number | null;
  endYear: number | null;
}

export interface ApostilaSkill {
  id: string;
  skill: string;
  level: string | null;
  category: string | null;
  yearsOfUse: number | null;
}

export interface ApostilaLanguage {
  id: string;
  language: string;
  level: string | null;
  certification: string | null;
}

export interface ApostilaAssessment {
  id: string;
  instrument: string;
  status: string;
  scoresJson: string | null;
  interpretationJson: string | null;
  completedAt: Date | null;
}

interface Props {
  candidate: ApostilaCandidate;
  experiences: ApostilaExperience[];
  educations: ApostilaEducation[];
  skills: ApostilaSkill[];
  languages: ApostilaLanguage[];
  assessments: ApostilaAssessment[];
  skillsIndex: SkillsIndexResult;
  behavioralIndex: BehavioralIndexResult;
  narrative: ICHNarrative;
  /** Modo de visualização: "self" = candidato vendo seu próprio; "recruiter" = recrutador */
  viewer: "self" | "recruiter";
  baseUrl: string;
}

export function CurriculoICH(props: Props) {
  const {
    candidate,
    experiences,
    educations,
    skills,
    languages,
    assessments,
    skillsIndex,
    behavioralIndex,
    narrative,
    viewer,
    baseUrl,
  } = props;

  const [printing, setPrinting] = useState(false);

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  }

  const kyidUrl = candidate.kyidToken ? `${baseUrl}/kyid/${candidate.kyidToken}` : null;
  const qrUrl = kyidUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(kyidUrl)}`
    : null;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm 12mm 14mm 12mm; }
          .no-print { display: none !important; }
          .apostila { background: #fff !important; color: #000 !important; }
          .apostila .page-break { break-before: page; }
          .apostila section { break-inside: avoid; }
          .apostila * { color: #000 !important; }
          .apostila .pill { border-color: #999 !important; background: #fff !important; }
          .apostila .accent-bar { background: #ff6a00 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .apostila .gradient-bar { background: linear-gradient(90deg, #ff6a00, #ffcc00) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .apostila .radar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .apostila { color-scheme: light; }
      `}</style>

      {/* Toolbar não imprimível */}
      <div
        className="no-print sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.6)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xs opacity-70">
            <strong>Currículo ICH</strong> · {candidate.name}
          </div>
          <button
            onClick={handlePrint}
            disabled={printing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-black text-sm"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            <Printer size={14} />
            {printing ? "Abrindo..." : "Imprimir / Salvar PDF"}
          </button>
        </div>
      </div>

      <div
        className="apostila max-w-4xl mx-auto p-8"
        style={{
          background: "#fafafa",
          color: "#1a1a1a",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* === CAPA === */}
        <Capa candidate={candidate} narrative={narrative} qrUrl={qrUrl} kyidUrl={kyidUrl} />

        {/* === SEÇÃO 1: DADOS PESSOAIS === */}
        <Section title="1. Dados pessoais" icon={<FileText size={16} />}>
          <DadosPessoais candidate={candidate} viewer={viewer} />
        </Section>

        {/* === SEÇÃO 2: RESUMO PROFISSIONAL === */}
        {(candidate.summary || narrative.paragraphs.length > 0) && (
          <Section title="2. Resumo profissional" icon={<Sparkles size={16} />}>
            {candidate.summary && (
              <p className="text-sm leading-relaxed mb-3 italic">&ldquo;{candidate.summary}&rdquo;</p>
            )}
            {narrative.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {narrative.tags.map((t) => (
                  <span
                    key={t}
                    className="pill text-[10px] px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "#ff6a00", color: "#ff6a00" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* === SEÇÃO 3: FORMAÇÃO === */}
        <Section title={`3. Formação acadêmica${educations.length ? ` (${educations.length})` : ""}`} icon={<GraduationCap size={16} />}>
          {educations.length === 0 ? (
            <Empty msg="Nenhuma formação cadastrada." />
          ) : (
            <div className="space-y-3">
              {educations.map((e) => (
                <div key={e.id} className="border-l-2 pl-3" style={{ borderColor: "#ff6a00" }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold text-sm">{e.course || e.level || "—"}</div>
                      <div className="text-xs opacity-80">{e.institution}</div>
                    </div>
                    <div className="text-[10px] opacity-70 text-right shrink-0">
                      {e.startYear} – {e.endYear ?? "?"}
                      {e.status && <div className="capitalize opacity-60">{e.status}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* === SEÇÃO 4: EXPERIÊNCIA === */}
        <Section title={`4. Experiência profissional${experiences.length ? ` (${experiences.length})` : ""}`} icon={<Briefcase size={16} />}>
          {experiences.length === 0 ? (
            <Empty msg="Nenhuma experiência cadastrada." />
          ) : (
            <div className="space-y-3">
              {experiences.map((x) => (
                <div key={x.id} className="border-l-2 pl-3" style={{ borderColor: "#ff6a00" }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">{x.role}</div>
                      <div className="text-xs opacity-80">
                        {x.company}
                        {x.location && <span className="opacity-70"> · {x.location}</span>}
                      </div>
                      {x.description && (
                        <p className="text-[11px] opacity-80 mt-1 leading-relaxed">{x.description}</p>
                      )}
                      {x.achievements && (
                        <div className="text-[11px] mt-1 italic opacity-80">
                          ✦ {x.achievements}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] opacity-70 text-right shrink-0">
                      {x.startDate || "?"}
                      {" – "}
                      {x.current ? <strong style={{ color: "#10b981" }}>atual</strong> : x.endDate || "?"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* === SEÇÃO 5: SKILLS === */}
        <Section title={`5. Habilidades técnicas e comportamentais${skills.length ? ` (${skills.length})` : ""}`} icon={<Wrench size={16} />}>
          {skills.length === 0 ? (
            <Empty msg="Nenhuma habilidade cadastrada." />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px]"
                  style={{ borderColor: "#999" }}
                >
                  {s.skill}
                  {s.level && <span className="opacity-60 text-[9px] uppercase">· {s.level}</span>}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* === SEÇÃO 6: IDIOMAS === */}
        {languages.length > 0 && (
          <Section title={`6. Idiomas (${languages.length})`} icon={<Languages size={16} />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languages.map((l) => (
                <div key={l.id} className="border rounded-lg p-2" style={{ borderColor: "#ddd" }}>
                  <div className="text-sm font-semibold">{l.language}</div>
                  {l.level && <div className="text-[10px] opacity-70 capitalize">{l.level}</div>}
                  {l.certification && <div className="text-[9px] opacity-50">{l.certification}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* === QUEBRA DE PÁGINA === */}
        <div className="page-break" />

        {/* === SEÇÃO 7: ÍNDICE DE HABILIDADES === */}
        <Section title="7. Índice de Habilidades" icon={<Wrench size={16} />}>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <div className="text-4xl font-bold" style={{ color: "#ff6a00" }}>
                {skillsIndex.score}
                <span className="text-base opacity-60">/100</span>
              </div>
              <div className="text-xs uppercase tracking-wider opacity-70 mt-1">
                {skillsIndex.band === "iniciante" && "Iniciante"}
                {skillsIndex.band === "intermediario" && "Intermediário"}
                {skillsIndex.band === "avancado" && "Avançado"}
                {skillsIndex.band === "especialista" && "Especialista"}
              </div>
            </div>
            <div className="text-[11px] opacity-70 max-w-xs">
              Considera nível, anos de uso e diversidade de categorias. {skillsIndex.total}{" "}
              habilidades cadastradas em {Object.keys(skillsIndex.by_category).length} áreas.
            </div>
          </div>
          {Object.keys(skillsIndex.by_category).length > 0 && (
            <div className="space-y-1.5 mt-3">
              {Object.entries(skillsIndex.by_category)
                .sort(([, a], [, b]) => b.weighted - a.weighted)
                .map(([cat, data]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="capitalize">{cat}</span>
                      <span className="opacity-60">{data.count} skill{data.count === 1 ? "" : "s"} · {data.share}%</span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#eee" }}
                    >
                      <div
                        className="gradient-bar h-full"
                        style={{ width: `${data.share}%`, background: "linear-gradient(90deg,#ff6a00,#ffcc00)" }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Section>

        {/* === SEÇÃO 8: ÍNDICE COMPORTAMENTAL === */}
        <Section title="8. Índice Comportamental" icon={<Brain size={16} />}>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <div className="text-4xl font-bold" style={{ color: "#0ea5e9" }}>
                {behavioralIndex.score}
                <span className="text-base opacity-60">/100</span>
              </div>
              <div className="text-xs uppercase tracking-wider opacity-70 mt-1">
                {behavioralIndex.band === "incompleto" && "Sem avaliação suficiente"}
                {behavioralIndex.band === "parcial" && "Avaliação parcial"}
                {behavioralIndex.band === "consistente" && "Avaliação consistente"}
                {behavioralIndex.band === "robusto" && "Avaliação robusta"}
              </div>
            </div>
            <div className="text-[11px] opacity-70 max-w-xs">
              {behavioralIndex.instruments_count} instrumento(s) concluído(s).
              Mede qualidade da medição (completude, consistência cross-instrumentos, qualidade de resposta).
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 mb-4">
            <Component label="Completude" value={behavioralIndex.components.completude} max={70} />
            <Component label="Consistência" value={behavioralIndex.components.consistencia} max={20} />
            <Component label="Qualidade" value={behavioralIndex.components.qualidade} max={10} />
          </div>

          {/* Big Five síntese */}
          {behavioralIndex.big_five && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider opacity-60 mb-2">Big Five (síntese)</div>
              <BigFiveBars bf={behavioralIndex.big_five} />
            </div>
          )}

          {/* DISC perfil */}
          {behavioralIndex.disc_profile && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: "#ddd" }}>
              <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Perfil DISC adaptado</div>
              <div className="text-lg font-bold" style={{ color: "#0ea5e9" }}>
                {behavioralIndex.disc_profile}
              </div>
            </div>
          )}
        </Section>

        {/* === SEÇÃO 9: AVALIAÇÕES DETALHADAS === */}
        {assessments.length > 0 && (
          <Section title="9. Avaliações comportamentais aplicadas" icon={<Heart size={16} />}>
            <AssessmentsDetail assessments={assessments} />
          </Section>
        )}

        {/* === SEÇÃO 10: ICH NARRATIVA === */}
        <Section title="10. ICH — Identidade de Conhecimento e Habilidades" icon={<Award size={16} />}>
          <div className="space-y-3">
            {narrative.paragraphs.map((p, i) => (
              <p key={i} className="text-[12px] leading-relaxed">{p}</p>
            ))}
          </div>
        </Section>

        {/* === RODAPÉ === */}
        <footer
          className="text-center text-[10px] opacity-60 mt-8 pt-4 border-t"
          style={{ borderColor: "#ddd" }}
        >
          <p>
            Currículo ICH gerada por <strong>Kavuka Experts</strong> · Plataforma da GUÉP Soluções
            Corporativas
          </p>
          <p className="mt-1">
            Resultados são sinalizações, não diagnósticos clínicos. Você pode pedir revisão humana
            (LGPD art. 20).
          </p>
          {kyidUrl && (
            <p className="mt-1 font-mono text-[9px] opacity-50">
              KYID público: {kyidUrl}
            </p>
          )}
          <p className="mt-1 opacity-50">Gerado em {new Date().toLocaleString("pt-BR")}</p>
        </footer>
      </div>
    </>
  );
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

function Capa({
  candidate,
  narrative,
  qrUrl,
  kyidUrl,
}: {
  candidate: ApostilaCandidate;
  narrative: ICHNarrative;
  qrUrl: string | null;
  kyidUrl: string | null;
}) {
  return (
    <header
      className="rounded-2xl p-8 mb-6"
      style={{
        background: "linear-gradient(135deg, #fff8f0 0%, #fffaf0 100%)",
        border: "2px solid #ff6a00",
      }}
    >
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2">
            Identidade de Conhecimento e Habilidades
          </div>
          <h1
            className="text-4xl font-black leading-tight mb-2"
            style={{
              background: "linear-gradient(90deg, #ff6a00, #ffcc00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "#ff6a00",
            }}
          >
            {candidate.name}
          </h1>
          {narrative.headline && (
            <p className="text-sm opacity-80 mb-4">{narrative.headline}</p>
          )}
          <div
            className="accent-bar h-1 w-16 rounded-full mb-3"
            style={{ background: "#ff6a00" }}
          />
          <div className="text-[11px] opacity-70 space-y-0.5">
            {candidate.email && <div>{candidate.email}</div>}
            {candidate.phone && <div>{candidate.phone}</div>}
            {(candidate.city || candidate.state) && (
              <div>
                {candidate.city}
                {candidate.state && `/${candidate.state}`}
              </div>
            )}
          </div>
        </div>
        {qrUrl && kyidUrl && (
          <div className="text-center shrink-0">
            <img
              src={qrUrl}
              alt="QR KYID"
              width={120}
              height={120}
              style={{ background: "#fff", padding: 4, borderRadius: 8 }}
            />
            <div className="text-[8px] opacity-60 mt-1 font-mono">KYID público</div>
          </div>
        )}
      </div>
    </header>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        {icon && <span style={{ color: "#ff6a00" }}>{icon}</span>}
        <h2 className="text-base font-bold">{title}</h2>
        <div className="flex-1 h-px ml-2" style={{ background: "#ddd" }} />
      </div>
      {children}
    </section>
  );
}

function DadosPessoais({
  candidate,
  viewer,
}: {
  candidate: ApostilaCandidate;
  viewer: "self" | "recruiter";
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
      <Field label="Nome completo" value={candidate.name} />
      <Field label="Email" value={candidate.email} />
      {candidate.phone && <Field label="Telefone" value={candidate.phone} />}
      {viewer === "self" && candidate.cpf && <Field label="CPF" value={candidate.cpf} mono />}
      {candidate.birthDate && (
        <Field
          label="Nascimento"
          value={new Date(candidate.birthDate).toLocaleDateString("pt-BR")}
        />
      )}
      {candidate.age && <Field label="Idade" value={`${candidate.age} anos`} />}
      {candidate.cep && <Field label="CEP" value={candidate.cep} mono />}
      {candidate.city && (
        <Field
          label="Cidade"
          value={`${candidate.city}${candidate.state ? "/" + candidate.state : ""}`}
        />
      )}
      {candidate.address && (
        <Field
          label="Endereço"
          value={
            `${candidate.address}${candidate.addressNumber ? ", " + candidate.addressNumber : ""}` +
            (candidate.neighborhood ? ` — ${candidate.neighborhood}` : "")
          }
        />
      )}
      {candidate.linkedinUrl && <Field label="LinkedIn" value={candidate.linkedinUrl} mono />}
      {candidate.githubUrl && <Field label="GitHub" value={candidate.githubUrl} mono />}
      {candidate.portfolioUrl && <Field label="Portfolio" value={candidate.portfolioUrl} mono />}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">{label}</div>
      <div className={`${mono ? "font-mono text-[10px]" : ""}`}>{value}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-[11px] opacity-50 italic">{msg}</div>;
}

function Component({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span>{label}</span>
        <span className="opacity-60 font-mono">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#eee" }}>
        <div className="gradient-bar h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#ff6a00,#ffcc00)" }} />
      </div>
    </div>
  );
}

function BigFiveBars({ bf }: { bf: { O: number; C: number; E: number; A: number; S: number } }) {
  const labels: Record<keyof typeof bf, string> = {
    O: "Abertura",
    C: "Conscienciosidade",
    E: "Extroversão",
    A: "Afabilidade",
    S: "Estabilidade emocional",
  };
  return (
    <div className="space-y-1">
      {(Object.keys(labels) as (keyof typeof bf)[]).map((k) => {
        const v = bf[k];
        const pct = ((v - 1) / 4) * 100;
        return (
          <div key={k}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span>{labels[k]}</span>
              <span className="opacity-60 font-mono">{v.toFixed(1)} / 5</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#eee" }}>
              <div className="h-full" style={{ width: `${pct}%`, background: "#0ea5e9" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssessmentsDetail({ assessments }: { assessments: ApostilaAssessment[] }) {
  const labelMap: Record<string, string> = {
    "ipip-neo-120": "IPIP-NEO-120 (Big Five completo)",
    "disc-adapted": "DISC adaptado GUÉP",
    "label-adapted": "LABEL adaptado GUÉP",
  };

  return (
    <div className="space-y-4">
      {assessments
        .filter((a) => a.status === "completed")
        .map((a) => {
          const scores = a.scoresJson ? JSON.parse(a.scoresJson) : null;
          const interp = a.interpretationJson ? JSON.parse(a.interpretationJson) : null;
          const date = a.completedAt
            ? new Date(a.completedAt).toLocaleDateString("pt-BR")
            : "";

          return (
            <div
              key={a.id}
              className="rounded-lg p-3 border"
              style={{ borderColor: "#ddd", background: "#fff" }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm">{labelMap[a.instrument] || a.instrument}</h3>
                <span className="text-[9px] opacity-60">{date}</span>
              </div>

              {a.instrument === "label-adapted" && scores && <LabelRadar scores={scores} />}
              {a.instrument === "disc-adapted" && scores && <DiscBars scores={scores} />}

              {interp?.narrative && (
                <p className="text-[11px] opacity-80 mt-2 italic">{interp.narrative}</p>
              )}
            </div>
          );
        })}
    </div>
  );
}

function LabelRadar({ scores }: { scores: any }) {
  const dims = scores?.dimensions || {};
  const RADAR_ORDER = [
    "fragilidade", "estabilidade", "adaptabilidade", "metodo", "racionalidade",
    "motivacao", "combatividade", "autoridade", "expansividade",
    "originalidade", "sociabilidade", "altruismo", "dependencia",
  ];
  const LABELS: Record<string, string> = {
    fragilidade: "Fragilidade", estabilidade: "Estabilidade",
    adaptabilidade: "Adaptabilidade", metodo: "Método", racionalidade: "Racionalidade",
    motivacao: "Motivação", combatividade: "Combatividade", autoridade: "Autoridade",
    expansividade: "Expansividade", originalidade: "Originalidade",
    sociabilidade: "Sociabilidade", altruismo: "Altruísmo", dependencia: "Dependência",
  };
  const NORMS: Record<string, { mean: number; sd: number }> = {
    estabilidade: { mean: 3.0, sd: 0.7 }, adaptabilidade: { mean: 3.2, sd: 0.6 },
    metodo: { mean: 3.1, sd: 0.7 }, racionalidade: { mean: 3.2, sd: 0.6 },
    motivacao: { mean: 3.4, sd: 0.6 }, combatividade: { mean: 2.8, sd: 0.7 },
    autoridade: { mean: 3.0, sd: 0.7 }, expansividade: { mean: 3.1, sd: 0.7 },
    originalidade: { mean: 3.3, sd: 0.6 }, sociabilidade: { mean: 3.4, sd: 0.7 },
    altruismo: { mean: 3.6, sd: 0.5 }, dependencia: { mean: 2.9, sd: 0.6 },
    fragilidade: { mean: 3.0, sd: 0.7 },
  };

  const axes: RadarAxis[] = RADAR_ORDER.map((k) => ({
    key: k,
    label: LABELS[k],
    value: dims[k] ?? 3,
    norm: NORMS[k]?.mean ?? 3,
    sd: NORMS[k]?.sd ?? 0.7,
  }));

  return (
    <div className="radar-fill" style={{ color: "#000" }}>
      <RadarChart axes={axes} size={420} fillColor="#ff6a00" />
    </div>
  );
}

function DiscBars({ scores }: { scores: any }) {
  const labels: Record<string, string> = {
    D: "Dominância", I: "Influência", S: "Estabilidade", C: "Conformidade",
  };
  return (
    <div className="space-y-1.5 mt-2">
      {(["D", "I", "S", "C"] as const).map((k) => {
        const v = scores[k] ?? 0;
        return (
          <div key={k}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span>{labels[k]}</span>
              <span className="opacity-60 font-mono">{v}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#eee" }}>
              <div className="h-full" style={{ width: `${v}%`, background: "#0ea5e9" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
