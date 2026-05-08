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
    <header className="border-b sticky top-0 z-30 backdrop-blur" style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.6)" }}>
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href={session ? "/portal/me" : "/portal/login"} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-black font-black text-sm">K</div>
          <div className="leading-tight">
            <div className="text-sm font-bold">Kavuka Experts</div>
            <div className="text-[10px] opacity-60 -mt-0.5">portal do candidato</div>
          </div>
        </Link>
        {session ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-70 hidden sm:inline">Olá, {name?.split(" ")[0]}</span>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/portal/login"
            className="text-xs px-3 py-1.5 rounded-md border hover:bg-white/5"
            style={{ borderColor: "var(--border)" }}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <PortalHeader />
      <main>{children}</main>
    </div>
  );
}
