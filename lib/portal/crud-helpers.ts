import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { requireCandidateSession } from "./session";

/**
 * Garante que o registro pertence ao candidato logado.
 * Retorna { session } se ok, ou NextResponse de erro pra retornar.
 */
export async function ensureOwnership<T extends { id: any; candidateId: any }>(
  table: any,
  rowId: string
): Promise<{ session: { candidateId: string; email: string } } | NextResponse> {
  let session;
  try {
    session = await requireCandidateSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const row = await db
    .select()
    .from(table)
    .where(and(eq(table.id, rowId), eq(table.candidateId, session.candidateId)))
    .limit(1);

  if (row.length === 0) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return { session };
}

export async function authedSession() {
  try {
    return await requireCandidateSession();
  } catch {
    return null;
  }
}
