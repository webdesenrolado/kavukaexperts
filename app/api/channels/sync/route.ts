/**
 * POST /api/channels/sync — dispara pullInbound em TODOS os drivers da empresa.
 * Usado pelo polling client-side no Inbox (chama a cada 30s).
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getDriver, startDriverForChannel } from "@/lib/channels/registry";

export async function POST() {
  const session = await getSession();
  if (!session?.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(channels)
    .where(eq(channels.companyId, session.companyId));

  const results: Array<{ channelId: string; kind: string; fetched: number; status: string }> = [];
  for (const row of rows) {
    if (!row.connected) continue;
    try {
      let driver = getDriver(row.id);
      if (!driver) driver = await startDriverForChannel(row.id);
      const r = await driver.pullInbound();
      results.push({
        channelId: row.id,
        kind: row.kind,
        fetched: r.fetched,
        status: driver.getState().status,
      });
    } catch (err) {
      console.error(`[api/channels/sync] ${row.id} falhou:`, err);
      results.push({ channelId: row.id, kind: row.kind, fetched: 0, status: "error" });
    }
  }
  return NextResponse.json({ ok: true, results });
}
