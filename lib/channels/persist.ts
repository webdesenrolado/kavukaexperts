/**
 * Persistencia de mensagens inbound — usada por todos os drivers.
 *
 * Faz upsert de conversation por (channelId, contactHandle) e insere message com dedupe
 * em (conversationId, externalId).
 */

import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { InboundMessage } from "./types";

export async function persistInbound(
  companyId: string,
  channelId: string,
  msg: InboundMessage,
): Promise<{ conversationId: string; messageId: string; isNew: boolean }> {
  const handle = msg.contactHandle.toLowerCase().trim();

  // Acha conversa por handle no canal (case-insensitive)
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.channelId, channelId),
        sql`lower(${conversations.contactHandle}) = ${handle}`,
      ),
    )
    .limit(1);

  let conversationId: string;
  if (existing.length > 0) {
    conversationId = existing[0].id;
    await db
      .update(conversations)
      .set({
        contactName: msg.contactName ?? existing[0].contactName,
        contactAvatarUrl: msg.contactAvatarUrl ?? existing[0].contactAvatarUrl,
        lastMessageAt: msg.sentAt,
        lastMessagePreview: msg.bodyText.slice(0, 200),
        unreadCount: (existing[0].unreadCount ?? 0) + 1,
        status: existing[0].status === "spam" ? "spam" : "open",
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));
  } else {
    conversationId = `cv-${nanoid(12)}`;
    await db.insert(conversations).values({
      id: conversationId,
      companyId,
      channelId,
      contactName: msg.contactName ?? handle,
      contactHandle: handle,
      contactAvatarUrl: msg.contactAvatarUrl,
      status: "open",
      unreadCount: 1,
      lastMessageAt: msg.sentAt,
      lastMessagePreview: msg.bodyText.slice(0, 200),
    });
  }

  // Dedupe por externalId
  if (msg.externalId) {
    const dup = await db
      .select({ id: messages.id })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.attachmentsJson} = ${JSON.stringify({ externalId: msg.externalId })}`,
        ),
      )
      .limit(1);
    if (dup.length > 0) {
      return { conversationId, messageId: dup[0].id, isNew: false };
    }
  }

  const messageId = `msg-${nanoid(12)}`;
  await db.insert(messages).values({
    id: messageId,
    conversationId,
    direction: "inbound",
    bodyText: msg.bodyText,
    attachmentsJson: msg.externalId ? JSON.stringify({ externalId: msg.externalId }) : null,
    sentAt: msg.sentAt,
  });

  return { conversationId, messageId, isNew: true };
}

export async function persistOutbound(
  channelId: string,
  conversationId: string,
  bodyText: string,
  sentByUserId: string,
  externalId?: string,
): Promise<{ messageId: string }> {
  const messageId = `msg-${nanoid(12)}`;
  const now = new Date();
  await db.insert(messages).values({
    id: messageId,
    conversationId,
    direction: "outbound",
    bodyText,
    sentByUserId,
    sentAt: now,
    attachmentsJson: externalId ? JSON.stringify({ externalId }) : null,
  });
  await db
    .update(conversations)
    .set({
      lastMessageAt: now,
      lastMessagePreview: bodyText.slice(0, 200),
      updatedAt: now,
    })
    .where(eq(conversations.id, conversationId));
  return { messageId };
}
