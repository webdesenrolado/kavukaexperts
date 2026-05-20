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

  // Dedupe por instrumento: mantém a mais recente concluída.
  // Histórico fica preservado no DB; aqui só filtramos pro ICH/índice.
  // Se um instrumento só tem entry não-concluída, ainda aparece (1 entry).
  const dedupedAssessments = dedupeLatestPerInstrument(assessmentList);

  const skillsIndex = computeSkillsIndex(skills);
  const behavioralIndex = computeBehavioralIndex(dedupedAssessments);
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
    assessments: dedupedAssessments,
    skillsIndex,
    behavioralIndex,
    narrative,
  };
}

/**
 * Pega N assessments do candidato (vários instrumentos, vários retries) e retorna
 * 1 por instrumento: prefere o mais recente concluído; se nenhum concluído,
 * cai pro mais recente em qualquer status.
 *
 * Espera input ordenado por completedAt DESC (Postgres pos NULLS primeiro em DESC,
 * mas a logica abaixo nao depende disso — compara completedAt explicitamente).
 */
function dedupeLatestPerInstrument<T extends { instrument: string; status: string; completedAt: Date | null }>(
  list: T[],
): T[] {
  const best = new Map<string, T>();
  for (const a of list) {
    const cur = best.get(a.instrument);
    if (!cur) {
      best.set(a.instrument, a);
      continue;
    }
    // Concluido sempre ganha de pendente
    const aDone = a.status === "completed";
    const cDone = cur.status === "completed";
    if (aDone && !cDone) {
      best.set(a.instrument, a);
      continue;
    }
    if (!aDone && cDone) continue;
    // Mesmo status: o mais recente vence
    const at = a.completedAt?.getTime() ?? 0;
    const ct = cur.completedAt?.getTime() ?? 0;
    if (at > ct) best.set(a.instrument, a);
  }
  return Array.from(best.values()).sort((x, y) => {
    const xt = x.completedAt?.getTime() ?? 0;
    const yt = y.completedAt?.getTime() ?? 0;
    return yt - xt;
  });
}
