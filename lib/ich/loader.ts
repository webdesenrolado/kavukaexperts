/**
 * Carrega todos os dados necessários para gerar a apostila ICH de um candidato.
 * Compartilhado entre /portal/me/apostila e /candidatos/[id]/apostila.
 */

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
import { computeSkillsIndex } from "./skills-index";
import { computeBehavioralIndex } from "./behavioral-index";
import { generateNarrative } from "./narrative";

export async function loadApostilaData(candidateId: string) {
  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, candidateId),
  });
  if (!candidate) return null;

  const [experiences, educations, skills, languages, assessmentList] = await Promise.all([
    db
      .select()
      .from(candidateExperiences)
      .where(eq(candidateExperiences.candidateId, candidateId))
      .orderBy(asc(candidateExperiences.sortOrder), desc(candidateExperiences.startDate)),
    db
      .select()
      .from(candidateEducations)
      .where(eq(candidateEducations.candidateId, candidateId))
      .orderBy(asc(candidateEducations.sortOrder), desc(candidateEducations.endYear)),
    db
      .select()
      .from(candidateSkills)
      .where(eq(candidateSkills.candidateId, candidateId))
      .orderBy(asc(candidateSkills.sortOrder)),
    db
      .select()
      .from(candidateLanguages)
      .where(eq(candidateLanguages.candidateId, candidateId))
      .orderBy(asc(candidateLanguages.sortOrder)),
    db
      .select()
      .from(assessments)
      .where(eq(assessments.candidateId, candidateId))
      .orderBy(desc(assessments.completedAt)),
  ]);

  const skillsIndex = computeSkillsIndex(skills);
  const behavioralIndex = computeBehavioralIndex(assessmentList);
  const narrative = generateNarrative({
    name: candidate.name,
    currentRole: candidate.currentRole,
    yearsExperience: candidate.yearsExperience,
    educationLevel: candidate.educationLevel,
    city: candidate.city,
    state: candidate.state,
    summary: candidate.summary,
    skills: skillsIndex,
    behavioral: behavioralIndex,
    experiencesCount: experiences.length,
    educationsCount: educations.length,
    languagesCount: languages.length,
  });

  return {
    candidate,
    experiences,
    educations,
    skills,
    languages,
    assessments: assessmentList,
    skillsIndex,
    behavioralIndex,
    narrative,
  };
}
