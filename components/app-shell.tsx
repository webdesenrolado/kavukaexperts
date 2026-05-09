"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ClipboardList,
  BrainCircuit,
  GraduationCap,
  Settings,
  LogOut,
  Inbox,
  KanbanSquare,
  Map as MapIcon,
  Building2,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/vagas", label: "Vagas", icon: Briefcase },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/candidatos", label: "Candidatos", icon: Users },
  { href: "/mapa", label: "Mapa", icon: MapIcon },
  { href: "/empresas-clientes", label: "Empresas (NR-1)", icon: Building2 },
  { href: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { href: "/score-humano", label: "Score Humano", icon: BrainCircuit },
  { href: "/academy", label: "Academy", icon: GraduationCap },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div
          className="px-5 py-6 border-b"
          style={{
            borderColor: "var(--border)",
            background: "linear-gradient(135deg, #0a0a0b 0%, #131319 100%)",
          }}
        >
          <Link href="/" className="block">
            <img
              src="/brand/logo-kavuka-branco.png"
              alt="Kavuka by Guep"
              className="h-9 w-auto"
              draggable={false}
            />
            <div className="text-[9px] uppercase tracking-[0.25em] text-white/50 mt-2">
              Experts · Conheça Sua Identidade
            </div>
          </Link>
        </div>

        <nav className="p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[#ff6a00]/10 text-[#ff6a00] font-medium"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-60 p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Settings size={18} />
            Configurações
          </Link>
          {!loading && user && (
            <div className="mt-2 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--background)" }}>
              <div className="font-medium truncate">{user.name}</div>
              <div className="opacity-60 truncate">{user.email}</div>
              <button
                onClick={logout}
                className="mt-2 flex items-center gap-2 text-[11px] opacity-70 hover:opacity-100"
              >
                <LogOut size={12} /> Sair
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
