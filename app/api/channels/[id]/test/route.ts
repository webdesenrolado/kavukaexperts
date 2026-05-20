import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getDriver, startDriverForChannel } from "@/lib/channels/registry";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session?.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await db.query.channels.findFirst({
    where: and(eq(channels.id, id), eq(channels.companyId, session.companyId)),
  });
  if (!row) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });

  let driver = getDriver(id);
  if (!driver) driver = await startDriverForChannel(id);
  const r = await driver.test();
  return NextResponse.json(r);
}
