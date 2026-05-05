import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { STAGES_KANBAN } from "@/lib/labels";

const STAGE_VALUES = [...STAGES_KANBAN, "rejected", "talent_pool"] as const;

const patchSchema = z.object({
  stage: z.enum(STAGE_VALUES).optional(),
  scoreFit: z.number().min(0).max(100).nullable().optional(),
  scoreHumano: z.number().min(0).max(100).nullable().optional(),
  rejectionReason: z.string().max(2000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await db.query.applications.findFirst({ where: eq(applications.id, id) });
  if (!existing) return NextResponse.json({ error: "Aplicação não encontrada" }, { status: 404 });

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (parsed.data.stage !== undefined) updates.stage = parsed.data.stage;
  if (parsed.data.scoreFit !== undefined) updates.scoreFit = parsed.data.scoreFit;
  if (parsed.data.scoreHumano !== undefined) updates.scoreHumano = parsed.data.scoreHumano;
  if (parsed.data.rejectionReason !== undefined) updates.rejectionReason = parsed.data.rejectionReason;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

  await db.update(applications).set(updates).where(eq(applications.id, id));
  return NextResponse.json({ ok: true });
}
