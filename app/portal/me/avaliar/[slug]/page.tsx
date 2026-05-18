import { redirect, notFound } from "next/navigation";
import { getCandidateSession } from "@/lib/portal/session";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IPIP_NEO_120_ITEMS } from "@/services/ipip-neo-120/src/items";
import { BLOCKS as DISC_BLOCKS } from "@/services/disc-adapted/src/items";
import { ITEMS as LABEL_ITEMS } from "@/services/label-adapted/src/items";
import { ITEMS as ARQ_ITEMS } from "@/services/arquetipos/src/items";
import { IpipForm } from "@/app/candidatos/[id]/avaliar/[slug]/form";
import { DiscForm } from "@/app/candidatos/[id]/avaliar/[slug]/disc-form";
import { LabelForm } from "@/app/candidatos/[id]/avaliar/[slug]/label-form";
import { ArquetiposForm } from "@/app/candidatos/[id]/avaliar/[slug]/arquetipos-form";

export const dynamic = "force-dynamic";

export default async function PortalAvaliarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getCandidateSession();
  if (!session) redirect("/portal/login");

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, session.candidateId),
  });
  if (!candidate) redirect("/portal/login");

  const { slug } = await params;
  const endpoint = `/api/portal/me/instruments/${slug}/apply`;
  const redirectTo = `/portal/me?completed=${slug}`;

  if (slug === "ipip-neo-120") {
    const items = IPIP_NEO_120_ITEMS.map((it) => ({
      item_id: it.item_id,
      text: it.text,
    }));
    return (
      <IpipForm
        candidateId={candidate.id}
        candidateName={candidate.name}
        items={items}
        endpoint={endpoint}
        redirectTo={redirectTo}
      />
    );
  }

  if (slug === "disc-adapted") {
    return (
      <DiscForm
        candidateId={candidate.id}
        candidateName={candidate.name}
        blocks={DISC_BLOCKS}
        endpoint={endpoint}
        redirectTo={redirectTo}
      />
    );
  }

  if (slug === "label-adapted") {
    return (
      <LabelForm
        candidateId={candidate.id}
        candidateName={candidate.name}
        items={LABEL_ITEMS}
        endpoint={endpoint}
        redirectTo={redirectTo}
      />
    );
  }

  if (slug === "arquetipos") {
    return (
      <ArquetiposForm
        candidateId={candidate.id}
        candidateName={candidate.name}
        items={ARQ_ITEMS}
        endpoint={endpoint}
        redirectTo={redirectTo}
      />
    );
  }

  notFound();
}
