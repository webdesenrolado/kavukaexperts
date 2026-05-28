/**
 * POST /api/portal/applications
 *
 * Candidatura 1-clique: usuário já logado no portal se aplica a uma vaga
 * publiclyOpen sem reenviar dados pessoais (vêm do candidato.id da sessão).
 *
 * Auth: cookie kavuka_candidate_token (proxy do portal já valida).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { jobs, applications } from "@/db/schema";
import { getCandidateSession } from "@/lib/portal/session";

const schema = z.object({
  jobId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await getCandidateSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, parsed.data.jobId),
  });
  if (!job) {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }
  if (!job.publiclyOpen || job.status !== "open") {
    return NextResponse.json(
      { error: "Vaga não aceita candidaturas no momento." },
      { status: 403 },
    );
  }

  const existing = await db.query.applications.findFirst({
    where: and(
      eq(applications.jobId, job.id),
      eq(applications.candidateId, session.candidateId),
    ),
  });

  if (existing) {
    return NextResponse.json({
      ok: true,
      applicationId: existing.id,
      alreadyApplied: true,
    });
  }

  const id = nanoid();
  await db.insert(applications).values({
    id,
    jobId: job.id,
    candidateId: session.candidateId,
    stage: "applied",
    source: "portal",
  });

  return NextResponse.json(
    { ok: true, applicationId: id, alreadyApplied: false },
    { status: 201 },
  );
}
