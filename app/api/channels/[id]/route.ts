import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { channels, conversations, messages } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { encryptJson } from "@/lib/crypto";
import {
  getDriver,
  startDriverForChannel,
  stopDriverForChannel,
} from "@/lib/channels/registry";

async function ownedChannel(id: string, companyId: string) {
  return db.query.channels.findFirst({
    where: and(eq(channels.id, id), eq(channels.companyId, companyId)),
  });
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session?.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await ownedChannel(id, session.companyId);
  if (!row) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });

  const driver = getDriver(row.id);
  return NextResponse.json({
    id: row.id,
    kind: row.kind,
    displayName: row.displayName,
    identifier: row.identifier,
    connected: row.connected,
    state: driver?.getState() ?? { status: "disconnected" },
  });
}

const patchSchema = z.object({
  displayName: z.string().optional(),
  identifier: z.string().optional(),
  connected: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session?.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await ownedChannel(id, session.companyId);
  if (!row) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", issues: parsed.error.issues }, { status: 400 });
  }

  const updates: Partial<typeof channels.$inferInsert> = {};
  if (parsed.data.displayName !== undefined) updates.displayName = parsed.data.displayName;
  if (parsed.data.identifier !== undefined) updates.identifier = parsed.data.identifier;
  if (parsed.data.connected !== undefined) updates.connected = parsed.data.connected;
  if (parsed.data.config) updates.config = encryptJson(parsed.data.config);

  await db.update(channels).set(updates).where(eq(channels.id, id));

  // Restart do driver se config ou connected mudaram
  if (parsed.data.config !== undefined || parsed.data.connected !== undefined) {
    await stopDriverForChannel(id);
    if (parsed.data.connected !== false) {
      startDriverForChannel(id).catch((err) =>
        console.error("[api/channels/PATCH] restart falhou:", err),
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session?.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await ownedChannel(id, session.companyId);
  if (!row) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });

  await stopDriverForChannel(id);

  // Cascade: messages -> conversations -> channel
  const convs = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.channelId, id));
  const convIds = convs.map((c) => c.id);
  if (convIds.length > 0) {
    await db.delete(messages).where(inArray(messages.conversationId, convIds));
    await db.delete(conversations).where(inArray(conversations.id, convIds));
  }
  await db.delete(channels).where(eq(channels.id, id));
  return NextResponse.json({ ok: true });
}
