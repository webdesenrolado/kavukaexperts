/**
 * GET /api/public/jobs/[slug]
 * Detalhe público de uma vaga publiclyOpen=true.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, companies } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { applyCors, corsPreflight } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const row = await db
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
      idealProfileJson: jobs.idealProfileJson,
      assessmentsJson: jobs.assessmentsJson,
      companyName: companies.name,
      companyLogoUrl: companies.logoUrl,
      companyIndustry: companies.industry,
      companyCity: companies.city,
      companyState: companies.state,
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(
      and(
        eq(jobs.slug, slug),
        sql`${jobs.publiclyOpen} = true AND ${jobs.status} = 'open'`,
      ),
    )
    .limit(1);

  if (row.length === 0) {
    return applyCors(
      request,
      NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 }),
    );
  }

  return applyCors(request, NextResponse.json({ job: row[0] }));
}
