import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidateExperiences } from "@/db/schema";
import { authedSession } from "@/lib/portal/crud-helpers";

export async function POST(request: NextRequest) {
  const session = await authedSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  if (!body.company || !body.role) {
    return NextResponse.json({ error: "Empresa e cargo são obrigatórios" }, { status: 400 });
  }

  const id = nanoid();
  await db.insert(candidateExperiences).values({
    id,
    candidateId: session.candidateId,
    company: body.company,
    role: body.role,
    location: body.location || null,
    employmentType: body.employmentType || null,
    startDate: body.startDate || null,
    endDate: body.endDate || null,
    current: !!body.current,
    description: body.description || null,
    achievements: body.achievements || null,
    sortOrder: body.sortOrder ?? 0,
  });

  return NextResponse.json({ id });
}
