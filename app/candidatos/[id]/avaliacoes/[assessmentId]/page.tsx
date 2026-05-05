import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { candidates, assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, Download } from "lucide-react";
import { SuperTrunfo } from "@/components/super-trunfo";

async function getAssessment(candidateId: string, assessmentId: string) {
  const candidate = await db.query.candidates.findFirst({ where: eq(candidates.id, candidateId) });
  if (!candidate) return null;
  const assessment = await db.query.assessments.findFirst({ where: eq(assessments.id, assessmentId) });
  if (!assessment || assessment.candidateId !== candidateId) return null;
  return { candidate, assessment };
}

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ id: string; assessmentId: string }>;
}) {
  const { id, assessmentId } = await params;
  const data = await getAssessment(id, assessmentId);
  if (!data) notFound();

  const { candidate, assessment } = data;
  const scores = assessment.scoresJson ? JSON.parse(assessment.scoresJson) : null;
  const interpretation = assessment.interpretationJson ? JSON.parse(assessment.interpretationJson) : null;
  const qualityFlags = assessment.qualityFlagsJson ? JSON.parse(assessment.qualityFlagsJson) : [];

  if (!scores || !interpretation) {
    return (
      <AppShell>
        <div className="p-8">
          <p className="opacity-70">Avaliação ainda incompleta.</p>
        </div>
      </AppShell>
    );
  }

  // Os campos `score_weight_in_human_score` e `meta.norm_source` ficam no envelope
  // canônico, mas só persistimos `scoresJson`/`interpretationJson` aqui — pra evitar
  // ler o envelope inteiro do DB, hard-coded por instrumento conhecido.
  const scoreWeight = assessment.instrument === "ipip-neo-120" ? 1.0 : 0.0;
  const normSource = "johnson_2014_us";
  const appliedAt = (assessment.completedAt ?? assessment.createdAt ?? new Date()).toISOString();

  return (
    <AppShell>
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/candidatos/${id}`}
            className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100"
          >
            <ArrowLeft size={14} /> Voltar para {candidate.name}
          </Link>
          <button
            disabled
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border opacity-50 cursor-not-allowed"
            style={{ borderColor: "var(--border)" }}
            title="Em breve"
          >
            <Download size={12} /> Exportar PDF
          </button>
        </div>

        <SuperTrunfo
          candidateName={candidate.name}
          scores={scores}
          interpretation={interpretation}
          scoreWeight={scoreWeight}
          normSource={normSource}
          qualityFlags={qualityFlags}
          appliedAt={appliedAt}
        />
      </div>
    </AppShell>
  );
}
