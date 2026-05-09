import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Users, Activity, MapPin, Mail, Phone, Hash } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { companies, employees, nr1Campaigns, users } from "@/db/schema";
import { and, eq, count, desc } from "drizzle-orm";
import { CriarAdminBox } from "./criar-admin-box";

export const dynamic = "force-dynamic";

export default async function EmpresaDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await db.query.companies.findFirst({
    where: and(eq(companies.id, id), eq(companies.kind, "client")),
  });
  if (!company) notFound();

  const empCount = await db
    .select({ n: count(employees.id) })
    .from(employees)
    .where(eq(employees.companyId, id));
  const campaigns = await db
    .select()
    .from(nr1Campaigns)
    .where(eq(nr1Campaigns.companyId, id))
    .orderBy(desc(nr1Campaigns.createdAt));

  return (
    <AppShell>
      <div className="p-8 max-w-6xl">
        <Link
          href="/empresas-clientes"
          className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={14} /> Voltar
        </Link>

        {/* HERO */}
        <header
          className="rounded-2xl border p-6 mb-6 flex items-start justify-between gap-6 flex-wrap"
          style={{
            borderColor: "var(--border)",
            background: "linear-gradient(135deg, rgba(255,106,0,0.06), rgba(255,204,0,0.02))",
          }}
        >
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-2xl font-black text-black shrink-0">
              {company.name?.[0] ?? "?"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">
                <Building2 size={11} />
                Empresa cliente B2B
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                {company.cnpj && (
                  <Pill icon={<Hash size={11} />} label={company.cnpj} mono />
                )}
                {company.industry && <Pill label={company.industry} />}
                {(company.city || company.state) && (
                  <Pill
                    icon={<MapPin size={11} />}
                    label={`${company.city ?? ""}${company.state ? "/" + company.state : ""}`}
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTACT + STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-xl border p-5 lg:col-span-2"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <h3 className="text-xs uppercase tracking-wider opacity-60 mb-3">Contato no RH</h3>
            {company.contactName || company.contactEmail || company.contactPhone ? (
              <div className="space-y-2 text-sm">
                {company.contactName && <div className="font-semibold">{company.contactName}</div>}
                {company.contactEmail && (
                  <div className="flex items-center gap-2 opacity-80">
                    <Mail size={13} /> {company.contactEmail}
                  </div>
                )}
                {company.contactPhone && (
                  <div className="flex items-center gap-2 opacity-80">
                    <Phone size={13} /> {company.contactPhone}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm opacity-60">Nenhum contato cadastrado.</p>
            )}
            {company.notes && (
              <div className="mt-4 pt-4 border-t text-xs opacity-70" style={{ borderColor: "var(--border)" }}>
                {company.notes}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <StatCard
              icon={<Users size={14} />}
              label="Colaboradores"
              value={Number(empCount[0]?.n ?? 0).toString()}
              href={`/empresas-clientes/${id}/colaboradores`}
              color="#0ea5e9"
            />
            <StatCard
              icon={<Activity size={14} />}
              label="Campanhas NR-1"
              value={campaigns.length.toString()}
              href={`/empresas-clientes/${id}/nr1`}
              color="#10b981"
              sub={
                campaigns.find((c) => c.status === "active")
                  ? `${campaigns.filter((c) => c.status === "active").length} ativa(s)`
                  : "Nenhuma ativa"
              }
            />
          </div>
        </div>

        {/* CTA principal — gerenciar colaboradores */}
        <div
          className="rounded-xl border p-5 flex items-center justify-between gap-3 mb-3"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <div>
            <h3 className="font-bold">Gerenciar colaboradores</h3>
            <p className="text-sm opacity-70 mt-1">
              Cadastre os colaboradores que vão receber a avaliação NR-1 (manualmente ou via planilha CSV).
            </p>
          </div>
          <Link
            href={`/empresas-clientes/${id}/colaboradores`}
            className="px-5 py-2.5 rounded-lg font-bold text-black whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            Abrir colaboradores
          </Link>
        </div>

        {/* CTA admin de empresa */}
        <CriarAdminBox companyId={id} companyName={company.name} />
      </div>
    </AppShell>
  );
}

function Pill({
  icon,
  label,
  mono = false,
}: {
  icon?: React.ReactNode;
  label: string;
  mono?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${mono ? "font-mono" : ""}`}
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      {icon}
      {label}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  color,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  color: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border p-4 hover:bg-black/5 dark:hover:bg-white/5"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider opacity-60">{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>}
    </Link>
  );
}
