import { notFound } from "next/navigation";
import { db } from "@/db";
import { nr1Invitations, nr1Campaigns, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { QUESTIONS } from "@/lib/nr1/questions";
import { FormClient } from "./form-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Avaliação NR-1" };

export default async function NR1FormPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const inv = await db.query.nr1Invitations.findFirst({
    where: eq(nr1Invitations.token, token),
  });
  if (!inv) notFound();

  if (inv.completedAt) {
    return (
      <ExpiredOrDone
        title="Você já respondeu"
        message="Esta pesquisa já foi concluída por este link. Obrigado pela participação."
      />
    );
  }

  const campaign = await db.query.nr1Campaigns.findFirst({
    where: eq(nr1Campaigns.id, inv.campaignId),
  });
  if (!campaign) notFound();
  if (campaign.status !== "active") {
    return (
      <ExpiredOrDone
        title="Pesquisa encerrada"
        message="Esta pesquisa não está mais aceitando respostas. Procure o RH da sua empresa pra mais informações."
      />
    );
  }

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, campaign.companyId),
    columns: { name: true },
  });

  return (
    <FormClient
      token={token}
      campaign={{
        name: campaign.name,
        description: campaign.description ?? null,
        isAnonymous: !!campaign.isAnonymous,
      }}
      companyName={company?.name ?? "Empresa"}
      questions={QUESTIONS}
    />
  );
}

function ExpiredOrDone({ title, message }: { title: string; message: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div
        className="max-w-md w-full border rounded-2xl p-8 text-center"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-sm opacity-70">{message}</p>
      </div>
    </div>
  );
}
