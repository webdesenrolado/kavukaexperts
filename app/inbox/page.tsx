import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { channels, conversations, messages, candidates, jobs, companies } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { InboxClient } from "./client";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ ch?: string; c?: string; q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Multi-tenant: filtra pelo companyId do usuário (com fallback para a primeira empresa em demo)
  let companyId = session.companyId;
  if (!companyId) {
    const fallback = await db.query.companies.findFirst();
    companyId = fallback?.id ?? null;
  }
  if (!companyId) {
    return <AppShell><div className="p-8">Sem empresa configurada.</div></AppShell>;
  }

  const params = await searchParams;
  const filterChannel = params.ch ?? "all";
  const activeId = params.c ?? null;
  const search = (params.q ?? "").trim().toLowerCase();

  // Canais com contagem de unread por canal
  const channelList = await db
    .select({
      id: channels.id,
      kind: channels.kind,
      displayName: channels.displayName,
      identifier: channels.identifier,
      connected: channels.connected,
      unreadCount: sql<number>`(select coalesce(sum(unread_count), 0) from ${conversations} where ${conversations.channelId} = ${channels.id} and ${conversations.status} = 'open')`,
    })
    .from(channels)
    .where(eq(channels.companyId, companyId));

  const totalUnread = channelList.reduce((a, c) => a + Number(c.unreadCount || 0), 0);

  // Conversas: aplicar filtros
  let convList = await db
    .select({
      id: conversations.id,
      channelId: conversations.channelId,
      channelKind: channels.kind,
      contactName: conversations.contactName,
      contactHandle: conversations.contactHandle,
      contactAvatarUrl: conversations.contactAvatarUrl,
      status: conversations.status,
      unreadCount: conversations.unreadCount,
      lastMessageAt: conversations.lastMessageAt,
      lastMessagePreview: conversations.lastMessagePreview,
      tags: conversations.tags,
      candidateId: conversations.candidateId,
      jobId: conversations.jobId,
    })
    .from(conversations)
    .leftJoin(channels, eq(conversations.channelId, channels.id))
    .where(eq(conversations.companyId, companyId))
    .orderBy(desc(conversations.lastMessageAt));

  // Filtro por canal
  if (filterChannel !== "all") {
    convList = convList.filter((c) => c.channelKind === filterChannel);
  }
  if (search) {
    convList = convList.filter((c) =>
      [c.contactName, c.contactHandle, c.lastMessagePreview]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(search)),
    );
  }
  // Esconde spam por default
  if (filterChannel !== "spam") {
    convList = convList.filter((c) => c.status !== "spam");
  }

  // Conversa ativa
  let activeConversation = null;
  if (activeId) {
    const conv = convList.find((c) => c.id === activeId);
    if (conv) {
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(messages.sentAt);

      let candidate = null;
      if (conv.candidateId) {
        candidate = await db.query.candidates.findFirst({ where: eq(candidates.id, conv.candidateId) });
      }
      let job = null;
      if (conv.jobId) {
        job = await db.query.jobs.findFirst({ where: eq(jobs.id, conv.jobId) });
      }
      activeConversation = { conv, messages: msgs, candidate, job };
    }
  }

  // Carrega vagas abertas + candidatos pra modais de ação
  const openJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      location: jobs.location,
      status: jobs.status,
    })
    .from(jobs)
    .where(sql`${jobs.companyId} = ${companyId} AND ${jobs.status} = 'open'`);

  const allCandidates = await db
    .select({
      id: candidates.id,
      name: candidates.name,
      email: candidates.email,
      avatarUrl: candidates.avatarUrl,
    })
    .from(candidates);

  return (
    <AppShell>
      <InboxClient
        channels={channelList.map((c) => ({ ...c, unreadCount: Number(c.unreadCount || 0) }))}
        totalUnread={totalUnread}
        conversations={convList}
        activeConversation={activeConversation}
        filterChannel={filterChannel}
        search={search}
        openJobs={openJobs}
        allCandidates={allCandidates}
      />
    </AppShell>
  );
}
