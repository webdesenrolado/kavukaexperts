import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateLinks } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ensureOwnership } from "@/lib/portal/crud-helpers";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await ensureOwnership(candidateLinks, id);
  if (guard instanceof NextResponse) return guard;
  const { session } = guard;

  const body = await request.json();
  const update: Record<string, unknown> = {};
  if ("url" in body) {
    const url = String(body.url || "").trim();
    if (!/^https?:\/\/.+\..+/.test(url)) {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }
    update.url = url;
  }
  if ("label" in body) update.label = body.label ? String(body.label).slice(0, 60) : null;
  if ("sortOrder" in body && typeof body.sortOrder === "number") update.sortOrder = body.sortOrder;

  await db
    .update(candidateLinks)
    .set(update)
    .where(and(eq(candidateLinks.id, id), eq(candidateLinks.candidateId, session.candidateId)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await ensureOwnership(candidateLinks, id);
  if (guard instanceof NextResponse) return guard;
  const { session } = guard;
  await db
    .delete(candidateLinks)
    .where(and(eq(candidateLinks.id, id), eq(candidateLinks.candidateId, session.candidateId)));
  return NextResponse.json({ ok: true });
}
