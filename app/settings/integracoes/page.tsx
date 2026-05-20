import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { IntegracoesClient } from "./client";

export default async function IntegracoesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.companyId) {
    return (
      <AppShell>
        <div className="p-8 opacity-70">Sem empresa configurada na sessao.</div>
      </AppShell>
    );
  }

  const rows = await db
    .select()
    .from(channels)
    .where(eq(channels.companyId, session.companyId));

  const initial = rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    displayName: r.displayName,
    identifier: r.identifier,
    connected: r.connected ?? false,
  }));

  return (
    <AppShell>
      <IntegracoesClient initial={initial} />
    </AppShell>
  );
}
