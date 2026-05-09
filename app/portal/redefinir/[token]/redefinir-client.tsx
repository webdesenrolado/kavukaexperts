"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RedefinirClient({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não conferem");
      return;
    }
    if (password.length < 6) {
      setError("Senha precisa ter ao menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/portal/auth/redefinir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Falha ao redefinir senha");
        return;
      }
      router.push("/portal/me");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-wider opacity-70">Nova senha</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full mt-1 px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider opacity-70">Confirme</label>
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="w-full mt-1 px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        />
      </div>
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
        {loading ? "Redefinindo..." : "Redefinir senha"}
      </button>
    </form>
  );
}
