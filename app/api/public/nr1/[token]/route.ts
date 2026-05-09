import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import {
  nr1Invitations,
  nr1Responses,
  nr1Campaigns,
  employees,
  companies,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import {
  QUESTIONS,
  type Likert,
  dimensionScore,
  overallScore,
  riskBand,
  flags,
} from "@/lib/nr1/questions";

/**
 * GET /api/public/nr1/[token]
 * Retorna dados da campanha pra renderizar o form.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const inv = await db.query.nr1Invitations.findFirst({
    where: eq(nr1Invitations.token, token),
  });
  if (!inv) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (inv.completedAt) {
    return NextResponse.json({ error: "ALREADY_COMPLETED" }, { status: 410 });
  }

  const campaign = await db.query.nr1Campaigns.findFirst({
    where: eq(nr1Campaigns.id, inv.campaignId),
  });
  if (!campaign || campaign.status !== "active") {
    return NextResponse.json({ error: "CAMPAIGN_INACTIVE" }, { status: 410 });
  }

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, campaign.companyId),
    columns: { id: true, name: true, logoUrl: true },
  });

  // Marca opened_at se não tinha
  if (!inv.openedAt) {
    await db
      .update(nr1Invitations)
      .set({ openedAt: new Date() })
      .where(eq(nr1Invitations.id, inv.id));
  }

  return NextResponse.json({
    company,
    campaign: {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      isAnonymous: campaign.isAnonymous,
    },
    questions: QUESTIONS,
  });
}

/**
 * POST /api/public/nr1/[token]
 * Recebe respostas, calcula scores, salva, marca completed.
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const inv = await db.query.nr1Invitations.findFirst({
    where: eq(nr1Invitations.token, token),
  });
  if (!inv) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (inv.completedAt) {
    return NextResponse.json({ error: "ALREADY_COMPLETED" }, { status: 410 });
  }

  const campaign = await db.query.nr1Campaigns.findFirst({
    where: eq(nr1Campaigns.id, inv.campaignId),
  });
  if (!campaign || campaign.status !== "active") {
    return NextResponse.json({ error: "CAMPAIGN_INACTIVE" }, { status: 410 });
  }

  const body = await request.json();
  const answers: Record<string, Likert> = {};
  for (const q of QUESTIONS) {
    const v = body.answers?.[q.id];
    if (typeof v === "number" && v >= 1 && v <= 5) {
      answers[q.id] = v as Likert;
    }
  }
  if (Object.keys(answers).length < QUESTIONS.length) {
    return NextResponse.json(
      { error: "Responda todas as perguntas" },
      { status: 400 }
    );
  }

  const sDem = dimensionScore(answers, "demandas");
  const sAut = dimensionScore(answers, "autonomia");
  const sLid = dimensionScore(answers, "lideranca");
  const sRis = dimensionScore(answers, "risco");
  const sBem = dimensionScore(answers, "bemestar");
  const sOver = overallScore(answers);
  const flagList = flags(answers);

  const employee = inv.employeeId
    ? await db.query.employees.findFirst({
        where: eq(employees.id, inv.employeeId),
        columns: { role: true, department: true },
      })
    : null;

  const respId = nanoid();
  await db.insert(nr1Responses).values({
    id: respId,
    campaignId: campaign.id,
    companyId: campaign.companyId,
    invitationId: inv.id,
    // Em campanhas anônimas, NÃO salvamos employeeId (preserva anonimato)
    employeeId: campaign.isAnonymous ? null : inv.employeeId,
    department: body.department || employee?.department || null,
    role: body.role || employee?.role || null,
    ageBand: body.ageBand || null,
    tenureBand: body.tenureBand || null,
    q1: answers.q1, q2: answers.q2, q3: answers.q3, q4: answers.q4, q5: answers.q5,
    q6: answers.q6, q7: answers.q7, q8: answers.q8, q9: answers.q9, q10: answers.q10,
    q11: answers.q11, q12: answers.q12, q13: answers.q13,
    comment: body.comment || null,
    scoreDemandas: sDem !== null ? Math.round(sDem * 100) : null,
    scoreAutonomia: sAut !== null ? Math.round(sAut * 100) : null,
    scoreLideranca: sLid !== null ? Math.round(sLid * 100) : null,
    scoreRisco: sRis !== null ? Math.round(sRis * 100) : null,
    scoreBemestar: sBem !== null ? Math.round(sBem * 100) : null,
    scoreOverall: sOver !== null ? Math.round(sOver * 100) : null,
    riskBand: riskBand(sOver),
    flags: flagList.join(",") || null,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    userAgent: request.headers.get("user-agent") || null,
  });

  await db
    .update(nr1Invitations)
    .set({ completedAt: new Date() })
    .where(eq(nr1Invitations.id, inv.id));

  await db
    .update(nr1Campaigns)
    .set({ responseCount: sql`${nr1Campaigns.responseCount} + 1` })
    .where(eq(nr1Campaigns.id, campaign.id));

  return NextResponse.json({ ok: true });
}
