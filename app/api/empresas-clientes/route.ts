import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const list = await db.select().from(companies).where(eq(companies.kind, "client"));
  return NextResponse.json({ companies: list });
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const id = nanoid();
  await db.insert(companies).values({
    id,
    name: body.name.trim(),
    cnpj: body.cnpj?.trim() || null,
    industry: body.industry || null,
    size: body.size || null,
    kind: "client",
    address: body.address || null,
    city: body.city || null,
    state: body.state || null,
    contactName: body.contactName || null,
    contactEmail: body.contactEmail || null,
    contactPhone: body.contactPhone || null,
    notes: body.notes || null,
  });

  return NextResponse.json({ id });
}
