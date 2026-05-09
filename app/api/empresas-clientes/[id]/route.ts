import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { canAccessClientCompany, canManagePlatform } from "@/lib/auth/access";

const EDITABLE = [
  "name", "cnpj", "industry", "size", "address", "city", "state",
  "contactName", "contactEmail", "contactPhone", "notes",
] as const;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!canAccessClientCompany(session, id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const c = await db.query.companies.findFirst({
    where: and(eq(companies.id, id), eq(companies.kind, "client")),
  });
  if (!c) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ company: c });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!canAccessClientCompany(session, id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await request.json();
  const update: Record<string, unknown> = {};
  for (const k of EDITABLE) if (k in body) update[k] = body[k] === "" ? null : body[k];
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada a atualizar" }, { status: 400 });
  }
  await db.update(companies).set(update).where(and(eq(companies.id, id), eq(companies.kind, "client")));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  // Apenas master/recruiter da plataforma pode deletar empresa cliente
  if (!canManagePlatform(session)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await db.delete(companies).where(and(eq(companies.id, id), eq(companies.kind, "client")));
  return NextResponse.json({ ok: true });
}
