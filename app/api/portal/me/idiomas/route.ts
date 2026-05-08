import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidateLanguages } from "@/db/schema";
import { authedSession } from "@/lib/portal/crud-helpers";

export async function POST(request: NextRequest) {
  const session = await authedSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await request.json();
  if (!body.language) {
    return NextResponse.json({ error: "Idioma é obrigatório" }, { status: 400 });
  }

  const id = nanoid();
  await db.insert(candidateLanguages).values({
    id,
    candidateId: session.candidateId,
    language: body.language,
    level: body.level || null,
    certification: body.certification || null,
    sortOrder: body.sortOrder ?? 0,
  });

  return NextResponse.json({ id });
}
