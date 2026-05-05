import { db } from "@/db";
import { jobs, companies } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { CarreirasClient } from "./client";

interface PublicJob {
  id: string;
  slug: string | null;
  title: string;
  location: string | null;
  remote: string | null;
  seniority: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string | null;
  companyName: string | null;
  publishedAt: Date | null;
}

async function fetchOpenJobs(): Promise<PublicJob[]> {
  return db
    .select({
      id: jobs.id,
      slug: jobs.slug,
      title: jobs.title,
      location: jobs.location,
      remote: jobs.remote,
      seniority: jobs.seniority,
      employmentType: jobs.employmentType,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      description: jobs.description,
      companyName: companies.name,
      publishedAt: jobs.publishedAt,
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(sql`${jobs.publiclyOpen} = true AND ${jobs.status} = 'open'`)
    .orderBy(desc(jobs.publishedAt));
}

export default async function CarreirasPage() {
  const list = await fetchOpenJobs();
  return <CarreirasClient jobs={list} />;
}

export type { PublicJob };
