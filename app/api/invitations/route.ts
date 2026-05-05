import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { invitations, candidates, applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getInstrument } from "@/lib/instruments";

const createSchema = z.object({
  candidateId: z.string().min(1),
  instrument: z.string().min(1),
  applicationId: z.string().min(1).nullable().optional(),
  expiresInDays: z.number().int().min(1).max(90).optional(),
  timeLimitMinutes: z.number().int().min(5).max(180).optional(),
});

const DEFAULT_EXPIRES_DAYS = 14;
const DEFAULT_TIME_LIMIT_MIN = 30;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!getInstrument(parsed.data.instrument)) {
    return NextResponse.json(
      { error: `Microsserviço '${parsed.data.instrument}' não disponível.` },
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
    if (!app || app.candidateId !== parsed.data.candidateId) {
      return NextResponse.json(
        { error: "Aplicação inválida para este candidato" },
        { status: 400 },
      );
    }
  }

  // Garante kyidToken (criado lazy no primeiro convite)
  let kyidToken = candidate.kyidToken;
  if (!kyidToken) {
    kyidToken = nanoid(32);
    await db
      .update(candidates)
      .set({ kyidToken })
      .where(eq(candidates.id, candidate.id));
  }

  const id = nanoid();
  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (parsed.data.expiresInDays ?? DEFAULT_EXPIRES_DAYS));

  await db.insert(invitations).values({
    id,
    token,
    candidateId: parsed.data.candidateId,
    applicationId: parsed.data.applicationId ?? null,
    instrument: parsed.data.instrument,
    createdBy: session.userId,
    expiresAt,
    timeLimitMinutes: parsed.data.timeLimitMinutes ?? DEFAULT_TIME_LIMIT_MIN,
  });

  return NextResponse.json(
    {
      id,
      token,
      expiresAt: expiresAt.toISOString(),
      timeLimitMinutes: parsed.data.timeLimitMinutes ?? DEFAULT_TIME_LIMIT_MIN,
      kyidToken,
    },
    { status: 201 },
  );
}
