import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

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
