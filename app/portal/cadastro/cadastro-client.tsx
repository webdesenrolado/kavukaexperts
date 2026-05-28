"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const inputCls =
  "w-full h-11 px-4 rounded-xl border border-kavuka-gray-200 bg-white text-sm text-kavuka-black placeholder:text-kavuka-gray-500 focus:outline-none focus:border-kavuka-black transition-colors";

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
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Nome completo" required>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
          placeholder="Seu nome"
          className={inputCls}
        />
      </Field>
      <Field label="Email" required>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
          placeholder="voce@email.com"
          className={inputCls}
        />
      </Field>
      <Field label="Telefone (com DDD)">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
          placeholder="(11) 90000-0000"
          className={inputCls}
        />
      </Field>
      <Field label="Senha" required hint="mín. 6 caracteres">
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          autoComplete="new-password"
          placeholder="Crie uma senha"
          className={inputCls}
        />
      </Field>
      <label className="flex items-start gap-3 text-sm text-kavuka-gray-700 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={form.consentLgpd}
          onChange={(e) => set("consentLgpd", e.target.checked)}
          className="mt-1 w-4 h-4 accent-kavuka-black"
        />
        <span>
          Li e concordo com os termos de tratamento dos meus dados pela
          Kavuka, conforme a LGPD.
        </span>
      </label>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !form.consentLgpd}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-kavuka-black text-kavuka-yellow font-semibold text-sm hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Criando conta..." : "Criar conta"}
        {!loading && <ArrowRight size={16} />}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="block text-sm font-medium text-kavuka-black">
          {label}
          {required && <span className="text-kavuka-yellow ml-1">*</span>}
        </label>
        {hint && <span className="text-xs text-kavuka-gray-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
