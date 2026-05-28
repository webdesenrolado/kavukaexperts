import { NextRequest, NextResponse } from "next/server";

/**
 * Origens públicas autorizadas a consumir as APIs `/api/public/*`.
 * kavukavagas.com.br é o front externo; kavuka.ai é o gestor/candidato hospedado no próprio app.
 */
const ALLOWED_ORIGINS = new Set([
  "https://kavukavagas.com.br",
  "https://www.kavukavagas.com.br",
  "http://localhost:3000",
  "http://localhost:3366",
]);

const ALLOW_HEADERS = "Content-Type, Authorization";
const ALLOW_METHODS = "GET, POST, OPTIONS";

function pickOrigin(req: NextRequest): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  return null;
}

export function applyCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = pickOrigin(req);
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
    res.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  }
  return res;
}

export function corsPreflight(req: NextRequest): NextResponse {
  return applyCors(req, new NextResponse(null, { status: 204 }));
}
