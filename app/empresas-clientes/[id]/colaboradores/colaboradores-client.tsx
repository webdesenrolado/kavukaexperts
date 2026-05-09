"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Upload, Trash2, Mail, Phone, Edit2, Check, X } from "lucide-react";

type Employee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  role: string | null;
  department: string | null;
  active: boolean | null;
};

export function ColaboradoresClient({
  companyId,
  initial,
}: {
  companyId: string;
  initial: Employee[];
}) {
  const [list, setList] = useState<Employee[]>(initial);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.role?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
    );
  }, [list, search]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const e of list) if (e.department) set.add(e.department);
    return Array.from(set).sort();
  }, [list]);

  return (
    <div>
      {/* Toolbar */}
      <div
        className="border rounded-xl p-3 mb-4 flex items-center gap-2 flex-wrap"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email, cargo, depto..."
            className="w-full pl-9 pr-3 py-2 rounded-md border bg-transparent text-sm"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="px-3 py-2 rounded-md border text-sm flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: "var(--border)" }}
        >
          <Upload size={13} />
          Importar CSV
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-2 rounded-md font-bold text-black text-sm flex items-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          <Plus size={13} />
          Novo
        </button>
      </div>

      {/* Stats por departamento */}
      {departments.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          {departments.map((d) => {
            const n = list.filter((e) => e.department === d).length;
            return (
              <span
                key={d}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border"
                style={{ borderColor: "var(--border)" }}
              >
                {d} <strong>{n}</strong>
              </span>
            );
          })}
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div
          className="border rounded-xl p-12 text-center"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <p className="text-sm opacity-60">
            {list.length === 0
              ? "Nenhum colaborador cadastrado. Clique em 'Importar CSV' ou 'Novo'."
              : "Nenhum resultado pra essa busca."}
          </p>
        </div>
      ) : (
        <div
          className="border rounded-xl overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <table className="w-full text-sm">
            <thead style={{ background: "rgba(255,255,255,0.03)" }}>
              <tr className="text-left text-[10px] uppercase tracking-wider opacity-60">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3 hidden md:table-cell">Cargo</th>
                <th className="px-4 py-3 hidden md:table-cell">Departamento</th>
                <th className="px-4 py-3 hidden lg:table-cell">Contato</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <Row
                  key={e.id}
                  employee={e}
                  companyId={companyId}
                  onUpdate={(upd) =>
                    setList(list.map((x) => (x.id === upd.id ? { ...x, ...upd } : x)))
                  }
                  onRemove={() => setList(list.filter((x) => x.id !== e.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddModal
          companyId={companyId}
          onClose={() => setShowAdd(false)}
          onAdded={(emp) => {
            setList([emp, ...list]);
            setShowAdd(false);
          }}
        />
      )}

      {showImport && (
        <ImportModal
          companyId={companyId}
          onClose={() => setShowImport(false)}
          onImported={(newList) => {
            setList([...newList, ...list]);
            setShowImport(false);
          }}
        />
      )}
    </div>
  );
}

function Row({
  employee,
  companyId,
  onUpdate,
  onRemove,
}: {
  employee: Employee;
  companyId: string;
  onUpdate: (e: Partial<Employee> & { id: string }) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(employee);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/empresas-clientes/${companyId}/employees/${employee.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        onUpdate(form);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Remover ${employee.name}?`)) return;
    const res = await fetch(
      `/api/empresas-clientes/${companyId}/employees/${employee.id}`,
      { method: "DELETE" }
    );
    if (res.ok) onRemove();
  }

  if (editing) {
    return (
      <tr className="border-t" style={{ borderColor: "var(--border)" }}>
        <td className="px-2 py-2">
          <Inp value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        </td>
        <td className="px-2 py-2 hidden md:table-cell">
          <Inp value={form.role ?? ""} onChange={(v) => setForm({ ...form, role: v })} />
        </td>
        <td className="px-2 py-2 hidden md:table-cell">
          <Inp value={form.department ?? ""} onChange={(v) => setForm({ ...form, department: v })} />
        </td>
        <td className="px-2 py-2 hidden lg:table-cell">
          <div className="flex flex-col gap-1">
            <Inp value={form.email ?? ""} onChange={(v) => setForm({ ...form, email: v })} placeholder="email" />
            <Inp value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} placeholder="telefone" />
          </div>
        </td>
        <td className="px-2 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={save}
              disabled={saving}
              className="w-7 h-7 rounded-md bg-[#10b981] text-white flex items-center justify-center disabled:opacity-50"
            >
              <Check size={13} />
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setForm(employee);
              }}
              className="w-7 h-7 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center"
            >
              <X size={13} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
      <td className="px-4 py-3">
        <div className="font-medium">{employee.name}</div>
        {employee.cpf && <div className="text-[10px] font-mono opacity-50">{employee.cpf}</div>}
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-sm opacity-80">
        {employee.role || "—"}
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-sm opacity-80">
        {employee.department || "—"}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="text-xs space-y-0.5">
          {employee.email && (
            <div className="inline-flex items-center gap-1 opacity-70">
              <Mail size={10} /> {employee.email}
            </div>
          )}
          {employee.phone && (
            <div className="inline-flex items-center gap-1 opacity-70">
              <Phone size={10} /> {employee.phone}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="w-7 h-7 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center opacity-60 hover:opacity-100"
            title="Editar"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={remove}
            className="w-7 h-7 rounded-md hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center opacity-60"
            title="Remover"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Inp({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1 rounded border bg-transparent text-xs"
      style={{ borderColor: "var(--border)" }}
    />
  );
}

function AddModal({
  companyId,
  onClose,
  onAdded,
}: {
  companyId: string;
  onClose: () => void;
  onAdded: (e: Employee) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    role: "",
    department: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!form.name) {
      setErr("Nome é obrigatório");
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/empresas-clientes/${companyId}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Falha");
        return;
      }
      const j = await res.json();
      onAdded({
        id: j.id,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        cpf: form.cpf || null,
        role: form.role || null,
        department: form.department || null,
        active: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Novo colaborador" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nome *">
          <Inp2 value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        </Field>
        <Row2>
          <Field label="Email">
            <Inp2
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              type="email"
            />
          </Field>
          <Field label="Telefone">
            <Inp2 value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </Field>
        </Row2>
        <Row2>
          <Field label="Cargo">
            <Inp2 value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
          </Field>
          <Field label="Departamento">
            <Inp2
              value={form.department}
              onChange={(v) => setForm({ ...form, department: v })}
            />
          </Field>
        </Row2>
        <Field label="CPF">
          <Inp2 value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} />
        </Field>
        {err && (
          <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            {err}
          </div>
        )}
        <div className="flex justify-end pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-lg font-bold text-black disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            {saving ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ImportModal({
  companyId,
  onClose,
  onImported,
}: {
  companyId: string;
  onClose: () => void;
  onImported: (list: Employee[]) => void;
}) {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    inserted: number;
    skipped: number;
    errors: number;
    total: number;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    if (!csv.trim()) {
      setErr("Cole o CSV no campo");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/empresas-clientes/${companyId}/employees/import-csv`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv }),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Falha");
        return;
      }
      const j = await res.json();
      setResult(j);
      // recarrega lista (em vez de calcular delta) — força refresh full
      const r2 = await fetch(`/api/empresas-clientes/${companyId}/employees`);
      const j2 = await r2.json();
      onImported(j2.employees || []);
    } finally {
      setBusy(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsv(String(ev.target?.result || ""));
    reader.readAsText(f);
  }

  return (
    <Modal title="Importar colaboradores via CSV" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-xs opacity-70">
          Formato esperado (1ª linha = cabeçalho, separador vírgula ou ponto-e-vírgula):
          <br />
          <code className="font-mono mt-1 inline-block opacity-80">
            nome,email,telefone,cargo,departamento,cpf
          </code>
          <br />
          Apenas <strong>nome</strong> é obrigatório. Emails duplicados são ignorados.
        </div>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          className="block text-xs"
        />
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          placeholder="nome,email,telefone,cargo,departamento&#10;João Silva,joao@empresa.com,11988887777,Analista,TI&#10;Maria Souza,maria@empresa.com,11999998888,Gerente,Vendas"
          className="w-full px-3 py-2 rounded-lg border bg-transparent text-xs font-mono"
          style={{ borderColor: "var(--border)" }}
        />
        {err && (
          <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            {err}
          </div>
        )}
        {result && (
          <div className="text-sm bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-3">
            <strong className="text-[#10b981]">{result.inserted} inseridos</strong>
            {result.skipped > 0 && <span className="opacity-70"> · {result.skipped} duplicados</span>}
            {result.errors > 0 && <span className="opacity-70"> · {result.errors} erros</span>}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            Fechar
          </button>
          <button
            onClick={send}
            disabled={busy || !csv.trim()}
            className="px-5 py-2 rounded-lg font-bold text-black disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            {busy ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </Modal>
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
function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}
function Inp2({
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-5"
        style={{ borderColor: "var(--border)", background: "var(--background)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 text-xl">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
