"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CadastroClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    consentLgpd: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Falha no cadastro");
        return;
      }
      try {
        localStorage.setItem("kavuka_show_tour", "1");
      } catch {}
      router.push("/portal/me?welcome=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nome completo">
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
          className="w-full px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
          className="w-full px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        />
      </Field>
      <Field label="Telefone (com DDD)">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
          className="w-full px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        />
      </Field>
      <Field label="Senha (mín. 6 caracteres)">
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          autoComplete="new-password"
          className="w-full px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        />
      </Field>
      <label className="flex items-start gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          required
          checked={form.consentLgpd}
          onChange={(e) => set("consentLgpd", e.target.checked)}
          className="mt-0.5"
        />
        <span className="opacity-80">
          Li e concordo com os termos de consentimento para tratamento dos meus dados pessoais conforme
          a LGPD. Posso revogar este consentimento a qualquer momento.
        </span>
      </label>
      {error && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-bold text-black disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
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
