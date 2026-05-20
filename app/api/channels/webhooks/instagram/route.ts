/**
 * Webhook Instagram (Meta Graph).
 *
 * GET — verificacao da subscription. Meta envia hub.verify_token; respondemos hub.challenge se bater.
 * POST — payload de mensagens. Meta envia entry[].messaging[] com remetente, texto, timestamp.
 *
 * Multi-tenant: descobre o canal pelo IG user ID que vem no payload (= channels.identifier).
 * Pra GET, encontra qualquer canal cujo verifyToken bater (assumindo unicidade).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptJson } from "@/lib/crypto";
import type { InstagramConfig } from "@/lib/channels/instagram-driver";
import { persistInbound } from "@/lib/channels/persist";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode !== "subscribe" || !token) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Procura canal instagram com esse verify_token
  const rows = await db.select().from(channels).where(eq(channels.kind, "instagram"));
  for (const row of rows) {
    if (!row.config) continue;
    try {
      const cfg = decryptJson<InstagramConfig>(row.config);
      if (cfg.verifyToken === token) {
        return new NextResponse(challenge ?? "", { status: 200 });
      }
    } catch {
      // canal sem config decifravel — pula
    }
  }
  return NextResponse.json({ error: "verify_token invalido" }, { status: 403 });
}

interface MetaWebhookPayload {
  object?: string;
  entry?: Array<{
    id: string;
    time: number;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        is_echo?: boolean;
      };
    }>;
  }>;
}

export async function POST(req: NextRequest) {
  let payload: MetaWebhookPayload;
  try {
    payload = (await req.json()) as MetaWebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  if (payload.object !== "instagram" || !payload.entry) {
    // Aceita silenciosamente — Meta usa pra "ping" alguns endpoints
    return NextResponse.json({ ok: true });
  }

  for (const entry of payload.entry) {
    // entry.id = ID da conta IG. Lookup do canal por identifier.
    const row = await db.query.channels.findFirst({
      where: eq(channels.identifier, entry.id),
    });
    if (!row || row.kind !== "instagram") continue;

    for (const m of entry.messaging ?? []) {
      if (!m.message || m.message.is_echo) continue;
      const text = m.message.text;
      if (!text) continue;

      try {
        await persistInbound(row.companyId, row.id, {
          externalId: m.message.mid,
          contactHandle: m.sender.id, // ID PSID — usaremos pra reply via Graph
          contactName: m.sender.id, // Graph nao da nome no payload; UI mostra ID ate vc resolver via /users/{id}
          bodyText: text,
          sentAt: new Date(m.timestamp),
        });
      } catch (err) {
        console.error("[ig/webhook] persist falhou:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
