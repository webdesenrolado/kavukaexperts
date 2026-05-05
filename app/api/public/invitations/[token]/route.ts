/**
 * GET /api/public/invitations/[token]
 * Endpoint público — retorna metadados do convite para o candidato decidir
 * se aceita prosseguir. NÃO requer autenticação.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { invitations, candidates } from "@/db/schema";
import { eq } from "drizzle-orm";

const STATUS_FINAL = ["completed", "revoked", "expired"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const inv = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  });
  if (!inv) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  let computedStatus = inv.status;
  if (!STATUS_FINAL.includes(inv.status) && inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
    computedStatus = "expired";
  }

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, inv.candidateId),
  });

  return NextResponse.json({
    candidateName: candidate?.name ?? "",
    candidateFirstName: candidate?.name?.split(" ")[0] ?? "",
    instrument: inv.instrument,
    status: computedStatus,
    assessmentId: inv.assessmentId,
    expiresAt: inv.expiresAt,
  });
}
