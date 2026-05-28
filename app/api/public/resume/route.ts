/**
 * POST /api/public/resume
 *
 * Upload de currículo PDF vinculado a uma candidatura pública.
 * Autenticação: Authorization: Bearer <ssoToken> (emitido por POST /api/public/applications).
 * Aceita multipart/form-data com campo `file` (PDF, máx 5MB).
 * Atualiza candidates.resumeUrl e resumeFilename.
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { verifySsoToken } from "@/lib/portal/sso";
import { applyCors, corsPreflight } from "@/lib/cors";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "resumes");
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set(["application/pdf"]);

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return applyCors(
      request,
      NextResponse.json({ error: "Token de upload ausente." }, { status: 401 }),
    );
  }

  const payload = await verifySsoToken(token);
  if (!payload) {
    return applyCors(
      request,
      NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 401 },
      ),
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return applyCors(
      request,
      NextResponse.json({ error: "Arquivo ausente." }, { status: 400 }),
    );
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return applyCors(
      request,
      NextResponse.json(
        { error: "Formato não permitido. Envie um PDF." },
        { status: 415 },
      ),
    );
  }

  if (file.size > MAX_BYTES) {
    return applyCors(
      request,
      NextResponse.json(
        { error: "Arquivo maior que 5MB." },
        { status: 413 },
      ),
    );
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = file.name.toLowerCase().endsWith(".pdf") ? ".pdf" : ".pdf";
  const storedName = `${payload.candidateId}-${nanoid(10)}${ext}`;
  const fullPath = path.join(UPLOAD_DIR, storedName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buf);

  const url = `/api/public/resume/${storedName}`;
  await db
    .update(candidates)
    .set({ resumeUrl: url, resumeFilename: file.name })
    .where(eq(candidates.id, payload.candidateId));

  return applyCors(
    request,
    NextResponse.json({ ok: true, url, filename: file.name }),
  );
}
