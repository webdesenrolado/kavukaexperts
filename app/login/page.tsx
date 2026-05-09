"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao fazer login");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      // company_admin sempre vai pra /empresa, mesmo que tenha vindo de outro from
      const dest = data.role === "company_admin" ? "/empresa" : from || "/";
      window.location.href = dest;
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#0a0a0b" }}
    >
      {/* Background image — mosaico de pessoas com opacidade */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/brand/login-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.22,
          filter: "saturate(0.85)",
        }}
      />
      {/* Overlay escuro + gradientes de cor pra manter o contraste com o card */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(255,106,0,0.20), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,204,0,0.12), transparent 60%), linear-gradient(180deg, rgba(10,10,11,0.55), rgba(10,10,11,0.85))",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-7">
            <img
              src="/brand/logo-kavuka-experts.png"
              alt="Kavuka Experts"
              className="h-28 w-auto"
              draggable={false}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-900/80 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40 focus:border-[#ff6a00]/50"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-900/80 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/40 focus:border-[#ff6a00]/50"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-bold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[#ff6a00]/20"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-600 mt-6">ATS proprietário Kavuka · GUÉP</p>
        </div>
      </div>
    </div>
  );
}
