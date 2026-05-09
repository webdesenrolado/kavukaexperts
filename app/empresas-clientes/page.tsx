import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { companies, employees, nr1Campaigns } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { Building2, Plus, Users, Activity } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Empresas clientes — Kavuka Experts" };

export default async function EmpresasClientesPage() {
  const list = await db
    .select({
      id: companies.id,
      name: companies.name,
      cnpj: companies.cnpj,
      industry: companies.industry,
      size: companies.size,
      city: companies.city,
      state: companies.state,
      contactName: companies.contactName,
      contactEmail: companies.contactEmail,
      createdAt: companies.createdAt,
    })
    .from(companies)
    .where(eq(companies.kind, "client"));

  // Conta colaboradores e campanhas por empresa
  const empCounts = await db
    .select({ companyId: employees.companyId, n: count(employees.id) })
    .from(employees)
    .groupBy(employees.companyId);
  const empMap = new Map(empCounts.map((r) => [r.companyId, Number(r.n)]));

  const campCounts = await db
    .select({ companyId: nr1Campaigns.companyId, n: count(nr1Campaigns.id) })
    .from(nr1Campaigns)
    .groupBy(nr1Campaigns.companyId);
  const campMap = new Map(campCounts.map((r) => [r.companyId, Number(r.n)]));

  return (
    <AppShell>
      <div className="p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#ff6a00] mb-1">
              <Building2 size={16} />
              <span className="text-xs uppercase tracking-wider opacity-70">NR-1 · B2B</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Empresas clientes</h1>
            <p className="text-sm opacity-70 mt-1">
              Empresas contratantes que aplicam avaliação NR-1 nos seus colaboradores.
            </p>
          </div>
          <Link
            href="/empresas-clientes/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-black"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            <Plus size={16} />
            Nova empresa
          </Link>
        </div>

        {list.length === 0 ? (
          <div
            className="border rounded-xl p-12 text-center"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <Building2 size={32} className="mx-auto opacity-40 mb-3" />
            <h3 className="font-semibold mb-1">Nenhuma empresa cliente</h3>
            <p className="text-sm opacity-70 mb-4">
              Cadastre a primeira empresa pra começar a aplicar avaliações NR-1.
            </p>
            <Link
              href="/empresas-clientes/novo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-black"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
            >
              <Plus size={14} />
              Cadastrar empresa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((c) => (
              <Link
                key={c.id}
                href={`/empresas-clientes/${c.id}`}
                className="border rounded-xl p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base truncate">{c.name}</h3>
                    <div className="text-xs opacity-60 font-mono mt-0.5">{c.cnpj || "—"}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-black font-black shrink-0">
                    {c.name?.[0] ?? "?"}
                  </div>
                </div>
                <div className="text-xs opacity-70 space-y-1">
                  {c.industry && <div>{c.industry}</div>}
                  {(c.city || c.state) && (
                    <div>
                      {c.city}
                      {c.state && `/${c.state}`}
                    </div>
                  )}
                </div>
                <div
                  className="flex items-center gap-3 mt-4 pt-3 border-t text-xs"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} className="opacity-60" />
                    <strong>{empMap.get(c.id) ?? 0}</strong>
                    <span className="opacity-60">colaboradores</span>
                  </span>
                  <span className="opacity-30">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Activity size={12} className="opacity-60" />
                    <strong>{campMap.get(c.id) ?? 0}</strong>
                    <span className="opacity-60">campanhas</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
