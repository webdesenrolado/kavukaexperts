/**
 * GET /api/public/resume/[filename]
 *
 * Serve um currículo PDF previamente upado via POST /api/public/resume.
 * Acesso público pelo path — assumindo nome com nanoid (32^10 entropia) como obscurity.
 * Em prod, considerar trocar por URL assinada com TTL.
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "resumes");

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;

  // Sanitização: bloqueia path traversal e qualquer caractere fora do esperado
  if (!/^[a-zA-Z0-9_-]+\.pdf$/.test(filename)) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }

  const full = path.join(UPLOAD_DIR, filename);
  try {
    const buf = await fs.readFile(full);
    return new NextResponse(buf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }
}
