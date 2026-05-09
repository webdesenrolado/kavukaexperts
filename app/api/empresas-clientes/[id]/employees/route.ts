import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { employees, companies } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { canAccessClientCompany } from "@/lib/auth/access";

async function ensureClient(companyId: string) {
  const c = await db.query.companies.findFirst({
    where: and(eq(companies.id, companyId), eq(companies.kind, "client")),
  });
  return !!c;
}

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
  if (!(await ensureClient(id))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  const list = await db
    .select()
    .from(employees)
    .where(eq(employees.companyId, id))
    .orderBy(desc(employees.createdAt));
  return NextResponse.json({ employees: list });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
  if (!(await ensureClient(id))) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const empId = nanoid();
  await db.insert(employees).values({
    id: empId,
    companyId: id,
    name: body.name.trim(),
    email: body.email?.trim().toLowerCase() || null,
    phone: body.phone?.trim() || null,
    cpf: body.cpf?.trim() || null,
    role: body.role?.trim() || null,
    department: body.department?.trim() || null,
    hiredAt: body.hiredAt ? new Date(body.hiredAt) : null,
    active: body.active !== false,
  });
  return NextResponse.json({ id: empId });
}
