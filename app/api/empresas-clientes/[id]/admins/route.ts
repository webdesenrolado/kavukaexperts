import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { canAccessClientCompany } from "@/lib/auth/access";

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
  const list = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(and(eq(users.companyId, id), eq(users.role, "company_admin")));
  return NextResponse.json({ admins: list });
}
