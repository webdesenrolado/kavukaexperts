import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { NovaEmpresaClient } from "./nova-empresa-client";

export const metadata = { title: "Nova empresa — Kavuka Experts" };

export default function NovaEmpresaPage() {
  return (
    <AppShell>
      <div className="p-8 max-w-2xl">
        <Link
          href="/empresas-clientes"
          className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={14} /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mb-1">Nova empresa cliente</h1>
        <p className="text-sm opacity-70 mb-6">
          Empresa que vai aplicar avaliação NR-1 nos seus colaboradores.
        </p>
        <NovaEmpresaClient />
      </div>
    </AppShell>
  );
}
