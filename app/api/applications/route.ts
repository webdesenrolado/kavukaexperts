import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { applications, jobs, candidates } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  jobId: z.string().min(1),
  candidateId: z.string().min(1),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, parsed.data.jobId) });
  if (!job) return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, parsed.data.candidateId),
  });
  if (!candidate) return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });

  const existing = await db.query.applications.findFirst({
    where: and(
      eq(applications.jobId, parsed.data.jobId),
      eq(applications.candidateId, parsed.data.candidateId),
    ),
  });
  if (existing) {
    return NextResponse.json({ id: existing.id, alreadyExisted: true });
  }

  const id = nanoid();
  await db.insert(applications).values({
    id,
    jobId: parsed.data.jobId,
    candidateId: parsed.data.candidateId,
    source: parsed.data.source || "manual",
    stage: "applied",
  });

  return NextResponse.json({ id }, { status: 201 });
}
