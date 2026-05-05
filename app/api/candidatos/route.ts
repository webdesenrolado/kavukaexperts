import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  source: z.string().optional(),
  consent: z.boolean(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  if (!parsed.data.consent) {
    return NextResponse.json(
      { error: "Consentimento LGPD é obrigatório para cadastrar um candidato." },
      { status: 400 },
    );
  }

  const id = nanoid();
  await db.insert(candidates).values({
    id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    cpf: parsed.data.cpf,
    city: parsed.data.city,
    state: parsed.data.state,
    linkedinUrl: parsed.data.linkedinUrl || null,
    currentCompany: parsed.data.currentCompany,
    currentRole: parsed.data.currentRole,
    source: parsed.data.source || "manual",
    consentLgpdAt: new Date(),
  });

  return NextResponse.json({ id }, { status: 201 });
}
