import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { verifyCandidateToken } from "@/lib/portal/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/aplicar",
  "/kyid",
  "/carreiras",
  "/api/public",
  "/_next",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
  "/brand",
];

const PORTAL_PUBLIC_PATHS = [
  "/portal/login",
  "/portal/cadastro",
  "/portal/recuperar",
  "/portal/redefinir",
  "/api/portal/auth",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas globais
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // === Portal do candidato (auth separada) ===
  if (pathname.startsWith("/portal") || pathname.startsWith("/api/portal")) {
    if (PORTAL_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    const ctoken = request.cookies.get("kavuka_candidate_token")?.value;
    const csession = ctoken ? await verifyCandidateToken(ctoken) : null;
    if (!csession) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/portal/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // === Recrutador (resto do app) ===
  const token = request.cookies.get("kavuka_token")?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand).*)"],
};
