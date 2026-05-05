/**
 * POST /api/public/invitations/[token]/apply
 * Endpoint PÚBLICO — recebe respostas do candidato sem autenticação,
 * resolve o candidato/instrumento via token, aplica o microsserviço e persiste.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { invitations, candidates, assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid as freshToken } from "nanoid";
import { getInstrument } from "@/lib/instruments";
import {
  responseSchema,
  channelSchema,
  bcp47Schema,
} from "@/services/_contract/schema";

const requestSchema = z.object({
  responses: z.array(responseSchema).min(1),
  channel: channelSchema.optional(),
  language: bcp47Schema.optional(),
  completionTimeSeconds: z.number().nonnegative().optional(),
  consentLgpd: z.boolean(),
});

const DEFAULT_RETENTION_YEARS = 5;
const STATUS_BLOCKING = ["completed", "revoked", "expired"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const inv = await db.query.invitations.findFirst({ where: eq(invitations.token, token) });
  if (!inv) return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });

  if (STATUS_BLOCKING.includes(inv.status)) {
    return NextResponse.json(
      { error: `Este convite já está ${inv.status === "completed" ? "concluído" : "indisponível"}.` },
      { status: 409 },
    );
  }
  if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
  }

  // Tempo limite após iniciar
  if (inv.startedAt && inv.timeLimitMinutes) {
    const deadline = new Date(inv.startedAt).getTime() + inv.timeLimitMinutes * 60 * 1000;
    if (Date.now() > deadline) {
      await db
        .update(invitations)
        .set({ status: "expired" })
        .where(eq(invitations.id, inv.id));
      return NextResponse.json(
        { error: `Tempo limite de ${inv.timeLimitMinutes} minutos esgotado.` },
        { status: 410 },
      );
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (!parsed.data.consentLgpd) {
    return NextResponse.json(
      { error: "Consentimento LGPD obrigatório para concluir a avaliação." },
      { status: 400 },
    );
  }

  const instrument = getInstrument(inv.instrument);
  if (!instrument) {
    return NextResponse.json(
      { error: `Instrumento '${inv.instrument}' não disponível.` },
      { status: 422 },
    );
  }

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, inv.candidateId),
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
      { status: 422 },
    );
  }

  const startedAt = new Date(
    new Date(envelope.meta.applied_at).getTime() -
      envelope.meta.completion_time_seconds * 1000,
  );

  // Atualiza candidato com consentimento + garante kyidToken
  const candidateUpdates: Record<string, any> = {};
  if (!candidate.consentLgpdAt) candidateUpdates.consentLgpdAt = new Date();
  if (!candidate.kyidToken) candidateUpdates.kyidToken = freshToken(32);
  if (Object.keys(candidateUpdates).length > 0) {
    await db.update(candidates).set(candidateUpdates).where(eq(candidates.id, candidate.id));
  }
  const kyidToken = candidate.kyidToken ?? candidateUpdates.kyidToken;

  await db.insert(assessments).values({
    id: assessmentId,
    candidateId: candidate.id,
    applicationId: inv.applicationId,
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

  await db
    .update(invitations)
    .set({
      status: "completed",
      assessmentId,
      completedAt: new Date(),
    })
    .where(eq(invitations.id, inv.id));

  return NextResponse.json({ ok: true, assessmentId, kyidToken }, { status: 201 });
}
