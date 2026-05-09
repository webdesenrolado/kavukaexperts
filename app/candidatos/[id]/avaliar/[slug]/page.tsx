import { notFound } from "next/navigation";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IPIP_NEO_120_ITEMS } from "@/services/ipip-neo-120/src/items";
import { BLOCKS as DISC_BLOCKS } from "@/services/disc-adapted/src/items";
import { ITEMS as LABEL_ITEMS } from "@/services/label-adapted/src/items";
import { IpipForm } from "./form";
import { DiscForm } from "./disc-form";
import { LabelForm } from "./label-form";

export default async function AvaliarPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;

  const candidate = await db.query.candidates.findFirst({ where: eq(candidates.id, id) });
  if (!candidate) notFound();

  if (slug === "ipip-neo-120") {
    const items = IPIP_NEO_120_ITEMS.map((it) => ({
      item_id: it.item_id,
      text: it.text,
    }));
    return <IpipForm candidateId={id} candidateName={candidate.name} items={items} />;
  }

  if (slug === "disc-adapted") {
    return <DiscForm candidateId={id} candidateName={candidate.name} blocks={DISC_BLOCKS} />;
  }

  if (slug === "label-adapted") {
    return <LabelForm candidateId={id} candidateName={candidate.name} items={LABEL_ITEMS} />;
  }

  notFound();
}
