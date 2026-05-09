import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

const EDITABLE = ["name", "email", "phone", "cpf", "role", "department", "active"] as const;

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, employeeId } = await ctx.params;
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
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, employeeId } = await ctx.params;
  await db
    .delete(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.companyId, id)));
  return NextResponse.json({ ok: true });
}
