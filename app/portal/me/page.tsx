import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  candidates,
  candidateExperiences,
  candidateEducations,
  candidateSkills,
  candidateLanguages,
  assessments,
} from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { getCandidateSession } from "@/lib/portal/session";
import { MeClient } from "./me-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meu perfil — Kavuka Experts" };

export default async function PortalMePage() {
  const session = await getCandidateSession();
  if (!session) redirect("/portal/login");

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, session.candidateId),
  });
  if (!candidate) redirect("/portal/login");

  const [experiences, educations, skills, languages, assessmentList] = await Promise.all([
    db
      .select()
      .from(candidateExperiences)
      .where(eq(candidateExperiences.candidateId, candidate.id))
      .orderBy(asc(candidateExperiences.sortOrder), desc(candidateExperiences.startDate)),
    db
      .select()
      .from(candidateEducations)
      .where(eq(candidateEducations.candidateId, candidate.id))
      .orderBy(asc(candidateEducations.sortOrder), desc(candidateEducations.endYear)),
    db
      .select()
      .from(candidateSkills)
      .where(eq(candidateSkills.candidateId, candidate.id))
      .orderBy(asc(candidateSkills.sortOrder)),
    db
      .select()
      .from(candidateLanguages)
      .where(eq(candidateLanguages.candidateId, candidate.id))
      .orderBy(asc(candidateLanguages.sortOrder)),
    db
      .select({
        id: assessments.id,
        instrument: assessments.instrument,
        status: assessments.status,
        completedAt: assessments.completedAt,
      })
      .from(assessments)
      .where(eq(assessments.candidateId, candidate.id))
      .orderBy(desc(assessments.completedAt)),
  ]);

  // Drop sensitive fields antes de mandar pro client
  const {
    passwordHash,
    resetToken,
    resetTokenExpiresAt,
    rawResumeText,
    ...safeCandidate
  } = candidate;

  return (
    <MeClient
      initialCandidate={safeCandidate as any}
      initialExperiences={experiences as any}
      initialEducations={educations as any}
      initialSkills={skills as any}
      initialLanguages={languages as any}
      initialAssessments={assessmentList as any}
    />
  );
}
