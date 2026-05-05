/**
 * POST /api/public/applications
 * Endpoint PÚBLICO — formulário de candidatura sem autenticação.
 * Cria (ou reaproveita) candidato + cria application stage='applied' no Kanban.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidates, jobs, applications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const requestSchema = z.object({
  jobId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  linkedinUrl: z.string().optional().or(z.literal("")),
  currentRole: z.string().optional(),
  currentCompany: z.string().optional(),
  yearsExperience: z.number().int().min(0).max(60).nullable().optional(),
  expectedSalary: z.number().int().min(0).nullable().optional(),
  educationLevel: z.string().optional(),
  consent: z.boolean(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!parsed.data.consent) {
    return NextResponse.json(
      { error: "Você precisa aceitar os termos LGPD para se candidatar." },
      { status: 400 },
    );
  }

  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, parsed.data.jobId) });
  if (!job) {
    return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
  }
  if (!job.publiclyOpen) {
    return NextResponse.json({ error: "Vaga não está aberta para candidatura pública." }, { status: 403 });
  }
  if (job.status !== "open") {
    return NextResponse.json({ error: "Vaga não está aceitando candidaturas no momento." }, { status: 403 });
  }

  // Reusa candidato se já existir pelo email
  let candidate = await db.query.candidates.findFirst({
    where: eq(candidates.email, parsed.data.email.toLowerCase().trim()),
  });

  let candidateId: string;
  if (candidate) {
    candidateId = candidate.id;
    // Atualiza dados se vieram preenchidos
    const updates: Record<string, any> = {};
    if (parsed.data.phone && !candidate.phone) updates.phone = parsed.data.phone;
    if (parsed.data.city && !candidate.city) updates.city = parsed.data.city;
    if (parsed.data.linkedinUrl && !candidate.linkedinUrl) updates.linkedinUrl = parsed.data.linkedinUrl;
    if (parsed.data.currentRole && !candidate.currentRole) updates.currentRole = parsed.data.currentRole;
    if (parsed.data.currentCompany && !candidate.currentCompany) updates.currentCompany = parsed.data.currentCompany;
    if (Object.keys(updates).length > 0) {
      await db.update(candidates).set(updates).where(eq(candidates.id, candidateId));
    }
  } else {
    candidateId = nanoid();
    const seed = parsed.data.name.replace(/\s+/g, "+");
    await db.insert(candidates).values({
      id: candidateId,
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      phone: parsed.data.phone,
      city: parsed.data.city,
      state: parsed.data.state,
      linkedinUrl: parsed.data.linkedinUrl || null,
      currentRole: parsed.data.currentRole,
      currentCompany: parsed.data.currentCompany,
      yearsExperience: parsed.data.yearsExperience ?? null,
      educationLevel: parsed.data.educationLevel,
      expectedSalary: parsed.data.expectedSalary ?? null,
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=ff6a00`,
      source: "web",
      consentLgpdAt: new Date(),
    });
  }

  // Verifica se já existe aplicação para essa vaga + candidato
  const existing = await db.query.applications.findFirst({
    where: and(eq(applications.jobId, parsed.data.jobId), eq(applications.candidateId, candidateId)),
  });
  if (existing) {
    return NextResponse.json(
      { ok: true, applicationId: existing.id, alreadyApplied: true },
      { status: 200 },
    );
  }

  const applicationId = nanoid();
  await db.insert(applications).values({
    id: applicationId,
    jobId: parsed.data.jobId,
    candidateId,
    stage: "applied",
    source: "web",
  });

  return NextResponse.json({ ok: true, applicationId, candidateId }, { status: 201 });
}
