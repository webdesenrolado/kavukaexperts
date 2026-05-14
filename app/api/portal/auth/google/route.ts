/**
 * POST /api/portal/auth/google
 *
 * Recebe o credential (JWT) emitido pelo Google Identity Services no client.
 * Valida assinatura + audience, extrai email/name/picture.
 * Cria candidato se não existe (ou loga se existe), seta cookie do portal.
 *
 * Requer GOOGLE_CLIENT_ID no env. Sem ele, retorna 503.
 */

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signCandidateToken } from "@/lib/portal/jwt";
import { PORTAL_COOKIE, cookieSecure } from "@/lib/portal/session";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export async function POST(request: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "Login com Google não configurado neste ambiente." },
      { status: 503 }
    );
  }

  const { credential } = await request.json().catch(() => ({}));
  if (!credential || typeof credential !== "string") {
    return NextResponse.json({ error: "Credential ausente." }, { status: 400 });
  }

  // Valida o ID Token do Google: assinatura + audience + expiry
  const client = new OAuth2Client(CLIENT_ID);
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (e) {
    return NextResponse.json(
      { error: "Token Google inválido." },
      { status: 401 }
    );
  }

  if (!payload || !payload.email || !payload.email_verified) {
    return NextResponse.json(
      { error: "Email Google não verificado." },
      { status: 400 }
    );
  }

  const email = payload.email.toLowerCase().trim();
  const name = payload.name || payload.given_name || email.split("@")[0];
  const avatarUrl = payload.picture || null;

  // Procura candidato pelo email
  const existing = await db.query.candidates.findFirst({
    where: eq(candidates.email, email),
  });

  let candidateId: string;
  if (existing) {
    candidateId = existing.id;
    const updates: Record<string, unknown> = { lastLoginAt: new Date() };
    if (!existing.avatarUrl && avatarUrl) updates.avatarUrl = avatarUrl;
    if (!existing.emailVerified) updates.emailVerified = true;
    await db.update(candidates).set(updates).where(eq(candidates.id, candidateId));
  } else {
    candidateId = nanoid();
    await db.insert(candidates).values({
      id: candidateId,
      name,
      email,
      avatarUrl,
      emailVerified: true,
      kyidToken: nanoid(32),
      source: "portal-google-oauth",
      consentLgpdAt: new Date(),
      lastLoginAt: new Date(),
    });
  }

  const token = await signCandidateToken({ candidateId, email });
  const response = NextResponse.json({
    id: candidateId,
    name,
    email,
    created: !existing,
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
