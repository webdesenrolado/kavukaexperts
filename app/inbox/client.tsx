"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Inbox,
  Search,
  CheckCircle2,
  Briefcase,
  UserPlus,
  Sparkles,
  Archive,
  Tag,
  ExternalLink,
  Send,
  X,
  Mail,
  MessageCircle,
} from "lucide-react";

function Linkedin({ size = 14, className = "", style }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0z" />
    </svg>
  );
}
function Instagram({ size = 14, className = "", style }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37a4 4 0 1 1-4.73-4.73 4 4 0 0 1 4.73 4.73Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface Channel {
  id: string;
  kind: string;
  displayName: string;
  identifier: string | null;
  connected: boolean | null;
  unreadCount: number;
}

interface ConvSummary {
  id: string;
  channelId: string;
  channelKind: string | null;
  contactName: string | null;
  contactHandle: string | null;
  contactAvatarUrl: string | null;
  status: string;
  unreadCount: number | null;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  tags: string | null;
  candidateId: string | null;
  jobId: string | null;
}

interface Message {
  id: string;
  conversationId: string;
  direction: string;
  bodyText: string | null;
  sentAt: Date;
  readAt: Date | null;
}

interface ActiveConv {
  conv: ConvSummary;
  messages: Message[];
  candidate: any;
  job: any;
}

interface OpenJob {
  id: string;
  title: string;
  location: string | null;
  status: string;
}

interface CandLite {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Props {
  channels: Channel[];
  totalUnread: number;
  conversations: ConvSummary[];
  activeConversation: ActiveConv | null;
  filterChannel: string;
  search: string;
  openJobs: OpenJob[];
  allCandidates: CandLite[];
}

const CHANNEL_META: Record<string, { name: string; icon: any; color: string }> = {
  whatsapp: { name: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  email: { name: "Email", icon: Mail, color: "#0ea5e9" },
  instagram: { name: "Instagram", icon: Instagram, color: "#E1306C" },
  linkedin: { name: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  web: { name: "Web", icon: ExternalLink, color: "#a855f7" },
};

function timeAgo(d: Date | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function InboxClient({
  channels,
  totalUnread,
  conversations,
  activeConversation,
  filterChannel,
  search,
  openJobs,
  allCandidates,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(search);
  const [showLinkJobModal, setShowLinkJobModal] = useState(false);
  const [showLinkCandModal, setShowLinkCandModal] = useState(false);
  const [showSendInviteModal, setShowSendInviteModal] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ link: string; expiresAt: string } | null>(null);
  const [composerText, setComposerText] = useState("");
  const [composerSubject, setComposerSubject] = useState("");
  const [sending, setSending] = useState(false);

  // Polling: a cada 30s busca novas mensagens em todos os canais conectados
  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const res = await fetch("/api/channels/sync", { method: "POST" });
        if (!alive || !res.ok) return;
        const data = (await res.json()) as { results: Array<{ fetched: number }> };
        const total = data.results.reduce((s, r) => s + r.fetched, 0);
        if (total > 0) router.refresh();
      } catch {
        // ignora
      }
    }
    const id = setInterval(tick, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [router]);

  // Reset do composer ao trocar de conversa
  useEffect(() => {
    setComposerText("");
    setComposerSubject("");
  }, [activeConversation?.conv.id]);

  async function sendMessage() {
    if (!activeConversation || !composerText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversation.conv.id,
          bodyText: composerText.trim(),
          subject: activeConversation.conv.channelKind === "email"
            ? (composerSubject.trim() || `Re: ${activeConversation.conv.lastMessagePreview?.slice(0, 60) ?? "conversa"}`)
            : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Falha ao enviar.");
        return;
      }
      setComposerText("");
      setComposerSubject("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  function go(updates: Record<string, string | null>) {
    const url = new URL(window.location.href);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") url.searchParams.delete(k);
      else url.searchParams.set(k, v);
    }
    router.push(url.pathname + url.search);
  }

  function selectChannel(kind: string) {
    go({ ch: kind === "all" ? null : kind, c: null });
  }
  function selectConv(id: string) {
    go({ c: id });
  }

  async function linkToJob(jobId: string) {
    if (!activeConversation || !activeConversation.candidate) {
      alert("Linka primeiro a um candidato.");
      return;
    }
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        candidateId: activeConversation.candidate.id,
        source: activeConversation.conv.channelKind ?? "inbox",
      }),
    });
    if (res.ok) {
      setShowLinkJobModal(false);
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao adicionar à vaga.");
    }
  }

  async function sendInvitation() {
    if (!activeConversation?.candidate) return;
    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: activeConversation.candidate.id,
        instrument: "ipip-neo-120",
        expiresInDays: 14,
        timeLimitMinutes: 30,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setInviteResult({
        link: `${window.location.origin}/aplicar/${data.token}`,
        expiresAt: data.expiresAt,
      });
    } else {
      alert("Erro ao gerar convite.");
    }
  }

  const conv = activeConversation?.conv;
  const tags: string[] = conv?.tags ? JSON.parse(conv.tags) : [];

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "240px 340px 1fr",
        height: "calc(100vh - 0px)",
        background: "var(--background)",
      }}
    >
      {/* COLUNA 1 — CANAIS */}
      <aside
        className="border-r overflow-y-auto"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Inbox size={16} className="text-[#ff6a00]" />
            <h1 className="font-bold">Inbox Omnichannel</h1>
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-60">
            {totalUnread > 0 ? `${totalUnread} não lidas` : "tudo em dia"}
          </div>
        </div>

        <div className="p-2 space-y-0.5">
          <ChannelButton
            active={filterChannel === "all"}
            onClick={() => selectChannel("all")}
            icon={Inbox}
            color="#ff6a00"
            label="Todas"
            count={conversations.length}
            unread={totalUnread}
          />
          {channels.map((ch) => {
            const meta = CHANNEL_META[ch.kind] ?? CHANNEL_META.web;
            return (
              <ChannelButton
                key={ch.id}
                active={filterChannel === ch.kind}
                onClick={() => selectChannel(ch.kind)}
                icon={meta.icon}
                color={meta.color}
                label={meta.name}
                sub={ch.identifier ?? undefined}
                unread={ch.unreadCount}
                connected={!!ch.connected}
              />
            );
          })}
        </div>

        <div className="p-3 border-t mt-2 text-[10px] opacity-60" style={{ borderColor: "var(--border)" }}>
          <div className="font-semibold uppercase tracking-wider mb-2">Em breve</div>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 opacity-60"><MessageCircle size={10} /> Telegram</li>
            <li className="flex items-center gap-2 opacity-60"><MessageCircle size={10} /> SMS</li>
            <li className="flex items-center gap-2 opacity-60"><ExternalLink size={10} /> Webchat (carreiras)</li>
          </ul>
        </div>
      </aside>

      {/* COLUNA 2 — LISTA DE CONVERSAS */}
      <section
        className="border-r overflow-hidden flex flex-col"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") go({ q: q || null });
              }}
              placeholder="Buscar..."
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border text-xs"
              style={{ background: "var(--background)", borderColor: "var(--border)" }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs opacity-60">Nenhuma conversa neste canal.</div>
          ) : (
            conversations.map((c) => {
              const meta = CHANNEL_META[c.channelKind ?? ""] ?? CHANNEL_META.web;
              const isActive = activeConversation?.conv.id === c.id;
              const hasUnread = (c.unreadCount ?? 0) > 0;
              return (
                <button
                  key={c.id}
                  onClick={() => selectConv(c.id)}
                  className={`w-full text-left p-3 border-b flex gap-3 transition-colors ${
                    isActive ? "bg-[#ff6a00]/10" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="relative shrink-0">
                    {c.contactAvatarUrl ? (
                      <img src={c.contactAvatarUrl} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center text-xs font-bold opacity-70">
                        {c.contactName?.[0] ?? "?"}
                      </div>
                    )}
                    {/* Channel badge */}
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border"
                      style={{ background: meta.color, borderColor: "var(--card)" }}
                    >
                      <meta.icon size={9} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-xs truncate ${hasUnread ? "font-bold" : "font-medium"}`}>
                        {c.contactName}
                      </span>
                      <span className="text-[9px] opacity-60 shrink-0">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${hasUnread ? "opacity-90" : "opacity-60"}`}
                    >
                      {c.lastMessagePreview}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {hasUnread && (
                        <span className="bg-[#ff6a00] text-black text-[9px] font-bold rounded-full px-1.5 py-px">
                          {c.unreadCount}
                        </span>
                      )}
                      {c.candidateId && (
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-px rounded-full bg-[#10b981]/10 text-[#10b981] font-bold">
                          Candidato
                        </span>
                      )}
                      {c.jobId && (
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-px rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] font-bold">
                          Vaga
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* COLUNA 3 — CONVERSA ATIVA */}
      <section className="flex flex-col" style={{ background: "var(--background)" }}>
        {!activeConversation ? (
          <EmptyState />
        ) : (
          <>
            {/* Header */}
            <header
              className="px-5 py-3 border-b flex items-center justify-between gap-3"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {conv?.contactAvatarUrl ? (
                  <img src={conv.contactAvatarUrl} alt="" className="w-9 h-9 rounded-full shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-500/20 flex items-center justify-center font-bold opacity-70 shrink-0">
                    {conv?.contactName?.[0] ?? "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{conv?.contactName}</div>
                  <div className="text-[11px] opacity-60 flex items-center gap-1">
                    {(() => {
                      const meta = CHANNEL_META[conv?.channelKind ?? ""] ?? CHANNEL_META.web;
                      return (
                        <>
                          <meta.icon size={10} style={{ color: meta.color }} />
                          {meta.name} · {conv?.contactHandle}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!activeConversation.candidate ? (
                  <button
                    onClick={() => setShowLinkCandModal(true)}
                    className="text-[11px] px-3 py-1.5 rounded-md bg-[#ff6a00]/10 text-[#ff6a00] font-semibold hover:bg-[#ff6a00]/20 inline-flex items-center gap-1"
                  >
                    <UserPlus size={11} /> Linkar candidato
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLinkJobModal(true)}
                    className="text-[11px] px-3 py-1.5 rounded-md bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold hover:bg-[#0ea5e9]/20 inline-flex items-center gap-1"
                  >
                    <Briefcase size={11} /> Adicionar à vaga
                  </button>
                )}

                {activeConversation.candidate && (
                  <button
                    onClick={() => {
                      setInviteResult(null);
                      setShowSendInviteModal(true);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-md bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] text-black font-bold hover:opacity-90 inline-flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Enviar avaliação
                  </button>
                )}

                <button
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 opacity-70"
                  title="Arquivar"
                >
                  <Archive size={14} />
                </button>
              </div>
            </header>

            {/* Conteúdo: messages + side panel */}
            <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: "1fr 280px" }}>
              {/* Messages */}
              <div className="overflow-y-auto p-6 space-y-3">
                {activeConversation.messages.map((m) => {
                  const out = m.direction === "outbound";
                  return (
                    <div key={m.id} className={`flex ${out ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${out ? "rounded-br-sm" : "rounded-bl-sm"}`}
                        style={{
                          background: out ? "linear-gradient(135deg, #ff6a00, #ffcc00)" : "var(--card)",
                          border: out ? "none" : "1px solid var(--border)",
                          color: out ? "#0a0a0b" : undefined,
                        }}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.bodyText}</p>
                        <div className={`text-[10px] mt-1 ${out ? "opacity-60" : "opacity-50"}`}>
                          {new Date(m.sentAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {out && m.readAt && " · lida"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Side panel */}
              <aside
                className="border-l overflow-y-auto p-4 space-y-4 text-xs"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
              >
                {activeConversation.candidate && (
                  <div>
                    <div className="text-[9px] uppercase tracking-wider opacity-60 mb-2">
                      Candidato linkado
                    </div>
                    <Link
                      href={`/candidatos/${activeConversation.candidate.id}`}
                      className="block p-3 rounded-lg border hover:bg-[#ff6a00]/5"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {activeConversation.candidate.avatarUrl ? (
                          <img
                            src={activeConversation.candidate.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-500/20" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs truncate">
                            {activeConversation.candidate.name}
                          </div>
                          <div className="text-[10px] opacity-60 truncate">
                            {activeConversation.candidate.currentRole}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#ff6a00] flex items-center gap-1">
                        Ver perfil 360° <ExternalLink size={10} />
                      </div>
                    </Link>
                  </div>
                )}

                {activeConversation.job && (
                  <div>
                    <div className="text-[9px] uppercase tracking-wider opacity-60 mb-2">Vaga linkada</div>
                    <Link
                      href={`/vagas/${activeConversation.job.id}`}
                      className="block p-3 rounded-lg border hover:bg-[#0ea5e9]/5"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="font-semibold text-xs">{activeConversation.job.title}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">
                        {activeConversation.job.location} · {activeConversation.job.status}
                      </div>
                      <div className="text-[10px] text-[#0ea5e9] flex items-center gap-1 mt-1">
                        Ir para a vaga <ExternalLink size={10} />
                      </div>
                    </Link>
                  </div>
                )}

                {tags.length > 0 && (
                  <div>
                    <div className="text-[9px] uppercase tracking-wider opacity-60 mb-2 flex items-center gap-1">
                      <Tag size={9} /> Labels
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff6a00]/10 text-[#ff6a00] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[9px] uppercase tracking-wider opacity-60 mb-2">Ações rápidas</div>
                  <div className="space-y-1">
                    <ActionButton icon={CheckCircle2} label="Marcar como lida" />
                    <ActionButton icon={Tag} label="Adicionar label" />
                    <ActionButton icon={Archive} label="Arquivar conversa" />
                  </div>
                </div>
              </aside>
            </div>

            {/* Composer */}
            <footer
              className="border-t p-3 space-y-2"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              {activeConversation.conv.channelKind === "email" && (
                <input
                  value={composerSubject}
                  onChange={(e) => setComposerSubject(e.target.value)}
                  placeholder={`Re: ${activeConversation.conv.lastMessagePreview?.slice(0, 60) ?? "..."}`}
                  className="w-full px-3 py-1.5 rounded-lg border text-xs"
                  style={{ background: "var(--background)", borderColor: "var(--border)" }}
                />
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Resposta direta via ${CHANNEL_META[activeConversation.conv.channelKind ?? ""]?.name ?? "canal"} · cmd/ctrl+Enter pra enviar`}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-lg border text-xs resize-none"
                  style={{ background: "var(--background)", borderColor: "var(--border)" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !composerText.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] text-black font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Send size={12} /> {sending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      {/* MODAL: Adicionar à vaga */}
      {showLinkJobModal && (
        <Modal title="Adicionar candidato à vaga" onClose={() => setShowLinkJobModal(false)}>
          <p className="text-xs opacity-70 mb-3">
            Vai criar uma aplicação na etapa "Inscrito" do Kanban da vaga selecionada.
          </p>
          <div className="space-y-1">
            {openJobs.map((j) => (
              <button
                key={j.id}
                onClick={() => linkToJob(j.id)}
                className="w-full text-left p-3 rounded-lg border hover:bg-[#ff6a00]/5 hover:border-[#ff6a00]"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="font-semibold text-sm">{j.title}</div>
                {j.location && <div className="text-[10px] opacity-60">{j.location}</div>}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* MODAL: Linkar candidato (placeholder visual) */}
      {showLinkCandModal && (
        <Modal title="Linkar a candidato" onClose={() => setShowLinkCandModal(false)}>
          <p className="text-xs opacity-70 mb-3">
            Selecione um candidato existente ou crie um novo a partir desta conversa.
          </p>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {allCandidates.slice(0, 20).map((c) => (
              <button
                key={c.id}
                onClick={() => alert("Em breve: vincula esta conversa ao candidato selecionado.")}
                className="w-full text-left p-2 rounded-lg border hover:bg-[#ff6a00]/5 flex items-center gap-2"
                style={{ borderColor: "var(--border)" }}
              >
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-500/20" />
                )}
                <div>
                  <div className="text-xs font-medium">{c.name}</div>
                  <div className="text-[10px] opacity-60">{c.email}</div>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* MODAL: Enviar avaliação */}
      {showSendInviteModal && (
        <Modal title="Enviar avaliação Kavuka" onClose={() => setShowSendInviteModal(false)}>
          {!inviteResult ? (
            <>
              <p className="text-xs opacity-70 mb-4">
                Vai gerar um link da avaliação IPIP-NEO-120 para{" "}
                <strong>{activeConversation?.candidate?.name}</strong>. Tempo: 30 min após iniciar.
              </p>
              <button
                onClick={sendInvitation}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] text-black font-bold text-sm hover:opacity-90"
              >
                Gerar link de avaliação
              </button>
            </>
          ) : (
            <>
              <p className="text-xs opacity-70 mb-3">Link gerado, válido até {new Date(inviteResult.expiresAt).toLocaleDateString("pt-BR")}:</p>
              <div className="p-3 rounded-lg border bg-black/30 text-[11px] font-mono break-all" style={{ borderColor: "var(--border)" }}>
                {inviteResult.link}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(inviteResult.link)}
                className="w-full mt-3 px-4 py-2 rounded-lg bg-[#ff6a00]/10 text-[#ff6a00] font-semibold text-xs"
              >
                Copiar link
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Olá ${activeConversation?.candidate?.name?.split(" ")[0]}! Sua avaliação Kavuka: ${inviteResult.link}`)}`}
                target="_blank"
                rel="noopener"
                className="block w-full mt-2 px-4 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] font-semibold text-xs text-center"
              >
                Enviar via WhatsApp
              </a>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

function ChannelButton({
  active,
  onClick,
  icon: Icon,
  color,
  label,
  sub,
  count,
  unread,
  connected = true,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  color: string;
  label: string;
  sub?: string;
  count?: number;
  unread: number;
  connected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active ? "bg-[#ff6a00]/10 text-[#ff6a00] font-medium" : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: active ? "transparent" : `${color}15`,
          color: active ? undefined : color,
        }}
      >
        <Icon size={20} style={{ color: active ? undefined : color }} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-xs font-medium truncate flex items-center gap-1.5">
          {label}
          {!connected && <span className="text-[8px] opacity-60">(off)</span>}
        </div>
        {sub && <div className="text-[10px] opacity-50 truncate">{sub}</div>}
      </div>
      {unread > 0 && (
        <span className="bg-[#ff6a00] text-black text-[10px] font-bold rounded-full px-1.5 min-w-[18px] text-center">
          {unread}
        </span>
      )}
    </button>
  );
}

function ActionButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button
      onClick={() => alert("Em breve")}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/5 text-left"
    >
      <Icon size={12} className="opacity-70" />
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center mb-4"
      >
        <Inbox size={28} className="text-black" />
      </div>
      <h2 className="text-lg font-semibold mb-1">Inbox Omnichannel</h2>
      <p className="text-xs opacity-60 max-w-xs">
        Selecione uma conversa à esquerda. WhatsApp, email, Instagram e LinkedIn — tudo num lugar só,
        com ações rápidas para o pipeline.
      </p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
