import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidateEducations } from "@/db/schema";
import { authedSession } from "@/lib/portal/crud-helpers";

export async function POST(request: NextRequest) {
  const session = await authedSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  if (!body.institution) {
    return NextResponse.json({ error: "Instituição é obrigatória" }, { status: 400 });
  }

  const id = nanoid();
  await db.insert(candidateEducations).values({
    id,
    candidateId: session.candidateId,
    institution: body.institution,
    course: body.course || null,
    level: body.level || null,
    status: body.status || null,
    startYear: body.startYear || null,
    endYear: body.endYear || null,
    description: body.description || null,
    sortOrder: body.sortOrder ?? 0,
  });

  return NextResponse.json({ id });
}
