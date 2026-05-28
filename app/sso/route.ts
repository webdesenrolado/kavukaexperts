/**
 * GET /sso?token=<ssoToken>&redirect=<path>
 *
 * Handoff entre kavukavagas.com.br e candidato.kavuka.ai.
 * Valida o ssoToken de uso único (emitido por POST /api/public/applications),
 * emite o JWT de sessão do candidato, seta o cookie kavuka_candidate_token
 * (com Domain=.kavuka.ai em produção pra compartilhar entre gestor/candidato)
 * e redireciona pro `redirect` (default: /portal/me).
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySsoToken } from "@/lib/portal/sso";
import { signCandidateToken } from "@/lib/portal/jwt";
import { PORTAL_COOKIE, cookieSecure } from "@/lib/portal/session";

const DEFAULT_REDIRECT = "/portal/me";
const ALLOWED_REDIRECT_PREFIXES = ["/portal"];

function safeRedirect(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT;
  if (!raw.startsWith("/")) return DEFAULT_REDIRECT;
  if (raw.startsWith("//")) return DEFAULT_REDIRECT;
  if (!ALLOWED_REDIRECT_PREFIXES.some((p) => raw === p || raw.startsWith(p + "/") || raw.startsWith(p + "?"))) {
    return DEFAULT_REDIRECT;
  }
  return raw;
}

function cookieDomain(): string | undefined {
  return process.env.PORTAL_COOKIE_DOMAIN || undefined;
}

/**
 * Atrás de reverse proxy (Nginx), `request.nextUrl` pode trazer host interno
 * (ex: localhost:3355). Preferimos APP_BASE_URL do env e, em fallback,
 * reconstruímos a partir de X-Forwarded-Proto/Host.
 */
function publicBaseUrl(request: NextRequest): URL {
  if (process.env.APP_BASE_URL) return new URL(process.env.APP_BASE_URL);
  const proto =
    request.headers.get("x-forwarded-proto") ||
    request.nextUrl.protocol.replace(":", "") ||
    "https";
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host;
  return new URL(`${proto}://${host}`);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const base = publicBaseUrl(request);
  const token = url.searchParams.get("token");
  const redirect = safeRedirect(url.searchParams.get("redirect"));

  if (!token) {
    return NextResponse.redirect(new URL("/portal/login?error=missing_token", base));
  }

  const payload = await verifySsoToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/portal/login?error=invalid_or_expired", base));
  }

  const sessionToken = await signCandidateToken({
    candidateId: payload.candidateId,
    email: payload.email,
  });

  const response = NextResponse.redirect(new URL(redirect, base));
  response.cookies.set(PORTAL_COOKIE, sessionToken, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    domain: cookieDomain(),
  });
  return response;
}
