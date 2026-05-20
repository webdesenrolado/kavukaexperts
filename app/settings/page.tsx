import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Plug, Building2, Users, Shield } from "lucide-react";

const SECTIONS = [
  {
    href: "/settings/integracoes",
    icon: Plug,
    title: "Integracoes Omnichannel",
    desc: "Conectar email, WhatsApp, Instagram. Inbox unificada com pipeline.",
    ready: true,
  },
  {
    href: "/settings",
    icon: Building2,
    title: "Empresa",
    desc: "Razao social, CNPJ, logo, contato.",
    ready: false,
  },
  {
    href: "/settings",
    icon: Users,
    title: "Usuarios e papeis",
    desc: "Convidar recrutadores, gestores e admins.",
    ready: false,
  },
  {
    href: "/settings",
    icon: Shield,
    title: "Governanca e LGPD",
    desc: "Politicas de consentimento, retencao e contestacao do Score Humano.",
    ready: false,
  },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="p-8 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Configuracoes</h1>
        <p className="opacity-70 mb-8">Empresa, usuarios, integracoes e governanca LGPD.</p>

        <div className="grid grid-cols-2 gap-3">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const card = (
              <div
                className={`p-5 rounded-xl border h-full ${s.ready ? "hover:border-[#ff6a00] hover:bg-[#ff6a00]/5" : "opacity-50"} transition-colors`}
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--background)" }}
                  >
                    <Icon size={18} className="text-[#ff6a00]" />
                  </div>
                  <div className="font-semibold text-sm">{s.title}</div>
                  {!s.ready && (
                    <span className="text-[9px] uppercase tracking-wider opacity-60 ml-auto">
                      em breve
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-70 leading-relaxed">{s.desc}</p>
              </div>
            );
            return s.ready ? (
              <Link key={s.title} href={s.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={s.title}>{card}</div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
