"use client";
import { useState } from "react";

export function RecuperarClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/portal/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        className="border rounded-lg p-5 text-sm"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="font-semibold mb-2">Verifique seu email</div>
        <p className="opacity-80 leading-relaxed">
          Se existe uma conta com o email <strong>{email}</strong>, enviamos um link para
          redefinir a senha. Confira a caixa de entrada e a pasta de spam. O link expira em 2 horas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-wider opacity-70">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full mt-1 px-3 py-2 rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)" }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-bold text-black disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
      >
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </button>
    </form>
  );
}
