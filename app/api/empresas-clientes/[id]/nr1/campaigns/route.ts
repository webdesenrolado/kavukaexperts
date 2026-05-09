import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { companies, nr1Campaigns } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { VERSION as QV } from "@/lib/nr1/questions";

async function ensureClient(companyId: string) {
  const c = await db.query.companies.findFirst({
    where: and(eq(companies.id, companyId), eq(companies.kind, "client")),
  });
  return !!c;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    if (!(await ensureClient(id))) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    const list = await db
      .select()
      .from(nr1Campaigns)
      .where(eq(nr1Campaigns.companyId, id))
      .orderBy(desc(nr1Campaigns.createdAt));
    return NextResponse.json({ campaigns: list });
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!(await ensureClient(id))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const campaignId = nanoid();
  await db.insert(nr1Campaigns).values({
    id: campaignId,
    companyId: id,
    name: body.name.trim(),
    description: body.description || null,
    questionnaireVersion: QV,
    status: "active",
    isAnonymous: body.isAnonymous !== false,
    startedAt: new Date(),
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
    createdBy: session.userId,
  });
  return NextResponse.json({ id: campaignId });
}
