import "./portal.css";
import Link from "next/link";
import { getCandidateSession } from "@/lib/portal/session";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

async function PortalHeader() {
  const session = await getCandidateSession();
  let name: string | null = null;
  if (session) {
    const c = await db.query.candidates.findFirst({
      where: eq(candidates.id, session.candidateId),
      columns: { name: true },
    });
    name = c?.name ?? null;
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-kavuka-gray-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link
            href={session ? "/portal/me" : "/portal/login"}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-kavuka-black flex items-center justify-center">
              <span className="text-kavuka-yellow font-bold text-lg leading-none">
                K
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold text-kavuka-black tracking-tight">
                Kavuka<span className="text-kavuka-yellow"> Portal</span>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-kavuka-gray-500 -mt-0.5">
                área do candidato
              </div>
            </div>
          </Link>

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="https://kavukavagas.com.br/vagas"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center text-sm font-medium text-kavuka-gray-700 hover:text-kavuka-black transition-colors"
              >
                Ver vagas
              </Link>
              <span className="hidden sm:inline text-sm text-kavuka-gray-500">
                Olá, <span className="text-kavuka-black font-medium">{name?.split(" ")[0]}</span>
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/portal/cadastro"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-kavuka-black border border-kavuka-gray-200 hover:border-kavuka-black transition-colors"
              >
                Criar conta
              </Link>
              <Link
                href="/portal/login"
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-kavuka-black text-kavuka-yellow hover:bg-zinc-900 transition-colors"
              >
                Entrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function PortalFooter() {
  return (
    <footer className="border-t border-kavuka-gray-200 mt-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-kavuka-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-kavuka-black flex items-center justify-center">
            <span className="text-kavuka-yellow font-bold text-xs leading-none">K</span>
          </div>
          <span>© {new Date().getFullYear()} Kavuka. Todos os direitos reservados.</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="https://kavukavagas.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-kavuka-black transition-colors">
            Vagas
          </a>
          <a href="https://kavukavagas.com.br/sobre" target="_blank" rel="noopener noreferrer" className="hover:text-kavuka-black transition-colors">
            Sobre
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kavuka-portal-scope min-h-screen flex flex-col">
      <PortalHeader />
      <main className="flex-1">{children}</main>
      <PortalFooter />
    </div>
  );
}
