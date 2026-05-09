import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { signCandidateToken } from "@/lib/portal/jwt";
import { PORTAL_COOKIE, cookieSecure } from "@/lib/portal/session";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha precisa ter ao menos 6 caracteres" },
      { status: 400 }
    );
  }

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.resetToken, token),
  });
  if (!candidate || !candidate.resetTokenExpiresAt) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }
  if (candidate.resetTokenExpiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expirado. Solicite um novo." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await db
    .update(candidates)
    .set({
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
      lastLoginAt: new Date(),
    })
    .where(eq(candidates.id, candidate.id));

  // Auto-login
  const sessionToken = await signCandidateToken({
    candidateId: candidate.id,
    email: candidate.email,
  });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PORTAL_COOKIE, sessionToken, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
