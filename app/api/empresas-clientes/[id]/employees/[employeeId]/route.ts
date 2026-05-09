import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { canAccessClientCompany } from "@/lib/auth/access";

const EDITABLE = ["name", "email", "phone", "cpf", "role", "department", "active"] as const;

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; employeeId: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, employeeId } = await ctx.params;
  if (!canAccessClientCompany(session, id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await request.json();
  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const k of EDITABLE) if (k in body) update[k] = body[k] === "" ? null : body[k];
  await db
    .update(employees)
    .set(update)
    .where(and(eq(employees.id, employeeId), eq(employees.companyId, id)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; employeeId: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, employeeId } = await ctx.params;
  if (!canAccessClientCompany(session, id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  await db
    .delete(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.companyId, id)));
  return NextResponse.json({ ok: true });
}
