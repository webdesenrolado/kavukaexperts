import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidateSkills } from "@/db/schema";
import { authedSession } from "@/lib/portal/crud-helpers";

export async function POST(request: NextRequest) {
  const session = await authedSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  if (!body.skill) {
    return NextResponse.json({ error: "Skill é obrigatória" }, { status: 400 });
  }

  const id = nanoid();
  await db.insert(candidateSkills).values({
    id,
    candidateId: session.candidateId,
    skill: body.skill,
    level: body.level || null,
    category: body.category || null,
    yearsOfUse: body.yearsOfUse || null,
    sortOrder: body.sortOrder ?? 0,
  });

  return NextResponse.json({ id });
}
