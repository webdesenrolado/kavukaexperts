/**
 * GET /api/public/jobs
 * Lista pública de vagas (publiclyOpen=true e status=open).
 * Consumido pelo site kavukavagas.com.br.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { applyCors, corsPreflight } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function GET(request: NextRequest) {
  const list = await db
    .select({
      id: jobs.id,
      slug: jobs.slug,
      title: jobs.title,
      description: jobs.description,
      location: jobs.location,
      remote: jobs.remote,
      seniority: jobs.seniority,
      employmentType: jobs.employmentType,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      publishedAt: jobs.publishedAt,
      createdAt: jobs.createdAt,
      companyName: companies.name,
      companyLogoUrl: companies.logoUrl,
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(sql`${jobs.publiclyOpen} = true AND ${jobs.status} = 'open'`)
    .orderBy(desc(jobs.publishedAt));

  return applyCors(request, NextResponse.json({ jobs: list }));
}
