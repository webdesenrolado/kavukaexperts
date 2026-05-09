"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NovaEmpresaClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    industry: "",
    size: "",
    city: "",
    state: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
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
      const res = await fetch("/api/empresas-clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Falha ao criar empresa");
        return;
      }
      const j = await res.json();
      router.push(`/empresas-clientes/${j.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 border rounded-xl p-6"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <Field label="Nome / Razão social *">
        <Input value={form.name} onChange={(v) => set("name", v)} required />
      </Field>
      <Row>
        <Field label="CNPJ">
          <Input
            value={form.cnpj}
            onChange={(v) => set("cnpj", v)}
            placeholder="00.000.000/0001-00"
          />
        </Field>
        <Field label="Setor">
          <Input value={form.industry} onChange={(v) => set("industry", v)} placeholder="ex: Logística" />
        </Field>
      </Row>
      <Row>
        <Field label="Tamanho">
          <Select
            value={form.size}
            onChange={(v) => set("size", v)}
            options={[
              { value: "", label: "Não informar" },
              { value: "small", label: "Pequena (até 49)" },
              { value: "medium", label: "Média (50-249)" },
              { value: "large", label: "Grande (250+)" },
            ]}
          />
        </Field>
        <Field label="Cidade / UF">
          <div className="flex gap-2">
            <Input value={form.city} onChange={(v) => set("city", v)} placeholder="Cidade" />
            <input
              value={form.state}
              onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))}
              placeholder="UF"
              className="w-16 px-3 py-2 rounded-lg border bg-transparent text-sm"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
        </Field>
      </Row>
      <h3 className="text-sm font-bold uppercase tracking-wider opacity-70 pt-2">Contato no RH</h3>
      <Field label="Nome">
        <Input value={form.contactName} onChange={(v) => set("contactName", v)} />
      </Field>
      <Row>
        <Field label="Email">
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(v) => set("contactEmail", v)}
          />
        </Field>
        <Field label="Telefone">
          <Input value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
        </Field>
      </Row>
      <Field label="Notas internas">
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm resize-y"
          style={{ borderColor: "var(--border)" }}
        />
      </Field>
      {error && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg font-bold text-black disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          {loading ? "Salvando..." : "Cadastrar empresa"}
        </button>
      </div>
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
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}
function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm"
      style={{ borderColor: "var(--border)" }}
    />
  );
}
function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "var(--background)" }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
