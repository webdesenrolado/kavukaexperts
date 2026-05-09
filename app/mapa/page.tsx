import { db } from "@/db";
import { candidates, jobs, applications, companies } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { MapaClient } from "./mapa-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mapa — Kavuka Experts" };

export default async function MapaPage() {
  // Empresa principal (única, sem multi-tenant ativo)
  const companyList = await db
    .select({
      id: companies.id,
      name: companies.name,
      lat: companies.lat,
      lng: companies.lng,
      city: companies.city,
      state: companies.state,
    })
    .from(companies);

  // Vagas
  const jobList = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      companyId: jobs.companyId,
    })
    .from(jobs)
    .orderBy(jobs.title);

  // Candidatos com geo
  const candList = await db
    .select({
      id: candidates.id,
      name: candidates.name,
      city: candidates.city,
      state: candidates.state,
      lat: candidates.lat,
      lng: candidates.lng,
    })
    .from(candidates)
    .where(and(isNotNull(candidates.lat), isNotNull(candidates.lng)));

  // Applications (cand × vaga)
  const appList = await db
    .select({
      candidateId: applications.candidateId,
      jobId: applications.jobId,
      stage: applications.stage,
    })
    .from(applications);

  return (
    <AppShell>
      <MapaClient
        companies={companyList as any}
        jobs={jobList as any}
        candidates={candList as any}
        applications={appList as any}
      />
    </AppShell>
  );
}
