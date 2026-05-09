import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { nr1Campaigns, nr1Invitations, employees } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { appBaseUrl } from "@/lib/email/transport";

/**
 * POST /api/empresas-clientes/[id]/nr1/campaigns/[campaignId]/generate-tokens
 *
 * Cria 1 invitation por employee ativo da empresa que ainda não tem invitation
 * nessa campanha. Retorna lista atualizada de invitations com URLs.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; campaignId: string }> }
) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, campaignId } = await ctx.params;

  const campaign = await db.query.nr1Campaigns.findFirst({
    where: and(eq(nr1Campaigns.id, campaignId), eq(nr1Campaigns.companyId, id)),
  });
  if (!campaign) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const allEmployees = await db
    .select({ id: employees.id, name: employees.name, email: employees.email, phone: employees.phone })
    .from(employees)
    .where(and(eq(employees.companyId, id), eq(employees.active, true)));

  const existing = await db
    .select({ employeeId: nr1Invitations.employeeId })
    .from(nr1Invitations)
    .where(eq(nr1Invitations.campaignId, campaignId));
  const alreadyInvited = new Set(existing.map((e) => e.employeeId).filter(Boolean));

  const toCreate = allEmployees.filter((e) => !alreadyInvited.has(e.id));

  if (toCreate.length > 0) {
    await db.insert(nr1Invitations).values(
      toCreate.map((e) => ({
        id: nanoid(),
        campaignId,
        employeeId: e.id,
        token: nanoid(32),
        email: e.email,
        phone: e.phone,
        channel: e.email && e.phone ? "both" : e.email ? "email" : e.phone ? "whatsapp" : null,
      }))
    );
    await db
      .update(nr1Campaigns)
      .set({ targetCount: allEmployees.length })
      .where(eq(nr1Campaigns.id, campaignId));
  }

  return NextResponse.json({
    created: toCreate.length,
    totalEmployees: allEmployees.length,
    alreadyInvited: alreadyInvited.size,
    baseUrl: appBaseUrl(),
  });
}
