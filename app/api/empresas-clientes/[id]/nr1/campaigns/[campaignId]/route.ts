import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { nr1Campaigns, nr1Invitations, nr1Responses, employees } from "@/db/schema";
import { and, eq, count, desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { canAccessClientCompany } from "@/lib/auth/access";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; campaignId: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, campaignId } = await ctx.params;
  if (!canAccessClientCompany(session, id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const campaign = await db.query.nr1Campaigns.findFirst({
    where: and(eq(nr1Campaigns.id, campaignId), eq(nr1Campaigns.companyId, id)),
  });
  if (!campaign) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const invs = await db
    .select()
    .from(nr1Invitations)
    .where(eq(nr1Invitations.campaignId, campaignId))
    .orderBy(desc(nr1Invitations.createdAt));

  const respCount = await db
    .select({ n: count(nr1Responses.id) })
    .from(nr1Responses)
    .where(eq(nr1Responses.campaignId, campaignId));

  return NextResponse.json({
    campaign,
    invitations: invs,
    responseCount: Number(respCount[0]?.n ?? 0),
  });
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; campaignId: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, campaignId } = await ctx.params;
  if (!canAccessClientCompany(session, id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await request.json();
  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const k of ["name", "description", "status", "endsAt", "isAnonymous"]) {
    if (k in body) update[k] = k === "endsAt" && body[k] ? new Date(body[k]) : body[k];
  }
  if (body.status === "closed") update.closedAt = new Date();
  await db
    .update(nr1Campaigns)
    .set(update)
    .where(and(eq(nr1Campaigns.id, campaignId), eq(nr1Campaigns.companyId, id)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; campaignId: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, campaignId } = await ctx.params;
  if (!canAccessClientCompany(session, id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  await db
    .delete(nr1Campaigns)
    .where(and(eq(nr1Campaigns.id, campaignId), eq(nr1Campaigns.companyId, id)));
  return NextResponse.json({ ok: true });
}
