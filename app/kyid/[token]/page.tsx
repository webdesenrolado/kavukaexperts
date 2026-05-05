import { notFound } from "next/navigation";
import { db } from "@/db";
import { candidates, assessments, applications, jobs, companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Fingerprint, MapPin, Briefcase, Sparkles, Calendar, Building2, AlertTriangle } from "lucide-react";
import { KyidShareButton } from "./share-button";
import { PrintKyidButton } from "./print-button";
import { KyidSeal } from "@/components/kyid-seal";
import { KyidPrintSheet } from "@/components/kyid-print-sheet";
import QRCode from "qrcode";
import { headers } from "next/headers";

async function getKyidData(token: string) {
  const candidate = await db.query.candidates.findFirst({ where: eq(candidates.kyidToken, token) });
  if (!candidate) return null;

  const assessmentList = await db
    .select()
    .from(assessments)
    .where(eq(assessments.candidateId, candidate.id))
    .orderBy(desc(assessments.completedAt));

  const apps = await db
    .select({
      id: applications.id,
      stage: applications.stage,
      jobId: applications.jobId,
      jobTitle: jobs.title,
      companyName: companies.name,
      createdAt: applications.createdAt,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(applications.candidateId, candidate.id))
    .orderBy(desc(applications.createdAt));

  return { candidate, assessments: assessmentList, applications: apps };
}

const STAGE_FRIENDLY: Record<string, string> = {
  applied: "Candidatura recebida",
  screening: "Em triagem",
  assessment: "Em avaliação",
  interview: "Entrevista marcada",
  practical: "Teste prático",
  offer: "Proposta enviada",
  hired: "Contratado(a)",
  rejected: "Processo encerrado",
  talent_pool: "No banco de talentos",
};

const DOMAIN_FRIENDLY: Record<string, { name: string; icon: string; high: string; low: string }> = {
  O: {
    name: "Curiosidade e abertura",
    icon: "🌅",
    high: "Você adora explorar ideias, novidades, perspectivas diferentes.",
    low: "Você prefere o que é conhecido e testado, com previsibilidade.",
  },
  C: {
    name: "Organização e foco",
    icon: "🎯",
    high: "Você é metódico(a), confiável e gosta de ver a coisa concluída.",
    low: "Você flui bem com o improviso e flexibilidade.",
  },
  E: {
    name: "Energia social",
    icon: "🤝",
    high: "Você ganha energia interagindo, sociabilizando, mobilizando pessoas.",
    low: "Você recarrega no recolhimento e prefere conversas profundas a muitas.",
  },
  A: {
    name: "Cooperação",
    icon: "🌿",
    high: "Você naturalmente prioriza harmonia e coletivo.",
    low: "Você é direto(a), assertivo(a) e não tem medo de discordar.",
  },
  N: {
    name: "Sensibilidade emocional",
    icon: "💭",
    high: "Você sente as coisas com intensidade — perceptivo(a) e atento(a) ao ambiente.",
    low: "Você se mantém estável mesmo sob pressão e mudanças.",
  },
};

export default async function KyidPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getKyidData(token);
  if (!data) notFound();

  const { candidate, assessments: assessmentList, applications: apps } = data;

  // Pega instrumentos completados
  const completed = assessmentList.filter((a) => a.status === "completed");
  const ipip = completed.find((a) => a.instrument === "ipip-neo-120");
  const scoreHumanoAssess = completed.find((a) => a.instrument === "score-humano");
  const scoreHumano = scoreHumanoAssess?.scoresJson ? JSON.parse(scoreHumanoAssess.scoresJson) : null;
  const ipipScores = ipip?.scoresJson ? JSON.parse(ipip.scoresJson) : null;
  const ipipInterp = ipip?.interpretationJson ? JSON.parse(ipip.interpretationJson) : null;

  const labelAssess = completed.find((a) => a.instrument === "label-guep");
  const label = labelAssess?.scoresJson ? JSON.parse(labelAssess.scoresJson).label : null;

  const archetypeAssess = completed.find((a) => a.instrument === "arquetipos");
  const archetype = archetypeAssess?.scoresJson ? JSON.parse(archetypeAssess.scoresJson).primary : null;

  const enneagramAssess = completed.find((a) => a.instrument === "eneagrama");
  const enneagram = enneagramAssess?.scoresJson ? JSON.parse(enneagramAssess.scoresJson) : null;

  const mbtiAssess = completed.find((a) => a.instrument === "mbti-like");
  const mbti = mbtiAssess?.scoresJson ? JSON.parse(mbtiAssess.scoresJson).type : null;

  const firstName = candidate.name.split(" ")[0];

  // URL canônico (para QR code)
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3355";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const kyidUrl = `${proto}://${host}/kyid/${token}`;

  // Datas: emitida na primeira aplicação completa, atualizada na última
  const completedDates = completed
    .map((a) => a.completedAt)
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());
  const emittedAt = completedDates[0] ?? null;
  const updatedAt = completedDates[completedDates.length - 1] ?? null;

  // QR code SVG
  const qrSvg = await QRCode.toString(kyidUrl, {
    type: "svg",
    margin: 1,
    color: { dark: "#0a0a0b", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  // Pega scores e label do DISC (caso exista) pra print sheet
  const discAssess = completed.find((a) => a.instrument === "disc-adapt");
  const discProfile = discAssess?.scoresJson ? JSON.parse(discAssess.scoresJson).profile : null;

  const ipipDomains = ipipScores?.domains ?? null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, rgba(255,106,0,0.12), transparent 50%), linear-gradient(180deg, #0a0a0b 0%, #131319 100%)",
        color: "#f5f5f4",
      }}
    >
      <header className="px-4 py-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-black font-black text-xl">
                K
              </div>
              <div className="absolute -bottom-1 -right-1 px-1 rounded bg-black border border-white/20 text-[8px] font-bold tracking-wider">
                ID
              </div>
            </div>
            <div>
              <div className="font-bold">Kavuka KYID</div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Conheça sua identidade</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PrintKyidButton />
            <KyidShareButton candidateName={candidate.name} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* SELO DE VALIDAÇÃO + QR */}
        <KyidSeal
          candidateName={candidate.name}
          emittedAt={emittedAt}
          updatedAt={updatedAt}
          kyidUrl={kyidUrl}
          qrSvg={qrSvg}
          instrumentCount={completed.length}
          scoreHumano={scoreHumano?.score ?? null}
        />

        {/* FOLHA IMPRIMÍVEL — só visível em window.print() */}
        <KyidPrintSheet
          candidateName={candidate.name}
          emittedAt={emittedAt}
          updatedAt={updatedAt}
          kyidUrl={kyidUrl}
          qrSvg={qrSvg}
          scoreHumano={scoreHumano?.score ?? null}
          scoreBand={scoreHumano?.band ?? null}
          instrumentCount={completed.length}
          bigFive={ipipDomains}
          topStrengths={ipipInterp?.strengths ?? []}
          topWatchouts={ipipInterp?.watchouts ?? []}
          mbti={mbti}
          label={label}
          archetype={archetype}
          enneagram={enneagram}
          discProfile={discProfile}
        />

        {/* HERO */}
        <section className="text-center pt-6 pb-2">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[#ff6a00]/10 border border-[#ff6a00]/30">
            <Fingerprint size={12} className="text-[#ff6a00]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff6a00] font-bold">
              Sua KYID Kavuka
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Olá, {firstName}</h1>
          <p className="opacity-70 mt-3 max-w-md mx-auto">
            Esta é a sua identidade comportamental. Permanente. Sua. Pode levar para qualquer
            processo seletivo onde a Kavuka chegar.
          </p>
        </section>

        {/* SUMMARY CHIPS */}
        <section className="flex flex-wrap items-center justify-center gap-2">
          {scoreHumano && (
            <Chip
              icon={<Sparkles size={12} />}
              label="Score Humano"
              value={`${scoreHumano.score}/100`}
              color="#10b981"
            />
          )}
          {mbti && <Chip icon={<span className="font-bold text-[10px]">🅻</span>} label="MBTI" value={mbti} color="#0ea5e9" />}
          {label && <Chip icon={<span>🏷️</span>} label="Label GUÉP" value={label} color="#a855f7" />}
          {archetype && <Chip icon={<span>🔮</span>} label="Arquétipo" value={archetype} color="#f59e0b" />}
          {enneagram && (
            <Chip
              icon={<span>♾️</span>}
              label="Eneagrama"
              value={`${enneagram.type} — ${enneagram.type_name}`}
              color="#f59e0b"
            />
          )}
        </section>

        {/* BIG FIVE — sua identidade base */}
        {ipipScores && (
          <section
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <h2 className="text-xl font-bold mb-1">Sua identidade base — Big Five</h2>
            <p className="text-xs opacity-60 mb-5">As 5 dimensões científicas que definem o seu jeito.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(DOMAIN_FRIENDLY).map(([k, meta]) => {
                const d = ipipScores.domains?.[k];
                if (!d) return null;
                const high = d.level === "high" || d.level === "very_high";
                const low = d.level === "low" || d.level === "very_low";
                const intensity = high ? "Alto" : low ? "Baixo" : "Equilibrado";
                const description = high ? meta.high : low ? meta.low : "Você navega bem entre os extremos.";
                return (
                  <div
                    key={k}
                    className="p-4 rounded-xl border bg-white/5"
                    style={{ borderColor: high ? "rgba(255,106,0,0.4)" : "rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{meta.icon}</span>
                      <span
                        className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold"
                        style={{
                          background: high ? "rgba(255,106,0,0.15)" : low ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                          color: high ? "#ff6a00" : low ? "#ef4444" : "#fff",
                        }}
                      >
                        {intensity}
                      </span>
                    </div>
                    <div className="font-semibold text-sm">{meta.name}</div>
                    <p className="text-xs opacity-70 mt-1 leading-relaxed">{description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SUAS FORÇAS */}
        {ipipInterp?.strengths?.length > 0 && (
          <section
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(16,185,129,0.04)", borderColor: "rgba(16,185,129,0.2)" }}
          >
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <span>✨</span> Suas forças
            </h2>
            <p className="text-xs opacity-60 mb-4">
              O que naturalmente faz você brilhar.
            </p>
            <ul className="space-y-2">
              {ipipInterp.strengths.map((s: string, i: number) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CRESCIMENTO */}
        {ipipInterp?.watchouts?.length > 0 && (
          <section
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(245,158,11,0.04)", borderColor: "rgba(245,158,11,0.2)" }}
          >
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <span>🌱</span> Áreas de crescimento
            </h2>
            <p className="text-xs opacity-60 mb-4">
              Onde existe potencial pra você se desenvolver mais.
            </p>
            <ul className="space-y-2">
              {ipipInterp.watchouts.map((s: string, i: number) => (
                <li key={i} className="flex gap-3 items-start">
                  <AlertTriangle size={16} className="text-[#f59e0b] mt-1 shrink-0" />
                  <span className="text-sm leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* NARRATIVA */}
        {ipipInterp?.narrative && (
          <section
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <h2 className="text-xl font-bold mb-3">Sua narrativa</h2>
            <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">{ipipInterp.narrative}</p>
          </section>
        )}

        {/* INSTRUMENTOS APLICADOS */}
        <section
          className="p-6 rounded-2xl border"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.1)" }}
        >
          <h2 className="text-xl font-bold mb-1">Avaliações concluídas</h2>
          <p className="text-xs opacity-60 mb-4">
            {completed.length} de 12 instrumentos aplicados na sua KYID.
          </p>
          <div className="space-y-2">
            {completed.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5"
              >
                <div>
                  <div className="font-medium text-sm">{a.instrument}</div>
                  <div className="text-[10px] opacity-60 flex items-center gap-1.5 mt-0.5">
                    <Calendar size={9} />
                    {a.completedAt && new Date(a.completedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    · v{a.instrumentVersion}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] font-bold">
                  Concluída
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* PROCESSOS */}
        {apps.length > 0 && (
          <section
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Briefcase size={18} /> Onde sua KYID está
            </h2>
            <p className="text-xs opacity-60 mb-4">Processos seletivos que estão lendo sua identidade.</p>
            <div className="space-y-2">
              {apps.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-sm">{a.jobTitle}</div>
                    {a.companyName && (
                      <div className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5">
                        <Building2 size={9} /> {a.companyName}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0ea5e9]/15 text-[#0ea5e9] font-bold">
                    {STAGE_FRIENDLY[a.stage] ?? a.stage}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="text-center py-8 opacity-50 text-xs leading-relaxed max-w-md mx-auto">
          <p>
            Sua KYID é uma <em>sinalização</em> da sua identidade comportamental — não diagnóstico
            clínico. Você pode contestar qualquer resultado a qualquer momento.
          </p>
          <p className="mt-2">
            <strong>Kavuka KYID</strong> — a sigla revolucionária do RH.
          </p>
        </footer>
      </main>
    </div>
  );
}

function Chip({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{ background: `${color}10`, borderColor: `${color}40`, color }}
    >
      {icon}
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}
