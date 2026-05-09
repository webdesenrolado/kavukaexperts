/**
 * Aplica os dados extraídos pelo Gemini (dbtalentos/extracted-deep.json) no DB.
 *
 * Pra cada candidato:
 * - UPDATE em candidates (summary, currentRole, currentCompany, yearsExperience,
 *   educationLevel, linkedinUrl, githubUrl, portfolioUrl, phone, cep, neighborhood)
 * - DELETE existentes em candidate_experiences/educations/skills/languages
 * - INSERT novos
 *
 * Uso: npm run apply:deep
 */
import * as fs from "fs";
import * as path from "path";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  candidates,
  candidateExperiences,
  candidateEducations,
  candidateSkills,
  candidateLanguages,
} from "../db/schema";

const INPUT = path.resolve(__dirname, "..", "dbtalentos", "extracted-deep.json");

const EDUCATION_LEVEL_MAP: Record<string, string> = {
  medio: "medio",
  tecnico: "tecnico",
  tecnologo: "superior_incompleto",
  superior_incompleto: "superior_incompleto",
  superior: "superior",
  graduacao: "superior",
  pos: "pos",
  mba: "pos",
  mestrado: "mestrado",
  doutorado: "doutorado",
};

function clamp(s: any, max: number): string | null {
  if (typeof s !== "string") return null;
  const t = s.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

function intOrNull(v: any): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.floor(v);
  if (typeof v === "string" && v.trim()) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`❌ ${INPUT} não encontrado. Rode extract-deep-gemini.py primeiro.`);
    process.exit(1);
  }

  console.log(`📥 Carregando ${INPUT}`);
  const data = JSON.parse(fs.readFileSync(INPUT, "utf-8"));
  const items: any[] = data.candidates;
  console.log(`   ${items.length} candidatos extraídos\n`);

  let updated = 0;
  let exp = 0,
    edu = 0,
    sk = 0,
    lang = 0;

  for (const c of items) {
    const id = c.id;
    if (!id) continue;

    // 1. UPDATE candidates
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (c.summary) update.summary = clamp(c.summary, 500);
    if (c.currentRole) update.currentRole = clamp(c.currentRole, 200);
    if (c.currentCompany) update.currentCompany = clamp(c.currentCompany, 200);
    if (c.yearsExperience != null) update.yearsExperience = intOrNull(c.yearsExperience);
    if (c.educationLevel && EDUCATION_LEVEL_MAP[c.educationLevel]) {
      update.educationLevel = EDUCATION_LEVEL_MAP[c.educationLevel];
    }
    if (c.linkedinUrl) update.linkedinUrl = clamp(c.linkedinUrl, 300);
    if (c.githubUrl) update.githubUrl = clamp(c.githubUrl, 300);
    if (c.portfolioUrl) update.portfolioUrl = clamp(c.portfolioUrl, 300);
    if (c.cep) update.cep = clamp(c.cep, 12);
    if (c.neighborhood) update.neighborhood = clamp(c.neighborhood, 120);
    // phone só atualiza se candidato não tem (preserva o que veio do CSV)
    if (c.phone) {
      const cur = await db.query.candidates.findFirst({
        where: eq(candidates.id, id),
        columns: { phone: true, phoneAlt: true },
      });
      if (cur && !cur.phone) update.phone = clamp(c.phone, 50);
      else if (cur && !cur.phoneAlt && cur.phone !== c.phone) update.phoneAlt = clamp(c.phone, 50);
    }

    await db.update(candidates).set(update).where(eq(candidates.id, id));
    updated++;

    // 2. Limpa registros antigos das 4 tabelas (cascade não funciona em update, then re-insert)
    await db.delete(candidateExperiences).where(eq(candidateExperiences.candidateId, id));
    await db.delete(candidateEducations).where(eq(candidateEducations.candidateId, id));
    await db.delete(candidateSkills).where(eq(candidateSkills.candidateId, id));
    await db.delete(candidateLanguages).where(eq(candidateLanguages.candidateId, id));

    // 3. INSERT experiências
    if (Array.isArray(c.experiences) && c.experiences.length > 0) {
      const rows = c.experiences
        .filter((e: any) => e?.company && e?.role)
        .map((e: any, i: number) => ({
          id: nanoid(),
          candidateId: id,
          company: clamp(e.company, 200)!,
          role: clamp(e.role, 200)!,
          location: clamp(e.location, 120),
          employmentType: clamp(e.employmentType, 30),
          startDate: clamp(e.startDate, 30),
          endDate: clamp(e.endDate, 30),
          current: !!e.current,
          description: clamp(e.description, 2000),
          achievements: clamp(e.achievements, 1000),
          sortOrder: i,
        }));
      if (rows.length > 0) {
        await db.insert(candidateExperiences).values(rows);
        exp += rows.length;
      }
    }

    // 4. INSERT educações
    if (Array.isArray(c.educations) && c.educations.length > 0) {
      const rows = c.educations
        .filter((e: any) => e?.institution)
        .map((e: any, i: number) => ({
          id: nanoid(),
          candidateId: id,
          institution: clamp(e.institution, 200)!,
          course: clamp(e.course, 200),
          level: clamp(e.level, 30),
          status: clamp(e.status, 30),
          startYear: intOrNull(e.startYear),
          endYear: intOrNull(e.endYear),
          description: clamp(e.description, 1000),
          sortOrder: i,
        }));
      if (rows.length > 0) {
        await db.insert(candidateEducations).values(rows);
        edu += rows.length;
      }
    }

    // 5. INSERT skills
    if (Array.isArray(c.skills) && c.skills.length > 0) {
      const seen = new Set<string>();
      const rows = c.skills
        .filter((s: any) => {
          if (!s?.skill) return false;
          const k = s.skill.toLowerCase().trim();
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        })
        .slice(0, 30) // limit por candidato
        .map((s: any, i: number) => ({
          id: nanoid(),
          candidateId: id,
          skill: clamp(s.skill, 100)!,
          level: clamp(s.level, 30),
          category: clamp(s.category, 50),
          sortOrder: i,
        }));
      if (rows.length > 0) {
        await db.insert(candidateSkills).values(rows);
        sk += rows.length;
      }
    }

    // 6. INSERT idiomas
    if (Array.isArray(c.languages) && c.languages.length > 0) {
      const seen = new Set<string>();
      const rows = c.languages
        .filter((l: any) => {
          if (!l?.language) return false;
          const k = l.language.toLowerCase().trim();
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        })
        .map((l: any, i: number) => ({
          id: nanoid(),
          candidateId: id,
          language: clamp(l.language, 50)!,
          level: clamp(l.level, 30),
          certification: clamp(l.certification, 200),
          sortOrder: i,
        }));
      if (rows.length > 0) {
        await db.insert(candidateLanguages).values(rows);
        lang += rows.length;
      }
    }

    if (updated % 50 === 0) {
      process.stdout.write(`\r  ${updated}/${items.length} candidatos atualizados`);
    }
  }

  console.log(`\r  ✓ ${updated}/${items.length} candidatos atualizados`);
  console.log(`\n📊 Inserções:`);
  console.log(`   ${exp} experiências`);
  console.log(`   ${edu} formações`);
  console.log(`   ${sk} skills`);
  console.log(`   ${lang} idiomas`);
  console.log("\n✅ Aplicado");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
