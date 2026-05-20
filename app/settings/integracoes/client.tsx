"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MessageCircle,
  Plus,
  Trash2,
  RefreshCcw,
  TestTube2,
  Pencil,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  QrCode,
} from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37a4 4 0 1 1-4.73-4.73 4 4 0 0 1 4.73 4.73Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

type Kind = "email" | "whatsapp" | "instagram";

interface ChannelRow {
  id: string;
  kind: string;
  displayName: string;
  identifier: string | null;
  connected: boolean;
}

interface ChannelDetail extends ChannelRow {
  state?: {
    status: "disconnected" | "connecting" | "qr" | "connected" | "error";
    qrDataUrl?: string;
    lastError?: string;
    lastSyncAt?: string;
  };
}

const KIND_META: Record<Kind, { name: string; icon: any; color: string }> = {
  email: { name: "Email", icon: Mail, color: "#0ea5e9" },
  whatsapp: { name: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  instagram: { name: "Instagram", icon: InstagramIcon, color: "#E1306C" },
};

export function IntegracoesClient({ initial }: { initial: ChannelRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<ChannelDetail[]>(initial);
  const [adding, setAdding] = useState<Kind | null>(null);
  const [editing, setEditing] = useState<ChannelRow | null>(null);
  const [details, setDetails] = useState<Record<string, ChannelDetail>>({});

  // Polling de estado dos canais (pra ver QR aparecer / status mudar)
  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const res = await fetch("/api/channels");
        if (!res.ok) return;
        const data = (await res.json()) as ChannelDetail[];
        if (!alive) return;
        setRows(data);
        const map: Record<string, ChannelDetail> = {};
        for (const r of data) map[r.id] = r;
        setDetails(map);
      } catch {
        // ignora — proxima tentativa
      }
    }
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  async function remove(id: string) {
    if (!confirm("Remover este canal? Apaga tambem todas as conversas vinculadas (mensagens incluidas).")) return;
    const res = await fetch(`/api/channels/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRows((cur) => cur.filter((r) => r.id !== id));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`Falha ao remover: ${data.error || res.statusText} (${res.status})`);
    }
  }

  async function sync(id: string) {
    const res = await fetch(`/api/channels/${id}/sync`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      alert(`Sync OK — ${data.fetched} novas mensagens.`);
      router.refresh();
    } else {
      alert("Falha no sync. Veja o status do canal.");
    }
  }

  async function test(id: string) {
    const res = await fetch(`/api/channels/${id}/test`, { method: "POST" });
    const data = await res.json();
    alert(data.ok ? "Conexao OK." : `Falhou: ${data.detail || "sem detalhe"}`);
  }

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Integracoes Omnichannel</h1>
        <p className="opacity-70 text-sm">
          Conecte seus canais de comunicacao. Todas as mensagens caem no <strong>/inbox</strong> com
          acoes de pipeline (linkar candidato, vincular a vaga, enviar avaliacao).
        </p>
      </header>

      {/* CTAs pra adicionar canais */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {(Object.keys(KIND_META) as Kind[]).map((kind) => {
          const meta = KIND_META[kind];
          return (
            <button
              key={kind}
              onClick={() => setAdding(kind)}
              className="p-5 rounded-xl border text-left hover:border-[#ff6a00] hover:bg-[#ff6a00]/5 transition-colors"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${meta.color}20`, color: meta.color }}
                >
                  <meta.icon size={18} />
                </div>
                <div>
                  <div className="font-semibold text-sm">{meta.name}</div>
                  <div className="text-[10px] opacity-60 uppercase tracking-wider">Adicionar canal</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#ff6a00] mt-2">
                <Plus size={12} /> Conectar
              </div>
            </button>
          );
        })}
      </div>

      {/* Lista de canais existentes */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider opacity-60 mb-3">
          Canais conectados ({rows.length})
        </h2>
        {rows.length === 0 ? (
          <div
            className="p-8 rounded-xl border text-center opacity-60 text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            Nenhum canal ainda. Clica em algum acima pra comecar.
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <ChannelCard
                key={row.id}
                row={details[row.id] ?? row}
                onTest={() => test(row.id)}
                onSync={() => sync(row.id)}
                onEdit={() => setEditing(row)}
                onRemove={() => remove(row.id)}
              />
            ))}
          </div>
        )}
      </section>

      {adding && (
        <AddModal
          kind={adding}
          onClose={() => setAdding(null)}
          onCreated={() => {
            setAdding(null);
            router.refresh();
          }}
        />
      )}

      {editing && (
        <EditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function ChannelCard({
  row,
  onTest,
  onSync,
  onEdit,
  onRemove,
}: {
  row: ChannelDetail;
  onTest: () => void;
  onSync: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const meta = KIND_META[row.kind as Kind] ?? KIND_META.email;
  const status = row.state?.status ?? "disconnected";
  const StatusIcon = STATUS_META[status]?.icon ?? AlertCircle;
  const statusColor = STATUS_META[status]?.color ?? "#aaa";
  const statusLabel = STATUS_META[status]?.label ?? status;

  return (
    <div
      className="p-4 rounded-xl border flex items-center gap-4"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${meta.color}20`, color: meta.color }}
      >
        <meta.icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{row.displayName}</div>
        <div className="text-[11px] opacity-60 truncate">{row.identifier || "—"}</div>
        <div className="flex items-center gap-1 mt-1 text-[10px]" style={{ color: statusColor }}>
          <StatusIcon size={11} /> {statusLabel}
          {row.state?.lastError && (
            <span className="opacity-70 truncate"> · {row.state.lastError.slice(0, 80)}</span>
          )}
        </div>
      </div>

      {/* QR ao vivo p/ WhatsApp */}
      {status === "qr" && row.state?.qrDataUrl && (
        <div className="p-2 bg-white rounded-lg shrink-0">
          <img src={row.state.qrDataUrl} alt="QR" className="w-24 h-24" />
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0">
        <IconBtn onClick={onTest} title="Testar conexao">
          <TestTube2 size={14} />
        </IconBtn>
        <IconBtn onClick={onSync} title="Sync agora">
          <RefreshCcw size={14} />
        </IconBtn>
        <IconBtn onClick={onEdit} title="Editar credenciais">
          <Pencil size={14} />
        </IconBtn>
        <IconBtn onClick={onRemove} title="Remover canal" danger>
          <Trash2 size={14} />
        </IconBtn>
      </div>
    </div>
  );
}

const STATUS_META: Record<string, { label: string; icon: any; color: string }> = {
  disconnected: { label: "Desconectado", icon: AlertCircle, color: "#888" },
  connecting: { label: "Conectando...", icon: Loader2, color: "#0ea5e9" },
  qr: { label: "Aguardando QR scan", icon: QrCode, color: "#ff6a00" },
  connected: { label: "Conectado", icon: CheckCircle2, color: "#10b981" },
  error: { label: "Erro", icon: AlertCircle, color: "#ef4444" },
};

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${danger ? "text-red-500" : "opacity-70 hover:opacity-100"}`}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Modal de "Adicionar canal" — campos especificos por tipo.
// ============================================================================

function AddModal({
  kind,
  onClose,
  onCreated,
}: {
  kind: Kind;
  onClose: () => void;
  onCreated: () => void;
}) {
  const meta = KIND_META[kind];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialForm = useMemo(() => makeInitialForm(kind), [kind]);
  const [form, setForm] = useState<Record<string, string>>(initialForm);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = buildPayload(kind, form);
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao criar canal");
        return;
      }
      onCreated();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${meta.color}20`, color: meta.color }}
            >
              <meta.icon size={18} />
            </div>
            <div>
              <h2 className="font-semibold">Conectar {meta.name}</h2>
              <p className="text-[10px] opacity-60 uppercase tracking-wider">
                {kind === "whatsapp"
                  ? "Voce vai escanear um QR depois"
                  : kind === "email"
                    ? "Receber via IMAP + enviar via SMTP"
                    : "Webhook + Graph API Meta"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit} className="p-5 space-y-4">
          {renderFields(kind, form, setForm)}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-xs flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] text-black font-bold text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Salvando..." : `Conectar ${meta.name}`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Modal de "Editar canal" — mesmo formato do Add, mas faz PATCH e password vazia
// significa "manter atual" (merge no servidor).
// ============================================================================

function EditModal({
  row,
  onClose,
  onSaved,
}: {
  row: ChannelRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const kind = row.kind as Kind;
  const meta = KIND_META[kind];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(() => ({
    ...makeInitialForm(kind),
    displayName: row.displayName,
    identifier: row.identifier ?? "",
    user: row.identifier ?? "",
    pass: "", // sempre vazio — preenche se quiser trocar
  }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = buildPayload(kind, form);
      // PATCH so manda config se algum campo significativo foi tocado.
      // Strings vazias sao filtradas no servidor (merge).
      const res = await fetch(`/api/channels/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: payload.displayName,
          identifier: payload.identifier,
          config: payload.config,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Erro ${res.status}`);
        return;
      }
      onSaved();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${meta.color}20`, color: meta.color }}
            >
              <meta.icon size={18} />
            </div>
            <div>
              <h2 className="font-semibold">Editar {meta.name}</h2>
              <p className="text-[10px] opacity-60 uppercase tracking-wider">
                Deixe a senha em branco pra manter a atual
              </p>
            </div>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit} className="p-5 space-y-4">
          {renderFields(kind, form, setForm, /* isEdit */ true)}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-xs flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] text-black font-bold text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar alteracoes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function makeInitialForm(kind: Kind): Record<string, string> {
  if (kind === "email") {
    return {
      displayName: "",
      user: "",
      pass: "",
      imapHost: "outlook.office365.com",
      imapPort: "993",
      smtpHost: "smtp.office365.com",
      smtpPort: "587",
      fromName: "",
    };
  }
  if (kind === "whatsapp") {
    return { displayName: "WhatsApp Recrutamento" };
  }
  return {
    displayName: "@suaempresa",
    identifier: "",
    pageAccessToken: "",
    verifyToken: "",
  };
}

