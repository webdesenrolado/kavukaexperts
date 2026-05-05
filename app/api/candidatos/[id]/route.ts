import { NextResponse } from "next/server";
import { db } from "@/db";
import { candidates, applications, jobs, assessments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, id),
  });
  if (!candidate) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const apps = await db
    .select({
      id: applications.id,
      stage: applications.stage,
      jobId: applications.jobId,
      jobTitle: jobs.title,
      createdAt: applications.createdAt,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.candidateId, id))
    .orderBy(desc(applications.createdAt));

  const assessmentRows = await db
    .select()
    .from(assessments)
    .where(eq(assessments.candidateId, id))
    .orderBy(desc(assessments.createdAt));

  return NextResponse.json({ candidate, applications: apps, assessments: assessmentRows });
}
