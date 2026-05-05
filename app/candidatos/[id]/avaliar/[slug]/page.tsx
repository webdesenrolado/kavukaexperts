import { notFound } from "next/navigation";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IPIP_NEO_120_ITEMS } from "@/services/ipip-neo-120/src/items";
import { IpipForm } from "./form";

export default async function AvaliarPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  if (slug !== "ipip-neo-120") notFound();

  const candidate = await db.query.candidates.findFirst({ where: eq(candidates.id, id) });
  if (!candidate) notFound();

  const items = IPIP_NEO_120_ITEMS.map((it) => ({
    item_id: it.item_id,
    text: it.text,
  }));

  return (
    <IpipForm
      candidateId={id}
      candidateName={candidate.name}
      items={items}
    />
  );
}
