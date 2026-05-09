import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { requireSession } from "@/lib/auth/session";

/**
 * POST /api/empresas-clientes/[id]/admin
 * Cria user com role=company_admin pra essa empresa cliente.
 * Body: { name, email, password? }
 * Se password não vier, gera uma senha temporária e retorna pro chamador.
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  // Só master/recruiter da plataforma cria admin de empresa cliente
  if (session.role !== "master" && session.role !== "recruiter") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const company = await db.query.companies.findFirst({
    where: and(eq(companies.id, id), eq(companies.kind, "client")),
  });
  if (!company) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const body = await request.json();
  if (!body.name || !body.email) {
    return NextResponse.json({ error: "Nome e email obrigatórios" }, { status: 400 });
  }
  const email = body.email.toLowerCase().trim();

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe usuário com esse email" },
      { status: 409 }
    );
  }

  // Gera senha temporária se não passada (8 chars: 2 letras + 6 dígitos pra fácil de digitar)
  const tempPassword =
    body.password ||
    `Kv${Math.random().toString(36).slice(2, 4).toUpperCase()}${Math.floor(100000 + Math.random() * 900000)}`;

  const passwordHash = await hashPassword(tempPassword);
  const userId = nanoid();
  await db.insert(users).values({
    id: userId,
    companyId: id,
    email,
    passwordHash,
    name: body.name.trim(),
    role: "company_admin",
    active: true,
  });

  return NextResponse.json({
    id: userId,
    email,
    name: body.name,
    tempPassword: body.password ? null : tempPassword,
  });
}
