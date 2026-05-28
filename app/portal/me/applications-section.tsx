import Link from "next/link";
import { ArrowRight, Briefcase, Building2, Clock, MapPin } from "lucide-react";

const STAGE_LABEL: Record<string, string> = {
  applied: "Candidatura enviada",
  screening: "Em triagem",
  assessments: "Avaliações em andamento",
  interview: "Entrevista",
  proposal: "Proposta",
  hired: "Contratado",
  rejected: "Encerrada",
};

const STAGE_BADGE: Record<string, string> = {
  applied: "bg-kavuka-yellow-soft text-kavuka-ink",
  screening: "bg-kavuka-yellow-soft text-kavuka-ink",
  assessments: "bg-kavuka-yellow text-kavuka-black",
  interview: "bg-kavuka-yellow text-kavuka-black",
  proposal: "bg-kavuka-yellow text-kavuka-black",
  hired: "bg-kavuka-black text-kavuka-yellow",
  rejected: "bg-kavuka-gray-100 text-kavuka-gray-500",
};

export type MyApplication = {
  applicationId: string;
  jobId: string;
  jobSlug: string | null;
  jobTitle: string;
  jobLocation: string | null;
  jobRemote: string | null;
  companyName: string | null;
  stage: string;
  appliedAt: Date | null;
};

function timeAgo(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: [number, string][] = [
    [86400, "d"],
    [3600, "h"],
    [60, "min"],
  ];
  for (const [s, label] of intervals) {
    const n = Math.floor(seconds / s);
    if (n >= 1) return `há ${n}${label}`;
  }
  return "agora";
}

export function ApplicationsSection({ applications }: { applications: MyApplication[] }) {
  if (applications.length === 0) {
    return (
      <section className="mb-12">
        <div className="rounded-3xl border border-dashed border-kavuka-gray-200 bg-white p-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-kavuka-gray-100 flex items-center justify-center">
            <Briefcase size={20} className="text-kavuka-gray-500" />
          </div>
          <p className="mt-4 text-base font-medium text-kavuka-black">
            Você ainda não se candidatou a nenhuma vaga.
          </p>
          <p className="mt-2 text-sm text-kavuka-gray-500">
            Explore as oportunidades abertas no Kavuka Vagas.
          </p>
          <Link
            href="https://kavukavagas.com.br/vagas"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kavuka-black text-kavuka-yellow text-sm font-semibold hover:bg-zinc-900 transition-colors"
          >
            Ver vagas abertas
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-kavuka-yellow">
            Suas candidaturas
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-kavuka-black">
            {applications.length} {applications.length === 1 ? "processo" : "processos"} em andamento
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applications.map((app) => {
          const company = app.companyName ?? "Empresa";
          const stageLabel = STAGE_LABEL[app.stage] ?? app.stage;
          const stageBadge = STAGE_BADGE[app.stage] ?? STAGE_BADGE.applied;
          const href = app.jobSlug
            ? `https://kavukavagas.com.br/vagas/${app.jobSlug}`
            : `https://kavukavagas.com.br/vagas`;

          return (
            <a
              key={app.applicationId}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl p-6 border border-kavuka-gray-200 hover:border-kavuka-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-kavuka-gray-500 uppercase tracking-wider truncate flex items-center gap-1.5">
                    <Building2 size={12} /> {company}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-kavuka-black leading-tight truncate group-hover:text-kavuka-ink">
                    {app.jobTitle}
                  </h3>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${stageBadge}`}
                >
                  {stageLabel}
                </span>
              </div>

              <div className="mt-5 pt-5 border-t border-kavuka-gray-100 flex items-center justify-between text-sm text-kavuka-gray-500">
                <div className="flex items-center gap-4">
                  {app.jobLocation && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} />
                      {app.jobLocation}
                    </span>
                  )}
                  {app.appliedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} />
                      {timeAgo(app.appliedAt)}
                    </span>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
