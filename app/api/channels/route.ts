import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { encryptJson } from "@/lib/crypto";
import { getDriver, startDriverForChannel } from "@/lib/channels/registry";

export async function GET() {
  const session = await getSession();
  if (!session?.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(channels).where(eq(channels.companyId, session.companyId));
  return NextResponse.json(
    rows.map((r) => {
      const driver = getDriver(r.id);
      return {
        id: r.id,
        kind: r.kind,
        displayName: r.displayName,
        identifier: r.identifier,
        connected: r.connected,
        state: driver?.getState() ?? { status: "disconnected" },
      };
    }),
  );
}

const createSchema = z.object({
  kind: z.enum(["email", "whatsapp", "instagram"]),
  displayName: z.string().min(1),
  identifier: z.string().nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", issues: parsed.error.issues }, { status: 400 });
  }

  const id = `ch-${parsed.data.kind}-${nanoid(8)}`;
  await db.insert(channels).values({
    id,
    companyId: session.companyId,
    kind: parsed.data.kind,
    displayName: parsed.data.displayName,
    identifier: parsed.data.identifier ?? null,
    // ^ nullable + optional -> nulo no DB se nao passou (WhatsApp Baileys preenche apos QR)
    config: parsed.data.config ? encryptJson(parsed.data.config) : null,
    connected: true,
  });

  // Inicia o driver imediatamente (assincrono — UI faz polling p/ ver QR/status)
  startDriverForChannel(id).catch((err) => console.error("[api/channels] start falhou:", err));

  return NextResponse.json({ id });
}
