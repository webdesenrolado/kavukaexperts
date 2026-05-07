/**
 * Lê dbtalentos/extracted.json e popula o DB.
 *
 * Pré-requisitos:
 * - dbtalentos/extracted.json gerado pelo extract-csv-talentos.py
 * - Vagas já criadas (rode npm run seed:vagas antes)
 *
 * Uso:
 *   npm run import:talentos
 */
import * as fs from "fs";
import * as path from "path";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { candidates, jobs, applications } from "../db/schema";

const EXTRACTED = path.resolve(__dirname, "..", "dbtalentos", "extracted.json");

type ExtractedCandidate = {
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  age: number | null;
  birthDate: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  summary: string | null;
  resumeUrl: string | null;
  resumeFilename: string | null;
  rawResumeText: string | null;
  source: string;
  consentLgpdAt: string;
};

type ExtractedApplication = {
  candidateEmail: string;
  jobTitle: string;
  source: string;
  notes: string | null;
  appliedAt: string;
  status: string;
};

function genKyid(): string {
  return nanoid(32);
}

async function main() {
  if (!fs.existsSync(EXTRACTED)) {
    console.error(`❌ Arquivo não encontrado: ${EXTRACTED}`);
    console.error(`   Rode primeiro: python3 scripts/extract-csv-talentos.py`);
    process.exit(1);
  }

  console.log(`📥 Carregando ${EXTRACTED}`);
  const data = JSON.parse(fs.readFileSync(EXTRACTED, "utf-8"));
  const extractedCandidates: ExtractedCandidate[] = data.candidates;
  const extractedApps: ExtractedApplication[] = data.applications;
  console.log(`   ${extractedCandidates.length} candidatos`);
  console.log(`   ${extractedApps.length} applications\n`);

  // 1. Carregar jobs existentes (cache por título)
  const allJobs = await db.select().from(jobs);
  const jobsByTitle = new Map<string, string>();
  for (const j of allJobs) {
    jobsByTitle.set(j.title.trim(), j.id);
  }
  console.log(`📌 ${allJobs.length} vagas no DB`);
  if (allJobs.length === 0) {
    console.error("❌ Nenhuma vaga no DB. Rode 'npm run seed:vagas' primeiro.");
    process.exit(1);
  }

  // 2. Inserir candidates em batch (skipa quem já existe)
  console.log("\n👤 Inserindo candidates...");
  const existingEmails = new Set(
    (await db.select({ email: candidates.email }).from(candidates)).map((c) => c.email.toLowerCase())
  );

  const candidateIdByEmail = new Map<string, string>();
  // pré-carrega ids dos já existentes
  const existing = await db.select({ id: candidates.id, email: candidates.email }).from(candidates);
  for (const c of existing) candidateIdByEmail.set(c.email.toLowerCase(), c.id);

  const toInsert = extractedCandidates.filter((c) => !existingEmails.has(c.email));
  console.log(`   ${toInsert.length} novos | ${extractedCandidates.length - toInsert.length} já existiam`);

  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const slice = toInsert.slice(i, i + BATCH).map((c) => {
      const id = nanoid();
      candidateIdByEmail.set(c.email, id);
      return {
        id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        cep: c.cep,
        city: c.city,
        state: c.state,
        age: c.age,
        birthDate: c.birthDate,
        linkedinUrl: c.linkedinUrl,
        githubUrl: c.githubUrl,
        summary: c.summary,
        resumeUrl: c.resumeUrl,
        resumeFilename: c.resumeFilename,
        rawResumeText: c.rawResumeText,
        source: c.source,
        consentLgpdAt: c.consentLgpdAt ? new Date(c.consentLgpdAt) : null,
        kyidToken: genKyid(),
      };
    });
    await db.insert(candidates).values(slice);
    inserted += slice.length;
    process.stdout.write(`\r   inseridos ${inserted}/${toInsert.length}`);
  }
  console.log(`\r   ✓ ${inserted}/${toInsert.length} candidates inseridos`);

  // 3. Inserir applications em batch
  console.log("\n📋 Inserindo applications...");
  let okApps = 0, skippedNoJob = 0, skippedNoCand = 0;
  const missingJobs = new Map<string, number>();

  const appsToInsert: any[] = [];
  for (const a of extractedApps) {
    const candidateId = candidateIdByEmail.get(a.candidateEmail);
    if (!candidateId) {
      skippedNoCand++;
      continue;
    }
    const jobId = jobsByTitle.get(a.jobTitle.trim());
    if (!jobId) {
      skippedNoJob++;
      missingJobs.set(a.jobTitle, (missingJobs.get(a.jobTitle) || 0) + 1);
      continue;
    }
    appsToInsert.push({
      id: nanoid(),
      jobId,
      candidateId,
      stage: "applied",
      source: a.source,
      notes: a.notes,
      createdAt: a.appliedAt ? new Date(a.appliedAt) : new Date(),
    });
  }

  for (let i = 0; i < appsToInsert.length; i += BATCH) {
    const slice = appsToInsert.slice(i, i + BATCH);
    await db.insert(applications).values(slice);
    okApps += slice.length;
    process.stdout.write(`\r   inseridos ${okApps}/${appsToInsert.length}`);
  }
  console.log(`\r   ✓ ${okApps} applications inseridas`);
  console.log(`   ⚠️  skipped (job não encontrado): ${skippedNoJob}`);
  console.log(`   ⚠️  skipped (candidato não encontrado): ${skippedNoCand}`);
  if (missingJobs.size > 0) {
    console.log("\n   Títulos de vaga não encontrados no DB:");
    for (const [title, count] of [...missingJobs.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`     ${count.toString().padStart(4)}  ${title}`);
    }
  }

  console.log("\n✅ Importação concluída");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
