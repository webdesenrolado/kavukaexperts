import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { companies, employees } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ColaboradoresClient } from "./colaboradores-client";

export const dynamic = "force-dynamic";

export default async function ColaboradoresPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await db.query.companies.findFirst({
    where: and(eq(companies.id, id), eq(companies.kind, "client")),
  });
  if (!company) notFound();

  const initial = await db
    .select()
    .from(employees)
    .where(eq(employees.companyId, id))
    .orderBy(desc(employees.createdAt));

  return (
    <AppShell>
      <div className="p-8 max-w-6xl">
        <Link
          href={`/empresas-clientes/${id}`}
          className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={14} /> Voltar para {company.name}
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-sm opacity-70 mt-1">
            {company.name} · {initial.length} cadastrado{initial.length === 1 ? "" : "s"}
          </p>
        </div>
        <ColaboradoresClient companyId={id} initial={initial as any} />
      </div>
    </AppShell>
  );
}
