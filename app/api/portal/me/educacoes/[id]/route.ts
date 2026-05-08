import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateEducations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ensureOwnership } from "@/lib/portal/crud-helpers";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await ensureOwnership(candidateEducations, id);
  if (guard instanceof NextResponse) return guard;
  const { session } = guard;

  const body = await request.json();
  const update: Record<string, unknown> = {};
  for (const k of [
    "institution", "course", "level", "status",
    "startYear", "endYear", "description", "sortOrder",
  ]) {
    if (k in body) update[k] = body[k] === "" ? null : body[k];
  }

  await db
    .update(candidateEducations)
    .set(update)
    .where(and(eq(candidateEducations.id, id), eq(candidateEducations.candidateId, session.candidateId)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await ensureOwnership(candidateEducations, id);
  if (guard instanceof NextResponse) return guard;
  const { session } = guard;

  await db
    .delete(candidateEducations)
    .where(and(eq(candidateEducations.id, id), eq(candidateEducations.candidateId, session.candidateId)));

  return NextResponse.json({ ok: true });
}
