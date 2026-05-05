/**
 * POST /api/public/invitations/[token]/start
 * Marca o início da avaliação. A partir daqui o cronômetro do tempo limite começa.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const inv = await db.query.invitations.findFirst({ where: eq(invitations.token, token) });
  if (!inv) return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });

  if (inv.status === "completed") {
    return NextResponse.json({ error: "Avaliação já concluída" }, { status: 409 });
  }
  if (inv.status === "revoked") {
    return NextResponse.json({ error: "Convite revogado" }, { status: 410 });
  }
  if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
  }

  // Idempotente: se já iniciou, retorna o startedAt original (mantém o cronômetro estável)
  let startedAt = inv.startedAt;
  if (!startedAt) {
    startedAt = new Date();
    await db
      .update(invitations)
      .set({ status: "in_progress", startedAt })
      .where(eq(invitations.id, inv.id));
  }

  return NextResponse.json({
    startedAt: startedAt.toISOString(),
    serverNow: new Date().toISOString(),
    timeLimitMinutes: inv.timeLimitMinutes ?? 30,
  });
}
