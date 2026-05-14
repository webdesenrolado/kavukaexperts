/**
 * POST /api/portal/me/avatar
 * DELETE /api/portal/me/avatar
 *
 * Recebe avatar como data URI base64 (já redimensionado no client pra 400x400 jpeg).
 * Salva direto em candidates.avatarUrl. Limite: 200kb na imagem final.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authedSession } from "@/lib/portal/crud-helpers";

const MAX_SIZE = 250 * 1024; // 250kb base64

export async function POST(request: NextRequest) {
  const session = await authedSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { avatar } = await request.json().catch(() => ({}));
  if (typeof avatar !== "string" || !avatar.startsWith("data:image/")) {
    return NextResponse.json({ error: "Avatar inválido" }, { status: 400 });
  }
  if (avatar.length > MAX_SIZE) {
    return NextResponse.json(
      { error: "Imagem muito grande. Tente uma menor (até ~200kb)." },
      { status: 413 }
    );
  }
  // Aceita só jpeg/png/webp
  const mime = avatar.slice(5, avatar.indexOf(";"));
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
    return NextResponse.json({ error: "Formato não suportado" }, { status: 400 });
  }

  await db
    .update(candidates)
    .set({ avatarUrl: avatar, updatedAt: new Date() })
    .where(eq(candidates.id, session.candidateId));

  return NextResponse.json({ ok: true, avatarUrl: avatar });
}

export async function DELETE() {
  const session = await authedSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  await db
    .update(candidates)
    .set({ avatarUrl: null, updatedAt: new Date() })
    .where(eq(candidates.id, session.candidateId));
  return NextResponse.json({ ok: true });
}
