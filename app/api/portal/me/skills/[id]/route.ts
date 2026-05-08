import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateSkills } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ensureOwnership } from "@/lib/portal/crud-helpers";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await ensureOwnership(candidateSkills, id);
  if (guard instanceof NextResponse) return guard;
  const { session } = guard;

  const body = await request.json();
  const update: Record<string, unknown> = {};
  for (const k of ["skill", "level", "category", "yearsOfUse", "sortOrder"]) {
    if (k in body) update[k] = body[k] === "" ? null : body[k];
  }

  await db
    .update(candidateSkills)
    .set(update)
    .where(and(eq(candidateSkills.id, id), eq(candidateSkills.candidateId, session.candidateId)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await ensureOwnership(candidateSkills, id);
  if (guard instanceof NextResponse) return guard;
  const { session } = guard;

  await db
    .delete(candidateSkills)
    .where(and(eq(candidateSkills.id, id), eq(candidateSkills.candidateId, session.candidateId)));

  return NextResponse.json({ ok: true });
}
