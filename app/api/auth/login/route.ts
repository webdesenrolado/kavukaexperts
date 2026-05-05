import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !user.active) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const token = await signToken({
    userId: user.id,
    role: user.role,
    companyId: user.companyId,
  });

  const response = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
