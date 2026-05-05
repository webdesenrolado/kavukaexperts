"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";

export default function NovoCandidatoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    city: "",
    state: "",
    linkedinUrl: "",
    currentCompany: "",
    currentRole: "",
    source: "manual",
    consent: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.consent) {
      setError("Confirme o consentimento LGPD para continuar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/candidatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar candidato");
        return;
      }
      router.push(`/candidatos/${data.id}`);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-3xl">
        <Link href="/candidatos" className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4">
          <ArrowLeft size={14} /> Voltar
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Novo candidato</h1>
        <p className="opacity-70 mb-8">A ICH completa pode ser preenchida depois pelo próprio candidato.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Identificação">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome completo *" required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" />
              </Field>
              <Field label="Email *" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="input"
                />
              </Field>
              <Field label="Telefone">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+55 11 9 9999-9999"
                  className="input"
                />
              </Field>
              <Field label="CPF">
                <input
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="input"
                />
              </Field>
            </div>
          </Section>

          <Section title="Localização">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Cidade">
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
              </Field>
              <Field label="Estado (UF)">
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })}
                  maxLength={2}
                  className="input"
                />
              </Field>
            </div>
          </Section>

          <Section title="Contexto profissional">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Cargo atual">
                <input
                  value={form.currentRole}
                  onChange={(e) => setForm({ ...form, currentRole: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Empresa atual">
                <input
                  value={form.currentCompany}
                  onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="LinkedIn">
                <input
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="input"
                />
              </Field>
              <Field label="Origem">
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="input"
                >
                  <option value="manual">Manual</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="web">Site (link público)</option>
                  <option value="indicacao">Indicação</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="importado">Importação</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Consentimento LGPD">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-1"
              />
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#10b981]" />
                  <span className="font-medium">Confirmo que tenho consentimento explícito do candidato</span>
                </div>
                <p className="opacity-70 text-xs mt-1">
                  O candidato concordou com a coleta e tratamento de dados pessoais (LGPD art. 7º) e com a aplicação de
                  avaliações comportamentais. Os resultados são <strong>sinalizações</strong>, não diagnósticos clínicos,
                  e o candidato tem direito a revisão humana de qualquer decisão automatizada (LGPD art. 20).
                </p>
              </div>
            </label>
          </Section>

          {error && (
            <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/candidatos"
              className="px-4 py-2.5 rounded-lg border text-sm hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 disabled:opacity-50 shadow-lg shadow-[#ff6a00]/20"
            >
              <Save size={16} />
              {loading ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>

        <style jsx global>{`
          .input {
            width: 100%;
            padding: 0.625rem 0.75rem;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            font-size: 0.875rem;
            color: var(--foreground);
          }
          .input:focus {
            outline: none;
            border-color: #ff6a00;
            box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.15);
          }
        `}</style>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-5 rounded-xl border space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium opacity-70 mb-1.5">
        {label}
        {required && <span className="text-[#ff6a00]"> *</span>}
      </span>
      {children}
    </label>
  );
}
