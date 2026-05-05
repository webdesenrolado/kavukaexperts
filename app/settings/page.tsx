import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Configurações</h1>
        <p className="opacity-70 mb-8">Empresa, usuários, integrações e governança LGPD.</p>
        <div
          className="p-8 rounded-xl border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <p className="opacity-70 text-sm">Em construção.</p>
        </div>
      </div>
    </AppShell>
  );
}
