"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Select } from "@/components/select";

const ASSESSMENTS = [
  { slug: "ipip-neo-120", name: "IPIP-NEO-120 (120 itens, 30 facetas)", layer: "Camada 1 — Base", recommended: true, available: true },
  { slug: "bigfive-short", name: "Big Five curto (IPIP-50)", layer: "Camada 1 — Base", recommended: false, available: false },
  { slug: "mbti-like", name: "MBTI-like (16 letras estilo Jung)", layer: "Camada 1 — Base", recommended: false, available: false },
  { slug: "disc-adapt", name: "DISC adaptado", layer: "Camada 2 — Comportamento", recommended: true, available: false },
  { slug: "label-guep", name: "Label GUÉP", layer: "Camada 2 — Comportamento", recommended: false, available: false },
  { slug: "gallup-adapt", name: "Gallup adaptado", layer: "Camada 3 — Performance", recommended: false, available: false },
  { slug: "dark-triad", name: "Dark Triad (SD3)", layer: "Camada 4 — Risco", recommended: false, available: false },
  { slug: "hogan-adapt", name: "Hogan HDS adaptado", layer: "Camada 4 — Risco", recommended: false, available: false },
  { slug: "arquetipos", name: "Arquétipos (Jung)", layer: "Camada 5 — Identidade", recommended: false, available: false },
  { slug: "eneagrama", name: "Eneagrama", layer: "Camada 5 — Identidade", recommended: false, available: false },
];

export default function NovaVagaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    remote: "on_site",
    employmentType: "clt",
    seniority: "pleno",
    salaryMin: "",
    salaryMax: "",
    assessments: ["ipip-neo-120"],
  });

  function toggleAssessment(slug: string) {
    setForm((f) =>
      f.assessments.includes(slug)
        ? { ...f, assessments: f.assessments.filter((s) => s !== slug) }
        : { ...f, assessments: [...f.assessments, slug] }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vagas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar vaga");
        return;
      }
      router.push(`/vagas/${data.id}`);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-3xl">
        <Link
          href="/vagas"
          className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={14} /> Voltar para vagas
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Nova vaga</h1>
        <p className="opacity-70 mb-8">Defina os fundamentos. Você poderá refinar o perfil ideal e o pipeline depois.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Sobre a vaga">
            <Field label="Título *" required>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="ex: Atendente de loja — turno tarde"
                className="input"
              />
            </Field>
            <Field label="Descrição">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                placeholder="Responsabilidades, requisitos, contexto da posição..."
                className="input resize-y"
              />
            </Field>
          </Section>

          <Section title="Localização e formato">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Cidade/UF">
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="ex: São Paulo/SP"
                  className="input"
                />
              </Field>
              <Field label="Modalidade">
                <Select
                  value={form.remote}
                  onChange={(v) => setForm({ ...form, remote: v })}
                  options={[
                    { value: "on_site", label: "Presencial" },
                    { value: "hybrid", label: "Híbrido" },
                    { value: "remote", label: "100% remoto" },
                  ]}
                />
              </Field>
            </div>
          </Section>

          <Section title="Detalhes contratuais">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Vínculo">
                <Select
                  value={form.employmentType}
                  onChange={(v) => setForm({ ...form, employmentType: v })}
                  options={[
                    { value: "clt", label: "CLT" },
                    { value: "pj", label: "PJ" },
                    { value: "freelance", label: "Freelance" },
                    { value: "internship", label: "Estágio" },
                  ]}
                />
              </Field>
              <Field label="Senioridade">
                <Select
                  value={form.seniority}
                  onChange={(v) => setForm({ ...form, seniority: v })}
                  options={[
                    { value: "junior", label: "Júnior" },
                    { value: "pleno", label: "Pleno" },
                    { value: "senior", label: "Sênior" },
                    { value: "especialista", label: "Especialista" },
                    { value: "lideranca", label: "Liderança" },
                  ]}
                />
              </Field>
              <Field label="Faixa salarial (R$)">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                    placeholder="mín"
                    className="input"
                  />
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                    placeholder="máx"
                    className="input"
                  />
                </div>
              </Field>
            </div>
          </Section>

          <Section
            title="Avaliações comportamentais"
            subtitle="Selecione os microsserviços que serão aplicados aos candidatos. Você pode mudar depois."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ASSESSMENTS.map((a) => {
                const checked = form.assessments.includes(a.slug);
                return (
                  <label
                    key={a.slug}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      checked ? "border-[#ff6a00] bg-[#ff6a00]/5" : ""
                    } ${!a.available ? "opacity-50" : ""}`}
                    style={{ borderColor: checked ? "#ff6a00" : "var(--border)" }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!a.available}
                      onChange={() => toggleAssessment(a.slug)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{a.name}</span>
                        {a.recommended && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#ff6a00]/10 text-[#ff6a00] font-bold">
                            Recomendado
                          </span>
                        )}
                        {!a.available && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-500 font-bold">
                            Em breve
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] opacity-60">{a.layer}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Section>

          {error && (
            <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/vagas"
              className="px-4 py-2.5 rounded-lg border text-sm hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !form.title}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ff6a00]/20"
            >
              <Save size={16} />
              {loading ? "Salvando..." : "Criar vaga"}
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
            transition: all 0.15s;
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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="p-5 rounded-xl border space-y-4"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <header>
        <h2 className="font-semibold">{title}</h2>
        {subtitle && <p className="text-xs opacity-60 mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
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
