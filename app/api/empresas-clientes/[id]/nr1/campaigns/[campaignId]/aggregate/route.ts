import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  nr1Campaigns,
  nr1Responses,
  nr1Invitations,
  companies,
} from "@/db/schema";
import { and, eq, count, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { canAccessClientCompany } from "@/lib/auth/access";
import { QUESTIONS, DIMENSIONS, type NR1Dimension } from "@/lib/nr1/questions";

type DimKey = NR1Dimension;
const DIM_KEYS: DimKey[] = ["demandas", "autonomia", "lideranca", "risco", "bemestar"];

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; campaignId: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, campaignId } = await ctx.params;
  if (!canAccessClientCompany(session, id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const campaign = await db.query.nr1Campaigns.findFirst({
    where: and(eq(nr1Campaigns.id, campaignId), eq(nr1Campaigns.companyId, id)),
  });
  if (!campaign) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, id),
    columns: { id: true, name: true },
  });

  // Counts
  const [{ totalInv }] = await db
    .select({ totalInv: count(nr1Invitations.id) })
    .from(nr1Invitations)
    .where(eq(nr1Invitations.campaignId, campaignId));
  const [{ openedInv }] = await db
    .select({ openedInv: count(nr1Invitations.id) })
    .from(nr1Invitations)
    .where(and(eq(nr1Invitations.campaignId, campaignId), sql`opened_at IS NOT NULL`));
  const [{ completedInv }] = await db
    .select({ completedInv: count(nr1Invitations.id) })
    .from(nr1Invitations)
    .where(and(eq(nr1Invitations.campaignId, campaignId), sql`completed_at IS NOT NULL`));

  const responses = await db
    .select()
    .from(nr1Responses)
    .where(eq(nr1Responses.campaignId, campaignId));

  // Médias por dimensão (geral)
  const dimAverages: Record<DimKey, number | null> = {
    demandas: avg(responses.map((r) => r.scoreDemandas)),
    autonomia: avg(responses.map((r) => r.scoreAutonomia)),
    lideranca: avg(responses.map((r) => r.scoreLideranca)),
    risco: avg(responses.map((r) => r.scoreRisco)),
    bemestar: avg(responses.map((r) => r.scoreBemestar)),
  };
  const overallAvg = avg(responses.map((r) => r.scoreOverall));

  // Distribuição de banda de risco
  const bandDist = {
    high: responses.filter((r) => r.riskBand === "high").length,
    medium: responses.filter((r) => r.riskBand === "medium").length,
    low: responses.filter((r) => r.riskBand === "low").length,
  };

  // Distribuição Likert por pergunta
  const perQuestion = QUESTIONS.map((q) => {
    const dist = [0, 0, 0, 0, 0]; // 1..5
    for (const r of responses) {
      const v = (r as any)[q.id];
      if (typeof v === "number" && v >= 1 && v <= 5) dist[v - 1]++;
    }
    return { id: q.id, text: q.text, dimension: q.dimension, dist };
  });

  // Por departamento (agregado)
  const deptMap = new Map<string, { count: number; scores: Record<DimKey, number[]>; flags: number }>();
  for (const r of responses) {
    const d = r.department || "Não informado";
    if (!deptMap.has(d)) {
      deptMap.set(d, {
        count: 0,
        scores: { demandas: [], autonomia: [], lideranca: [], risco: [], bemestar: [] },
        flags: 0,
      });
    }
    const e = deptMap.get(d)!;
    e.count++;
    if (r.scoreDemandas != null) e.scores.demandas.push(r.scoreDemandas);
    if (r.scoreAutonomia != null) e.scores.autonomia.push(r.scoreAutonomia);
    if (r.scoreLideranca != null) e.scores.lideranca.push(r.scoreLideranca);
    if (r.scoreRisco != null) e.scores.risco.push(r.scoreRisco);
    if (r.scoreBemestar != null) e.scores.bemestar.push(r.scoreBemestar);
    if (r.flags) e.flags++;
  }
  const byDepartment = Array.from(deptMap.entries())
    .map(([dept, v]) => ({
      department: dept,
      count: v.count,
      flags: v.flags,
      scores: {
        demandas: avg(v.scores.demandas),
        autonomia: avg(v.scores.autonomia),
        lideranca: avg(v.scores.lideranca),
        risco: avg(v.scores.risco),
        bemestar: avg(v.scores.bemestar),
      },
    }))
    .sort((a, b) => b.count - a.count);

  // Alertas: respostas com flag (Q10 ≥ 3)
  const alerts = responses
    .filter((r) => r.flags)
    .map((r) => ({
      id: r.id,
      department: r.department,
      role: r.role,
      flags: (r.flags || "").split(",").filter(Boolean),
      submittedAt: r.submittedAt,
    }));

  // Comentários (anônimos)
  const comments = responses
    .filter((r) => r.comment && r.comment.trim().length > 5)
    .map((r) => ({
      id: r.id,
      department: r.department,
      role: r.role,
      ageBand: r.ageBand,
      comment: r.comment,
      submittedAt: r.submittedAt,
      riskBand: r.riskBand,
    }))
    .slice(0, 50);

  return NextResponse.json({
    company,
    campaign,
    counts: {
      total: Number(totalInv),
      opened: Number(openedInv),
      completed: Number(completedInv),
      completionRate: totalInv > 0 ? Math.round((Number(completedInv) / Number(totalInv)) * 100) : 0,
    },
    overall: {
      score: overallAvg,
      bandDist,
    },
    dimensions: DIM_KEYS.map((k) => ({
      key: k,
      label: DIMENSIONS[k].label,
      description: DIMENSIONS[k].description,
      score: dimAverages[k],
    })),
    perQuestion,
    byDepartment,
    alerts,
    comments,
  });
}

function avg(arr: (number | null | undefined)[]): number | null {
  const v = arr.filter((x): x is number => typeof x === "number");
  if (v.length === 0) return null;
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}
