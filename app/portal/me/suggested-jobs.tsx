"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, Loader2, MapPin } from "lucide-react";

const REMOTE_LABEL: Record<string, string> = {
  on_site: "Presencial",
  hybrid: "Híbrido",
  remote: "Remoto",
};

export type SuggestedJob = {
  id: string;
  slug: string | null;
  title: string;
  location: string | null;
  remote: string | null;
  companyName: string | null;
};

type JobState = "idle" | "applying" | "applied" | "error";

export function SuggestedJobs({ jobs }: { jobs: SuggestedJob[] }) {
  const [state, setState] = useState<Record<string, JobState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (jobs.length === 0) return null;

  const apply = async (jobId: string) => {
    setState((s) => ({ ...s, [jobId]: "applying" }));
    setErrors((e) => ({ ...e, [jobId]: "" }));
    try {
      const res = await fetch("/api/portal/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Falha ao se candidatar.");
      }
      setState((s) => ({ ...s, [jobId]: "applied" }));
    } catch (err) {
      setState((s) => ({ ...s, [jobId]: "error" }));
      setErrors((e) => ({
        ...e,
        [jobId]: err instanceof Error ? err.message : "Falha.",
      }));
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-kavuka-yellow">
            Vagas pra você
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-kavuka-black">
            Candidate-se em 1 clique
          </h2>
        </div>
        <Link
          href="https://kavukavagas.com.br/vagas"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-kavuka-black hover:text-kavuka-ink group"
        >
          Ver todas
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => {
          const company = job.companyName ?? "Empresa";
          const status = state[job.id] ?? "idle";
          const href = job.slug
            ? `https://kavukavagas.com.br/vagas/${job.slug}`
            : "https://kavukavagas.com.br/vagas";

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-kavuka-gray-200 hover:border-kavuka-black transition-colors flex flex-col"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-kavuka-gray-500 uppercase tracking-wider truncate flex items-center gap-1.5">
                  <Building2 size={12} /> {company}
                </p>
                <h3 className="mt-1 text-base font-semibold text-kavuka-black leading-tight">
                  {job.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-kavuka-gray-500">
                  {job.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {job.location}
                    </span>
                  )}
                  {job.remote && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-kavuka-gray-100 text-kavuka-gray-700">
                      {REMOTE_LABEL[job.remote] ?? job.remote}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-kavuka-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => apply(job.id)}
                  disabled={status === "applying" || status === "applied"}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
                    status === "applied"
                      ? "bg-kavuka-yellow text-kavuka-black"
                      : "bg-kavuka-black text-kavuka-yellow hover:bg-zinc-900"
                  } disabled:cursor-not-allowed`}
                >
                  {status === "applying" && (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Enviando...
                    </>
                  )}
                  {status === "applied" && (
                    <>
                      <Check size={12} /> Candidatado
                    </>
                  )}
                  {(status === "idle" || status === "error") && (
                    <>Candidatar-se</>
                  )}
                </button>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-medium text-kavuka-gray-700 border border-kavuka-gray-200 hover:border-kavuka-black hover:text-kavuka-black transition-colors"
                >
                  Detalhes
                </a>
              </div>

              {status === "error" && errors[job.id] && (
                <p className="mt-2 text-xs text-red-700">{errors[job.id]}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