function buildPayload(kind: Kind, form: Record<string, string>): Record<string, unknown> {
  if (kind === "email") {
    const imapPort = parseInt(form.imapPort, 10) || 993;
    const smtpPort = parseInt(form.smtpPort, 10) || 587;
    return {
      kind,
      displayName: form.displayName || form.user,
      identifier: form.user,
      config: {
        imapHost: form.imapHost,
        imapPort,
        imapSecure: imapPort === 993,
        smtpHost: form.smtpHost,
        smtpPort,
        smtpSecure: smtpPort === 465,
        user: form.user,
        pass: form.pass,
        fromName: form.fromName,
      },
    };
  }
  if (kind === "whatsapp") {
    return {
      kind,
      displayName: form.displayName,
      identifier: null,
      config: {},
    };
  }
  // instagram
  return {
    kind,
    displayName: form.displayName,
    identifier: form.identifier, // IG user ID — pra lookup no webhook
    config: {
      igUserId: form.identifier,
      pageAccessToken: form.pageAccessToken,
      verifyToken: form.verifyToken,
    },
  };
}

function renderFields(
  kind: Kind,
  form: Record<string, string>,
  setForm: (f: Record<string, string>) => void,
  isEdit = false,
) {
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  if (kind === "email") {
    return (
      <>
        <Field label="Nome de exibicao" placeholder="ex: Carreiras GUEP" value={form.displayName} onChange={(v) => set("displayName", v)} />
        <Field label="Endereco completo" placeholder="rodrigo.sasso@guep.com.br" value={form.user} onChange={(v) => set("user", v)} type="email" required={!isEdit} />
        <Field label="Senha / App password" placeholder={isEdit ? "deixe em branco pra manter" : "••••••••••••"} value={form.pass} onChange={(v) => set("pass", v)} type="password" required={!isEdit} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="IMAP host" value={form.imapHost} onChange={(v) => set("imapHost", v)} />
          <Field label="IMAP porta" value={form.imapPort} onChange={(v) => set("imapPort", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SMTP host" value={form.smtpHost} onChange={(v) => set("smtpHost", v)} />
          <Field label="SMTP porta" value={form.smtpPort} onChange={(v) => set("smtpPort", v)} />
        </div>
        <Field label="Nome do remetente" placeholder="Rodrigo Sasso · GUEP" value={form.fromName} onChange={(v) => set("fromName", v)} />
        <p className="text-[11px] opacity-60">
          M365: precisa habilitar IMAP no admin center. Recomendado: App Password se conta tem MFA.
        </p>
      </>
    );
  }
  if (kind === "whatsapp") {
    return (
      <>
        <Field label="Nome do canal" placeholder="WhatsApp Recrutamento" value={form.displayName} onChange={(v) => set("displayName", v)} required />
        <div className="p-4 rounded-lg bg-[#25D366]/5 border border-[#25D366]/20 text-xs">
          <p className="mb-1 font-semibold text-[#25D366]">Como funciona</p>
          <p className="opacity-80">
            Vamos abrir uma sessao Baileys (WhatsApp Web). Depois de salvar, esta pagina mostra um QR
            em ate 30 segundos — escaneia com WhatsApp &gt; Configuracoes &gt; Aparelhos conectados.
            A sessao fica salva em <code>data/baileys/{`{channelId}`}</code> e persiste em restarts.
          </p>
        </div>
      </>
    );
  }
  // instagram
  return (
    <>
      <Field label="Nome de exibicao" placeholder="@guepoficial" value={form.displayName} onChange={(v) => set("displayName", v)} required />
      <Field label="IG User ID (numerico)" placeholder="17841401234567890" value={form.identifier} onChange={(v) => set("identifier", v)} required />
      <Field label="Page Access Token (Meta)" placeholder="EAA..." value={form.pageAccessToken} onChange={(v) => set("pageAccessToken", v)} type="password" required />
      <Field label="Verify Token (qualquer string secreta)" placeholder="kavuka-ig-2026" value={form.verifyToken} onChange={(v) => set("verifyToken", v)} required />
      <div className="p-4 rounded-lg bg-[#E1306C]/5 border border-[#E1306C]/20 text-xs">
        <p className="mb-1 font-semibold text-[#E1306C]">Setup no Meta Business</p>
        <ol className="opacity-80 space-y-0.5 list-decimal pl-4">
          <li>App business com produto Instagram Messaging</li>
          <li>Conta IG profissional vinculada a Page do FB</li>
          <li>Webhook callback URL: <code>{`{APP_BASE_URL}`}/api/channels/webhooks/instagram</code></li>
          <li>Use o verify token que voce digitou acima</li>
        </ol>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      />
    </div>
  );
}
