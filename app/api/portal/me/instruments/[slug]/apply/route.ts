/**
 * POST /api/portal/me/instruments/[slug]/apply
 *
 * Endpoint dedicado pro PORTAL DO CANDIDATO aplicar avaliações.
 * Usa session.candidateId (cookie kavuka_candidate_token) — candidato só
 * salva avaliação no próprio perfil.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidates, assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireCandidateSession } from "@/lib/portal/session";
import { getInstrument } from "@/lib/instruments";
import { responseSchema, channelSchema, bcp47Schema } from "@/services/_contract/schema";

const requestSchema = z.object({
  responses: z.array(responseSchema).min(1),
  channel: channelSchema.optional(),
  language: bcp47Schema.optional(),
  completionTimeSeconds: z.number().nonnegative().optional(),
});

const DEFAULT_RETENTION_YEARS = 5;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let session;
  try {
    session = await requireCandidateSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { slug } = await params;
  const instrument = getInstrument(slug);
  if (!instrument) {
    return NextResponse.json({ error: `Instrumento '${slug}' não disponível.` }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, session.candidateId),
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });
  }

  const assessmentId = nanoid();
  const consentId = nanoid();
  const retention = new Date();
  retention.setFullYear(retention.getFullYear() + DEFAULT_RETENTION_YEARS);

  let envelope;
  try {
    envelope = instrument.apply({
      subject_id: candidate.id,
      application_id: assessmentId,
      responses: parsed.data.responses,
      meta: {
        channel: parsed.data.channel ?? "web",
        completion_time_seconds: parsed.data.completionTimeSeconds,
        language: parsed.data.language ?? "pt-BR",
      },
      consent_id: consentId,
      data_retention_until: retention.toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Falha ao aplicar instrumento",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 422 }
    );
  }

  const startedAt = new Date(
    new Date(envelope.meta.applied_at).getTime() -
      envelope.meta.completion_time_seconds * 1000
  );

  await db.insert(assessments).values({
    id: assessmentId,
    candidateId: candidate.id,
    applicationId: null,
    instrument: envelope.instrument,
    instrumentVersion: envelope.version,
    status: "completed",
    channel: envelope.meta.channel,
    language: envelope.meta.language,
    responsesJson: JSON.stringify(envelope.responses),
    scoresJson: JSON.stringify(envelope.scores),
    interpretationJson: JSON.stringify(envelope.interpretation),
    qualityFlagsJson: JSON.stringify(envelope.quality_flags),
    consentId: envelope.consent_id,
    startedAt,
    completedAt: new Date(envelope.meta.applied_at),
  });

  return NextResponse.json(envelope, { status: 201 });
}
