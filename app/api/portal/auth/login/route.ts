import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { signCandidateToken } from "@/lib/portal/jwt";
import { PORTAL_COOKIE, cookieSecure } from "@/lib/portal/session";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
  }

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.email, email.toLowerCase().trim()),
  });

  if (!candidate || !candidate.passwordHash) {
    return NextResponse.json(
      { error: "Credenciais inválidas ou conta não ativada" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, candidate.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  await db
    .update(candidates)
    .set({ lastLoginAt: new Date() })
    .where(eq(candidates.id, candidate.id));

  const token = await signCandidateToken({
    candidateId: candidate.id,
    email: candidate.email,
  });

  const response = NextResponse.json({
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
  });

  response.cookies.set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
