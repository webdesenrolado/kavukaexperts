/**
 * POST /api/public/applications
 * Endpoint PÚBLICO — formulário de candidatura sem autenticação.
 * Cria (ou reaproveita) candidato + cria application stage='applied' no Kanban.
 *
 * Se `password` for enviado, ativa conta no portal do candidato e seta o cookie
 * kavuka_candidate_token (auto-login). O candidato então pode ir direto pro
 * /portal/me completar perfil e fazer avaliações pra gerar a Apostila ICH.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidates, jobs, applications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signCandidateToken } from "@/lib/portal/jwt";
import { PORTAL_COOKIE, cookieSecure } from "@/lib/portal/session";

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
  /** Se enviar password, ativa conta no portal + auto-login. Min 6 chars. */
  password: z.string().min(6).optional(),
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

  const emailNorm = parsed.data.email.toLowerCase().trim();
  const wantsAccount = !!parsed.data.password;

  // Reusa candidato se já existir pelo email
  let candidate = await db.query.candidates.findFirst({
    where: eq(candidates.email, emailNorm),
  });

  let candidateId: string;
  let accountActivated = false;
  let accountAlreadyExisted = false;
  let passwordMismatch = false;

  if (candidate) {
    candidateId = candidate.id;

    // Atualiza dados que vieram preenchidos e ainda não tinha
    const updates: Record<string, any> = {};
    if (parsed.data.phone && !candidate.phone) updates.phone = parsed.data.phone;
    if (parsed.data.city && !candidate.city) updates.city = parsed.data.city;
    if (parsed.data.linkedinUrl && !candidate.linkedinUrl) updates.linkedinUrl = parsed.data.linkedinUrl;
    if (parsed.data.currentRole && !candidate.currentRole) updates.currentRole = parsed.data.currentRole;
    if (parsed.data.currentCompany && !candidate.currentCompany) updates.currentCompany = parsed.data.currentCompany;
    if (parsed.data.yearsExperience != null && !candidate.yearsExperience)
      updates.yearsExperience = parsed.data.yearsExperience;
    if (parsed.data.expectedSalary != null && !candidate.expectedSalary)
      updates.expectedSalary = parsed.data.expectedSalary;
    if (parsed.data.educationLevel && !candidate.educationLevel)
      updates.educationLevel = parsed.data.educationLevel;

    // Lógica da senha pra candidato existente
    if (wantsAccount) {
      if (candidate.passwordHash) {
        // Já tem senha: confere se bate (login implícito)
        const ok = await verifyPassword(parsed.data.password!, candidate.passwordHash);
        if (ok) {
          accountActivated = true;
          accountAlreadyExisted = true;
          updates.lastLoginAt = new Date();
        } else {
          passwordMismatch = true;
        }
      } else {
        // Não tinha senha: ativa agora
        updates.passwordHash = await hashPassword(parsed.data.password!);
        updates.lastLoginAt = new Date();
        accountActivated = true;
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.update(candidates).set(updates).where(eq(candidates.id, candidateId));
    }
  } else {
    candidateId = nanoid();
    const seed = parsed.data.name.replace(/\s+/g, "+");
    const passwordHash = wantsAccount ? await hashPassword(parsed.data.password!) : null;
    await db.insert(candidates).values({
      id: candidateId,
      name: parsed.data.name.trim(),
      email: emailNorm,
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
      passwordHash,
      lastLoginAt: wantsAccount ? new Date() : null,
      kyidToken: nanoid(32),
    });
    if (wantsAccount) accountActivated = true;
  }

  // Verifica se já existe aplicação para essa vaga + candidato
  const existing = await db.query.applications.findFirst({
    where: and(eq(applications.jobId, parsed.data.jobId), eq(applications.candidateId, candidateId)),
  });

  let applicationId: string;
  let alreadyApplied = false;
  if (existing) {
    applicationId = existing.id;
    alreadyApplied = true;
  } else {
    applicationId = nanoid();
    await db.insert(applications).values({
      id: applicationId,
      jobId: parsed.data.jobId,
      candidateId,
      stage: "applied",
      source: "web",
    });
  }

  const response = NextResponse.json(
    {
      ok: true,
      applicationId,
      candidateId,
      alreadyApplied,
      account: {
        activated: accountActivated,
        alreadyExisted: accountAlreadyExisted,
        passwordMismatch,
      },
    },
    { status: alreadyApplied ? 200 : 201 },
  );

  // Auto-login: seta cookie do portal se ativou conta
  if (accountActivated) {
    const token = await signCandidateToken({ candidateId, email: emailNorm });
    response.cookies.set(PORTAL_COOKIE, token, {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return response;
}
