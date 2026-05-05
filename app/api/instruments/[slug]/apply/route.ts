/**
 * POST /api/instruments/[slug]/apply
 *
 * Receives raw responses, runs the corresponding microservice, persists the
 * envelope on `assessments`, and returns the result.
 *
 * Auth: requires a valid platform session (recruiter/master/HR). Public
 * candidate-facing flow uses a separate token-based endpoint to be built.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidates, applications, assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getInstrument } from "@/lib/instruments";
import {
  responseSchema,
  channelSchema,
  bcp47Schema,
} from "@/services/_contract/schema";

const requestSchema = z.object({
  candidateId: z.string().min(1),
  applicationId: z.string().min(1).nullable().optional(),
  responses: z.array(responseSchema).min(1),
  channel: channelSchema.optional(),
  language: bcp47Schema.optional(),
  completionTimeSeconds: z.number().nonnegative().optional(),
  consentId: z.string().min(1).nullable().optional(),
});

const DEFAULT_RETENTION_YEARS = 5;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const instrument = getInstrument(slug);
  if (!instrument) {
    return NextResponse.json(
      { error: `Microsserviço '${slug}' não disponível.` },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, parsed.data.candidateId),
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });
  }

  if (parsed.data.applicationId) {
    const app = await db.query.applications.findFirst({
      where: eq(applications.id, parsed.data.applicationId),
    });
    if (!app) {
      return NextResponse.json(
        { error: "Aplicação (vaga-candidato) não encontrada" },
        { status: 404 },
      );
    }
    if (app.candidateId !== parsed.data.candidateId) {
      return NextResponse.json(
        { error: "Aplicação não pertence a este candidato" },
        { status: 400 },
      );
    }
  }

  const assessmentId = nanoid();
  const consentId = parsed.data.consentId || nanoid();
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
      { status: 422 },
    );
  }

  const startedAt = new Date(
    new Date(envelope.meta.applied_at).getTime() -
      envelope.meta.completion_time_seconds * 1000,
  );

  await db.insert(assessments).values({
    id: assessmentId,
    candidateId: candidate.id,
    applicationId: parsed.data.applicationId ?? null,
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
