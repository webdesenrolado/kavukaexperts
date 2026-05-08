import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { signCandidateToken } from "@/lib/portal/jwt";
import { PORTAL_COOKIE, cookieSecure } from "@/lib/portal/session";

export async function POST(request: NextRequest) {
  const { name, email, password, phone, consentLgpd } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Senha precisa ter ao menos 6 caracteres" }, { status: 400 });
  }
  if (!consentLgpd) {
    return NextResponse.json(
      { error: "Você precisa aceitar os termos LGPD" },
      { status: 400 }
    );
  }

  const emailNorm = email.toLowerCase().trim();
  const existing = await db.query.candidates.findFirst({
    where: eq(candidates.email, emailNorm),
  });

  const passwordHash = await hashPassword(password);

  let candidateId: string;
  if (existing) {
    // Reativação: candidato já importado mas sem senha — define senha agora
    if (existing.passwordHash) {
      return NextResponse.json(
        { error: "Já existe uma conta com este email. Faça login ou recupere a senha." },
        { status: 409 }
      );
    }
    await db
      .update(candidates)
      .set({
        passwordHash,
        name: name.trim(),
        phone: phone || existing.phone,
        consentLgpdAt: existing.consentLgpdAt ?? new Date(),
        lastLoginAt: new Date(),
      })
      .where(eq(candidates.id, existing.id));
    candidateId = existing.id;
  } else {
    candidateId = nanoid();
    await db.insert(candidates).values({
      id: candidateId,
      name: name.trim(),
      email: emailNorm,
      phone: phone || null,
      passwordHash,
      kyidToken: nanoid(32),
      source: "portal-self-cadastro",
      consentLgpdAt: new Date(),
      lastLoginAt: new Date(),
    });
  }

  const token = await signCandidateToken({ candidateId, email: emailNorm });
  const response = NextResponse.json({ id: candidateId, name, email: emailNorm });
  response.cookies.set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
