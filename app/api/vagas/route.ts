import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { jobs, companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  location: z.string().optional(),
  remote: z.enum(["on_site", "hybrid", "remote"]).optional(),
  employmentType: z.enum(["clt", "pj", "freelance", "internship"]).optional(),
  seniority: z.enum(["junior", "pleno", "senior", "especialista", "lideranca"]).optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  assessments: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  let companyId = session.companyId;
  if (!companyId) {
    const fallback = await db.query.companies.findFirst();
    if (!fallback) {
      return NextResponse.json(
        { error: "Nenhuma empresa cadastrada. Rode `npm run seed`." },
        { status: 400 }
      );
    }
    companyId = fallback.id;
  }

  const id = nanoid();
  await db.insert(jobs).values({
    id,
    companyId,
    title: parsed.data.title,
    description: parsed.data.description,
    location: parsed.data.location,
    remote: parsed.data.remote || "on_site",
    employmentType: parsed.data.employmentType || "clt",
    seniority: parsed.data.seniority,
    salaryMin: parsed.data.salaryMin ?? null,
    salaryMax: parsed.data.salaryMax ?? null,
    assessmentsJson: JSON.stringify(parsed.data.assessments || []),
    ownerId: session.userId,
    status: "draft",
  });

  return NextResponse.json({ id }, { status: 201 });
}
