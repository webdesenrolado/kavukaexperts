import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { candidates, applications, assessments } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import { CandidatesListClient } from "./list-client";

export const dynamic = "force-dynamic";

interface CandidateRow {
  id: string;
  name: string;
  email: string;
  city: string | null;
  state: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  expectedSalary: number | null;
  avatarUrl: string | null;
  applicationCount: number;
  assessmentCount: number;
  scoreHumano: number | null;
  bigFive: { O?: string; C?: string; E?: string; A?: string; N?: string };
  discProfile: string | null;
  labelGuep: string | null;
  mbti: string | null;
}

async function fetchCandidates(): Promise<CandidateRow[]> {
  // 1. Lista base de candidatos
  const list = await db.select().from(candidates).orderBy(desc(candidates.createdAt));

  if (list.length === 0) return [];

  // 2. Contagens em UMA query agregando por candidate_id
  const appCounts = await db
    .select({ id: applications.candidateId, c: sql<number>`count(*)` })
    .from(applications)
    .groupBy(applications.candidateId);
  const appMap = Object.fromEntries(appCounts.map((r) => [r.id, r.c]));

  const assessCounts = await db
    .select({ id: assessments.candidateId, c: sql<number>`count(*)` })
    .from(assessments)
    .where(sql`${assessments.status} = 'completed'`)
    .groupBy(assessments.candidateId);
  const assessMap = Object.fromEntries(assessCounts.map((r) => [r.id, r.c]));

  // 3. Carrega TODAS assessments completed dos instrumentos relevantes pra extrair traits
  const traitRows = await db
    .select({
      candidateId: assessments.candidateId,
      instrument: assessments.instrument,
      scoresJson: assessments.scoresJson,
    })
    .from(assessments)
    .where(sql`${assessments.status} = 'completed'`);

  const traitsByCandidate: Record<string, Record<string, any>> = {};
  for (const r of traitRows) {
    if (!r.scoresJson) continue;
    try {
      traitsByCandidate[r.candidateId] = traitsByCandidate[r.candidateId] || {};
      traitsByCandidate[r.candidateId][r.instrument] = JSON.parse(r.scoresJson);
    } catch {}
  }

  return list.map((c) => {
    const traits = traitsByCandidate[c.id] || {};
    const ipipDomains = traits["ipip-neo-120"]?.domains || traits["bigfive-short"]?.domains || {};
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      city: c.city,
      state: c.state,
      currentRole: c.currentRole,
      currentCompany: c.currentCompany,
      yearsExperience: c.yearsExperience ?? null,
      educationLevel: c.educationLevel ?? null,
      expectedSalary: c.expectedSalary ?? null,
      avatarUrl: c.avatarUrl,
      applicationCount: appMap[c.id] ?? 0,
      assessmentCount: assessMap[c.id] ?? 0,
      scoreHumano: traits["score-humano"]?.score ?? null,
      bigFive: {
        O: ipipDomains.O?.level,
        C: ipipDomains.C?.level,
        E: ipipDomains.E?.level,
        A: ipipDomains.A?.level,
        N: ipipDomains.N?.level,
      },
      discProfile: traits["disc-adapt"]?.profile ?? null,
      labelGuep: traits["label-guep"]?.label ?? null,
      mbti: traits["mbti-like"]?.type ?? null,
    };
  });
}

export default async function CandidatosPage() {
  const list = await fetchCandidates();
  return (
    <AppShell>
      <CandidatesListClient candidates={list} />
    </AppShell>
  );
}

export type { CandidateRow };
