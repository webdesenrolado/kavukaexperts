/**
 * POST /api/messages/send — composer outbound do Inbox.
 * Recebe { conversationId, bodyText, subject? }, descobre o canal e dispara via driver.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { conversations, channels } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getDriver, startDriverForChannel } from "@/lib/channels/registry";
import { persistOutbound } from "@/lib/channels/persist";

const schema = z.object({
  conversationId: z.string(),
  bodyText: z.string().min(1).max(8000),
  subject: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.companyId || !session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", issues: parsed.error.issues }, { status: 400 });
  }

  const conv = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, parsed.data.conversationId),
      eq(conversations.companyId, session.companyId),
    ),
  });
  if (!conv) return NextResponse.json({ error: "Conversa nao encontrada" }, { status: 404 });
  if (!conv.contactHandle) {
    return NextResponse.json({ error: "Conversa sem handle do contato" }, { status: 400 });
  }

  const channel = await db.query.channels.findFirst({ where: eq(channels.id, conv.channelId) });
  if (!channel) return NextResponse.json({ error: "Canal nao encontrado" }, { status: 404 });

  let driver = getDriver(channel.id);
  if (!driver) driver = await startDriverForChannel(channel.id);

  try {
    const result = await driver.send({
      to: conv.contactHandle,
      bodyText: parsed.data.bodyText,
      subject: parsed.data.subject,
    });
    const persisted = await persistOutbound(
      channel.id,
      conv.id,
      parsed.data.bodyText,
      session.userId,
      result.externalId,
    );
    return NextResponse.json({ ok: true, messageId: persisted.messageId, externalId: result.externalId });
  } catch (err: unknown) {
    console.error("[messages/send] erro:", err);
    return NextResponse.json(
      { error: `Falha ao enviar: ${(err as Error).message}` },
      { status: 502 },
    );
  }
}
