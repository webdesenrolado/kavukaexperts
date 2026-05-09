"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Copy, X } from "lucide-react";

type ExistingAdmin = { id: string; email: string; name: string };

export function CriarAdminBox({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [admins, setAdmins] = useState<ExistingAdmin[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [createdCreds, setCreatedCreds] = useState<{
    email: string;
    tempPassword: string | null;
  } | null>(null);

  async function loadAdmins() {
    setLoadingList(true);
    try {
      const r = await fetch(`/api/empresas-clientes/${companyId}/admins`);
      if (r.ok) {
        const j = await r.json();
        setAdmins(j.admins || []);
      }
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, [companyId]);

  return (
    <>
      <div
        className="rounded-xl border p-5 flex items-center justify-between gap-3"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-[#10b981]" />
            <h3 className="font-bold">Acesso da empresa</h3>
          </div>
          <p className="text-sm opacity-70 mt-1">
            Crie um usuário admin pra que <strong>{companyName}</strong> faça login e gerencie os
            próprios colaboradores e campanhas NR-1.
          </p>
          {!loadingList && admins.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {admins.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <ShieldCheck size={11} className="text-[#10b981]" />
                  {a.email}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-lg border text-sm font-semibold whitespace-nowrap hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: "var(--border)" }}
        >
          {admins.length === 0 ? "+ Criar admin" : "+ Adicionar admin"}
        </button>
      </div>

      {showModal && (
        <CreateModal
          companyId={companyId}
          onClose={() => setShowModal(false)}
          onCreated={(creds) => {
            setCreatedCreds(creds);
            setShowModal(false);
            loadAdmins();
          }}
        />
      )}

      {createdCreds && (
        <CredentialsModal
          email={createdCreds.email}
          tempPassword={createdCreds.tempPassword}
          onClose={() => setCreatedCreds(null)}
        />
      )}
    </>
  );
}

function CreateModal({
  companyId,
  onClose,
  onCreated,
}: {
  companyId: string;
  onClose: () => void;
  onCreated: (c: { email: string; tempPassword: string | null }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!name || !email) {
      setErr("Nome e email obrigatórios");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/empresas-clientes/${companyId}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          ...(usePassword && password ? { password } : {}),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Falha");
        return;
      }
      const j = await res.json();
      onCreated({ email: j.email, tempPassword: j.tempPassword });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Criar admin da empresa" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome do responsável *">
          <Inp value={name} onChange={setName} />
        </Field>
        <Field label="Email * (usado pra login)">
          <Inp value={email} onChange={(v) => setEmail(v.toLowerCase())} type="email" />
        </Field>
        <label className="flex items-start gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={usePassword}
            onChange={(e) => setUsePassword(e.target.checked)}
            className="mt-1"
          />
          <span>
            Definir senha manualmente
            <br />
            <span className="opacity-60 text-xs">
              (Se desmarcado, gera uma senha temporária — você anota e passa pro responsável)
            </span>
          </span>
        </label>
        {usePassword && (
          <Field label="Senha (mín. 6)">
            <Inp value={password} onChange={setPassword} type="password" />
          </Field>
        )}
        {err && (
          <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            {err}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="px-5 py-2 rounded-lg font-bold text-black disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            {busy ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CredentialsModal({
  email,
  tempPassword,
  onClose,
}: {
  email: string;
  tempPassword: string | null;
  onClose: () => void;
}) {
  function copy(v: string) {
    navigator.clipboard.writeText(v);
  }
  return (
    <Modal title="Admin criado com sucesso" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm opacity-80">
          Compartilhe estas credenciais com o responsável pelo RH da empresa. Recomendamos que ele
          troque a senha no primeiro login.
        </p>
        <div className="space-y-2">
          <KV label="Login" value={email} />
          {tempPassword ? (
            <KV label="Senha temporária" value={tempPassword} mono />
          ) : (
            <p className="text-xs opacity-70 italic">Senha definida manualmente.</p>
          )}
          <KV label="URL de login" value={`${typeof window !== "undefined" ? window.location.origin : ""}/login`} mono />
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-bold text-black"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function KV({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  function copy() {
    navigator.clipboard.writeText(value);
  }
  return (
    <div className="border rounded-lg p-3 flex items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider opacity-60">{label}</div>
        <div className={`text-sm truncate ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
      <button
        onClick={copy}
        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-xs flex items-center gap-1 shrink-0"
        title="Copiar"
      >
        <Copy size={11} />
      </button>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-5"
        style={{ borderColor: "var(--border)", background: "var(--background)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider opacity-70 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Inp({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm"
      style={{ borderColor: "var(--border)" }}
    />
  );
}
