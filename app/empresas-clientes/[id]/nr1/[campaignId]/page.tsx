import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { companies, nr1Campaigns } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { CampaignDashboardClient } from "./campaign-dashboard-client";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string; campaignId: string }>;
}) {
  const { id, campaignId } = await params;
  const company = await db.query.companies.findFirst({
    where: and(eq(companies.id, id), eq(companies.kind, "client")),
  });
  if (!company) notFound();
  const campaign = await db.query.nr1Campaigns.findFirst({
    where: and(eq(nr1Campaigns.id, campaignId), eq(nr1Campaigns.companyId, id)),
  });
  if (!campaign) notFound();

  return (
    <AppShell>
      <div className="p-8 max-w-7xl">
        <Link
          href={`/empresas-clientes/${id}/nr1`}
          className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={14} /> Voltar
        </Link>
        <div className="flex items-center gap-2 text-[#10b981] mb-1">
          <Activity size={14} />
          <span className="text-xs uppercase tracking-wider opacity-70">Dashboard NR-1</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{campaign.name}</h1>
        <p className="text-sm opacity-70 mb-6">
          {company.name}
          {campaign.description && ` · ${campaign.description}`}
        </p>
        <CampaignDashboardClient companyId={id} campaignId={campaignId} />
      </div>
    </AppShell>
  );
}
