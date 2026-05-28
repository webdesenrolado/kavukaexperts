"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const inputCls =
  "w-full h-11 px-4 rounded-xl border border-kavuka-gray-200 bg-white text-sm text-kavuka-black placeholder:text-kavuka-gray-500 focus:outline-none focus:border-kavuka-black transition-colors";

export function LoginClient({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Falha ao entrar");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-kavuka-black mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="voce@email.com"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-kavuka-black mb-2">
          Senha
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Sua senha"
          className={inputCls}
        />
      </div>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-kavuka-black text-kavuka-yellow font-semibold text-sm hover:bg-zinc-900 transition-colors disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
        {!loading && <ArrowRight size={16} />}
      </button>
    </form>
  );
}
