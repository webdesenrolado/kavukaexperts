import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { NovaCampaignClient } from "./nova-campaign-client";

export const metadata = { title: "Nova campanha NR-1" };

export default async function NovaCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <div className="p-8 max-w-2xl">
        <Link
          href={`/empresas-clientes/${id}/nr1`}
          className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={14} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mb-1">Nova campanha NR-1</h1>
        <p className="text-sm opacity-70 mb-6">
          Avaliação de riscos psicossociais com 13 perguntas (NR-1 + COPSOQ-III).
        </p>
        <NovaCampaignClient companyId={id} />
      </div>
    </AppShell>
  );
}
