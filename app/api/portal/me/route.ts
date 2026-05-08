import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  candidates,
  candidateExperiences,
  candidateEducations,
  candidateSkills,
  candidateLanguages,
} from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { requireCandidateSession } from "@/lib/portal/session";

export async function GET() {
  let session;
  try {
    session = await requireCandidateSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const c = await db.query.candidates.findFirst({
    where: eq(candidates.id, session.candidateId),
  });
  if (!c) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const [experiences, educations, skills, languages] = await Promise.all([
    db
      .select()
      .from(candidateExperiences)
      .where(eq(candidateExperiences.candidateId, c.id))
      .orderBy(asc(candidateExperiences.sortOrder), desc(candidateExperiences.startDate)),
    db
      .select()
      .from(candidateEducations)
      .where(eq(candidateEducations.candidateId, c.id))
      .orderBy(asc(candidateEducations.sortOrder), desc(candidateEducations.endYear)),
    db
      .select()
      .from(candidateSkills)
      .where(eq(candidateSkills.candidateId, c.id))
      .orderBy(asc(candidateSkills.sortOrder)),
    db
      .select()
      .from(candidateLanguages)
      .where(eq(candidateLanguages.candidateId, c.id))
      .orderBy(asc(candidateLanguages.sortOrder)),
  ]);

  // Nunca expor passwordHash, resetToken, rawResumeText etc
  const { passwordHash, resetToken, resetTokenExpiresAt, rawResumeText, ...safe } = c;

  return NextResponse.json({
    candidate: safe,
    experiences,
    educations,
    skills,
    languages,
  });
}

const EDITABLE_FIELDS = [
  "name", "phone", "phoneAlt", "cpf", "rg", "birthDate", "age",
  "gender", "maritalStatus", "nationality",
  "cep", "address", "addressNumber", "addressComplement", "neighborhood",
  "city", "state",
  "linkedinUrl", "githubUrl", "portfolioUrl", "summary",
  "currentCompany", "currentRole", "yearsExperience", "educationLevel", "expectedSalary",
] as const;

export async function PATCH(request: NextRequest) {
  let session;
  try {
    session = await requireCandidateSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json();
  const update: Record<string, unknown> = {};
  for (const k of EDITABLE_FIELDS) {
    if (k in body) update[k] = body[k] === "" ? null : body[k];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido pra atualizar" }, { status: 400 });
  }
  update.updatedAt = new Date();

  await db.update(candidates).set(update).where(eq(candidates.id, session.candidateId));
  return NextResponse.json({ ok: true });
}
