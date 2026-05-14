"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/select";

type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  phoneAlt: string | null;
  cpf: string | null;
  rg: string | null;
  birthDate: string | null;
  age: number | null;
  gender: string | null;
  maritalStatus: string | null;
  nationality: string | null;
  cep: string | null;
  address: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  summary: string | null;
  currentCompany: string | null;
  currentRole: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  expectedSalary: number | null;
  resumeUrl: string | null;
};

type Experience = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  employmentType: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean | null;
  description: string | null;
  achievements: string | null;
  sortOrder: number | null;
};

type Education = {
  id: string;
  institution: string;
  course: string | null;
  level: string | null;
  status: string | null;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
  sortOrder: number | null;
};

type Skill = {
  id: string;
  skill: string;
  level: string | null;
  category: string | null;
  yearsOfUse: number | null;
};

type Language = {
  id: string;
  language: string;
  level: string | null;
  certification: string | null;
};

type Tab = "perfil" | "experiencia" | "formacao" | "skills" | "idiomas" | "avaliacoes";

const TABS: { key: Tab; label: string }[] = [
  { key: "perfil", label: "Perfil" },
  { key: "experiencia", label: "Experiência" },
  { key: "formacao", label: "Formação" },
  { key: "skills", label: "Skills" },
  { key: "idiomas", label: "Idiomas" },
  { key: "avaliacoes", label: "Avaliações" },
];

type AssessmentSummary = {
  id: string;
  instrument: string;
  status: string;
  completedAt: string | Date | null;
};

export function MeClient(props: {
  initialCandidate: Candidate;
  initialExperiences: Experience[];
  initialEducations: Education[];
  initialSkills: Skill[];
  initialLanguages: Language[];
  initialAssessments?: AssessmentSummary[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("perfil");
  const [candidate, setCandidate] = useState<Candidate>(props.initialCandidate);
  const [experiences, setExperiences] = useState<Experience[]>(props.initialExperiences);
  const [educations, setEducations] = useState<Education[]>(props.initialEducations);
  const [skills, setSkills] = useState<Skill[]>(props.initialSkills);
  const [languages, setLanguages] = useState<Language[]>(props.initialLanguages);
  const assessments = props.initialAssessments || [];

  const completeness = computeCompleteness({ candidate, experiences, educations, skills, languages });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero / completude */}
      <div
        className="rounded-2xl border p-5 mb-5"
        style={{
          borderColor: "var(--border)",
          background: "linear-gradient(135deg, rgba(255,106,0,0.08), rgba(255,204,0,0.02))",
        }}
      >
        <h1 className="text-2xl font-bold">Olá, {candidate.name?.split(" ")[0]} 👋</h1>
        <p className="text-sm opacity-80 mt-1">
          Quanto mais completo seu perfil, mais relevante você fica para vagas alinhadas ao seu objetivo.
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="opacity-70">Currículo {completeness}% completo</span>
            <span className="opacity-50">{completeness < 70 ? "continue preenchendo" : "ótimo perfil!"}</span>
          </div>
          <div className="h-2 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${completeness}%`,
                background: "linear-gradient(90deg, #ff6a00, #ffcc00)",
              }}
            />
          </div>
        </div>
        <a
          href="/portal/me/apostila"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: "var(--border)" }}
        >
          📄 Ver minha apostila ICH
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-5 overflow-x-auto" style={{ borderColor: "var(--border)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? "border-[#ff6a00]" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "perfil" && (
        <PerfilTab
          candidate={candidate}
          onSave={(c) => setCandidate({ ...candidate, ...c })}
          onLogout={async () => {
            await fetch("/api/portal/auth/logout", { method: "POST" });
            router.push("/portal/login");
          }}
        />
      )}
      {tab === "experiencia" && (
        <ExperienceTab items={experiences} setItems={setExperiences} />
      )}
      {tab === "formacao" && <EducationTab items={educations} setItems={setEducations} />}
      {tab === "skills" && <SkillsTab items={skills} setItems={setSkills} />}
      {tab === "idiomas" && <LanguagesTab items={languages} setItems={setLanguages} />}
      {tab === "avaliacoes" && <AvaliacoesTab assessments={assessments} />}
    </div>
  );
}

// ========= AVALIAÇÕES =========
function AvaliacoesTab({ assessments }: { assessments: AssessmentSummary[] }) {
  const INSTRUMENTOS: Array<{
    slug: string;
    name: string;
    short: string;
    duration: string;
    items: string;
    color: string;
    gradient: string;
  }> = [
    {
      slug: "label-adapted",
      name: "LABEL · perfil por adjetivos",
      short: "Você avalia 120 adjetivos. Gera radar de 13 dimensões + Big Five.",
      duration: "15-20 min",
      items: "120 adjetivos",
      color: "#ff6a00",
      gradient: "linear-gradient(135deg,#ff6a00,#ffcc00)",
    },
    {
      slug: "disc-adapted",
      name: "DISC · perfil comportamental",
      short: "Define seu perfil em D/I/S/C e arquétipo profissional (Executor/Estrategista/Operador/Influenciador).",
      duration: "10-15 min",
      items: "24 blocos",
      color: "#0ea5e9",
      gradient: "linear-gradient(135deg,#0ea5e9,#06b6d4)",
    },
    {
      slug: "arquetipos",
      name: "Arquétipos · 12 tipos jungianos",
      short: "Mapeia seu arquétipo dominante: Herói, Sábio, Criador, Cuidador, Explorador, Rebelde e outros.",
      duration: "5-10 min",
      items: "36 afirmações",
      color: "#a855f7",
      gradient: "linear-gradient(135deg,#a855f7,#ec4899)",
    },
    {
      slug: "ipip-neo-120",
      name: "IPIP-NEO · Big Five completo",
      short: "120 afirmações que mapeiam 5 grandes traços e 30 facetas de personalidade.",
      duration: "20-25 min",
      items: "120 afirmações",
      color: "#10b981",
      gradient: "linear-gradient(135deg,#10b981,#84cc16)",
    },
  ];

  const concluidos = new Set(
    assessments.filter((a) => a.status === "completed").map((a) => a.instrument)
  );
  const total = INSTRUMENTOS.length;
  const done = INSTRUMENTOS.filter((i) => concluidos.has(i.slug)).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="space-y-5">
      {/* Banner motivador */}
      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: "var(--border)",
          background: "linear-gradient(135deg, rgba(255,106,0,0.08), rgba(168,85,247,0.04))",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg mb-1">
              Quanto mais avaliações, mais robusta sua KYID
            </h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Cada instrumento mede uma dimensão diferente de quem você é. Combinados,
              eles geram seu <strong>Índice Comportamental</strong> e alimentam sua{" "}
              <strong className="text-[#ff6a00]">Apostila ICH</strong> com profundidade
              real. Você pode refazer a qualquer momento.
            </p>
          </div>
          <div className="text-center shrink-0">
            <div className="text-4xl font-bold" style={{ color: pct >= 75 ? "#10b981" : "#ff6a00" }}>
              {done}<span className="text-base opacity-60">/{total}</span>
            </div>
            <div className="text-[10px] opacity-60 uppercase tracking-wider mt-0.5">
              concluídas
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #ff6a00, #a855f7)",
            }}
          />
        </div>
      </div>

      {/* Cards dos instrumentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INSTRUMENTOS.map((i) => {
          const concluido = concluidos.has(i.slug);
          const completedAt = assessments.find(
            (a) => a.instrument === i.slug && a.status === "completed"
          )?.completedAt;

          return (
            <div
              key={i.slug}
              className="rounded-xl border p-4 flex flex-col"
              style={{
                borderColor: concluido ? `${i.color}55` : "var(--border)",
                background: concluido
                  ? `linear-gradient(135deg, ${i.color}10, transparent)`
                  : "var(--card)",
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm flex-1">{i.name}</h3>
                {concluido && (
                  <span
                    className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shrink-0 text-white"
                    style={{ background: i.color }}
                  >
                    ✓ feito
                  </span>
                )}
              </div>
              <p className="text-xs opacity-75 leading-relaxed mb-3 flex-1">{i.short}</p>
              <div className="flex items-center justify-between gap-2 text-[10px] opacity-60 mb-3">
                <span>{i.items}</span>
                <span>{i.duration}</span>
              </div>
              <a
                href={`/portal/me/avaliar/${i.slug}`}
                className="block w-full text-center py-2.5 rounded-lg font-bold text-sm text-black"
                style={{ background: i.gradient }}
              >
                {concluido ? "Refazer" : "Fazer agora"}
              </a>
              {completedAt && (
                <div className="text-[9px] opacity-50 text-center mt-1.5">
                  Última: {new Date(completedAt).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA pra apostila */}
      <div
        className="rounded-xl border p-4 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div>
          <div className="font-semibold text-sm">Sua Apostila ICH</div>
          <div className="text-xs opacity-70 mt-0.5">
            {done === 0
              ? "Faça pelo menos 1 avaliação pra começar a alimentar sua KYID."
              : `Já temos ${done} avaliação${done === 1 ? "" : "es"} integrada${done === 1 ? "" : "s"} na sua Apostila.`}
          </div>
        </div>
        <a
          href="/portal/me/apostila"
          className="px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5"
          style={{ borderColor: "var(--border)" }}
        >
          📄 Abrir minha Apostila
        </a>
      </div>
    </div>
  );
}

function computeCompleteness(d: {
  candidate: Candidate;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
}) {
  let pts = 0, total = 0;
  const c = d.candidate;
  const fields = [
    c.name, c.email, c.phone, c.cpf, c.birthDate, c.cep,
    c.address, c.city, c.state, c.summary, c.linkedinUrl,
  ];
  for (const f of fields) {
    total++;
    if (f) pts++;
  }
  total += 4;
  if (d.experiences.length > 0) pts++;
  if (d.educations.length > 0) pts++;
  if (d.skills.length > 0) pts++;
  if (d.languages.length > 0) pts++;
  return Math.round((pts / total) * 100);
}

// ========= PERFIL =========
function PerfilTab({
  candidate,
  onSave,
  onLogout,
}: {
  candidate: Candidate;
  onSave: (c: Partial<Candidate>) => void;
  onLogout: () => void;
}) {
  const [form, setForm] = useState(candidate);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function set<K extends keyof Candidate>(k: K, v: Candidate[K]) {
    setForm({ ...form, [k]: v });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onSave(form);
        setSavedAt(new Date());
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <FormSection title="Dados pessoais">
        <FieldRow>
          <Field label="Nome completo">
            <Input value={form.name ?? ""} onChange={(v) => set("name", v)} />
          </Field>
          <Field label="Email">
            <Input value={form.email ?? ""} disabled />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Telefone">
            <Input value={form.phone ?? ""} onChange={(v) => set("phone", v)} />
          </Field>
          <Field label="Telefone alternativo">
            <Input value={form.phoneAlt ?? ""} onChange={(v) => set("phoneAlt", v)} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="CPF">
            <Input value={form.cpf ?? ""} onChange={(v) => set("cpf", v)} placeholder="000.000.000-00" />
          </Field>
          <Field label="RG">
            <Input value={form.rg ?? ""} onChange={(v) => set("rg", v)} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Data de nascimento">
            <Input type="date" value={form.birthDate ?? ""} onChange={(v) => set("birthDate", v)} />
          </Field>
          <Field label="Idade">
            <Input
              type="number"
              value={form.age?.toString() ?? ""}
              onChange={(v) => set("age", v ? parseInt(v) : null)}
            />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Gênero">
            <Select
              value={form.gender ?? ""}
              onChange={(v) => set("gender", v)}
              options={[
                { value: "", label: "Não informar" },
                { value: "feminino", label: "Feminino" },
                { value: "masculino", label: "Masculino" },
                { value: "nao-binario", label: "Não-binário" },
                { value: "outro", label: "Outro" },
              ]}
            />
          </Field>
          <Field label="Estado civil">
            <Select
              value={form.maritalStatus ?? ""}
              onChange={(v) => set("maritalStatus", v)}
              options={[
                { value: "", label: "Não informar" },
                { value: "solteiro", label: "Solteiro(a)" },
                { value: "casado", label: "Casado(a)" },
                { value: "uniao-estavel", label: "União estável" },
                { value: "divorciado", label: "Divorciado(a)" },
                { value: "viuvo", label: "Viúvo(a)" },
              ]}
            />
          </Field>
        </FieldRow>
        <Field label="Nacionalidade">
          <Input value={form.nationality ?? ""} onChange={(v) => set("nationality", v)} placeholder="Brasileira" />
        </Field>
      </FormSection>

      <FormSection title="Endereço">
        <FieldRow>
          <Field label="CEP" small>
            <Input value={form.cep ?? ""} onChange={(v) => set("cep", v)} placeholder="00000-000" />
          </Field>
          <Field label="Estado (UF)" small>
            <Input value={form.state ?? ""} onChange={(v) => set("state", v.toUpperCase().slice(0, 2))} />
          </Field>
          <Field label="Cidade">
            <Input value={form.city ?? ""} onChange={(v) => set("city", v)} />
          </Field>
        </FieldRow>
        <Field label="Logradouro">
          <Input value={form.address ?? ""} onChange={(v) => set("address", v)} placeholder="Rua, avenida..." />
        </Field>
        <FieldRow>
          <Field label="Número" small>
            <Input value={form.addressNumber ?? ""} onChange={(v) => set("addressNumber", v)} />
          </Field>
          <Field label="Complemento">
            <Input value={form.addressComplement ?? ""} onChange={(v) => set("addressComplement", v)} />
          </Field>
          <Field label="Bairro">
            <Input value={form.neighborhood ?? ""} onChange={(v) => set("neighborhood", v)} />
          </Field>
        </FieldRow>
      </FormSection>

      <FormSection title="Resumo profissional">
        <Field label="Conte um pouco sobre você (até 500 caracteres)">
          <Textarea
            value={form.summary ?? ""}
            onChange={(v) => set("summary", v.slice(0, 500))}
            rows={4}
            placeholder="Profissional com X anos de experiência em..."
          />
          <div className="text-[10px] opacity-50 mt-1 text-right">
            {(form.summary?.length ?? 0)}/500
          </div>
        </Field>
        <FieldRow>
          <Field label="Cargo atual">
            <Input value={form.currentRole ?? ""} onChange={(v) => set("currentRole", v)} />
          </Field>
          <Field label="Empresa atual">
            <Input value={form.currentCompany ?? ""} onChange={(v) => set("currentCompany", v)} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Anos de experiência" small>
            <Input
              type="number"
              value={form.yearsExperience?.toString() ?? ""}
              onChange={(v) => set("yearsExperience", v ? parseInt(v) : null)}
            />
          </Field>
          <Field label="Pretensão salarial (R$)">
            <Input
              type="number"
              value={form.expectedSalary?.toString() ?? ""}
              onChange={(v) => set("expectedSalary", v ? parseInt(v) : null)}
            />
          </Field>
          <Field label="Escolaridade">
            <Select
              value={form.educationLevel ?? ""}
              onChange={(v) => set("educationLevel", v)}
              options={[
                { value: "", label: "Não informar" },
                { value: "medio", label: "Ensino médio" },
                { value: "tecnico", label: "Técnico" },
                { value: "superior_incompleto", label: "Superior incompleto" },
                { value: "superior", label: "Superior completo" },
                { value: "pos", label: "Pós-graduação" },
                { value: "mestrado", label: "Mestrado" },
                { value: "doutorado", label: "Doutorado" },
              ]}
            />
          </Field>
        </FieldRow>
      </FormSection>

      <FormSection title="Links">
        <Field label="LinkedIn">
          <Input
            value={form.linkedinUrl ?? ""}
            onChange={(v) => set("linkedinUrl", v)}
            placeholder="https://linkedin.com/in/seu-usuario"
          />
        </Field>
        <Field label="GitHub">
          <Input
            value={form.githubUrl ?? ""}
            onChange={(v) => set("githubUrl", v)}
            placeholder="https://github.com/seu-usuario"
          />
        </Field>
        <Field label="Portfolio / site">
          <Input
            value={form.portfolioUrl ?? ""}
            onChange={(v) => set("portfolioUrl", v)}
            placeholder="https://seusite.com"
          />
        </Field>
      </FormSection>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="text-xs opacity-60 hover:opacity-100 underline"
        >
          Sair da conta
        </button>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs opacity-60">
              Salvo às {savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg font-bold text-black disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========= EXPERIÊNCIA =========
function ExperienceTab({
  items,
  setItems,
}: {
  items: Experience[];
  setItems: (i: Experience[]) => void;
}) {
  const [editing, setEditing] = useState<Experience | null>(null);

  async function save(e: Experience) {
    if (e.id === "new") {
      const res = await fetch("/api/portal/me/experiencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      });
      if (res.ok) {
        const j = await res.json();
        setItems([...items, { ...e, id: j.id }]);
      }
    } else {
      const res = await fetch(`/api/portal/me/experiencias/${e.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      });
      if (res.ok) setItems(items.map((x) => (x.id === e.id ? e : x)));
    }
    setEditing(null);
  }

  async function remove(id: string) {
    if (!confirm("Remover esta experiência?")) return;
    const res = await fetch(`/api/portal/me/experiencias/${id}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm opacity-70">{items.length} experiência(s) cadastrada(s)</p>
        <button
          onClick={() =>
            setEditing({
              id: "new",
              company: "",
              role: "",
              location: "",
              employmentType: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
              achievements: "",
              sortOrder: items.length,
            })
          }
          className="text-sm px-3 py-1.5 rounded-lg font-semibold text-black"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          + Adicionar
        </button>
      </div>

      {items.length === 0 && (
        <Empty msg="Nenhuma experiência ainda. Adicione seu cargo atual ou anteriores." />
      )}

      {items.map((x) => (
        <div
          key={x.id}
          className="border rounded-lg p-4 flex items-start justify-between gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0">
            <div className="font-semibold">{x.role}</div>
            <div className="text-sm opacity-80">{x.company}</div>
            <div className="text-xs opacity-60 mt-1">
              {x.startDate}
              {" – "}
              {x.current ? "atual" : x.endDate || "?"}
              {x.location && ` · ${x.location}`}
            </div>
            {x.description && (
              <p className="text-xs opacity-70 mt-2 whitespace-pre-wrap line-clamp-3">{x.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <IconButton onClick={() => setEditing(x)} title="Editar">✎</IconButton>
            <IconButton onClick={() => remove(x.id)} title="Remover">×</IconButton>
          </div>
        </div>
      ))}

      {editing && (
        <Modal title={editing.id === "new" ? "Nova experiência" : "Editar experiência"} onClose={() => setEditing(null)}>
          <ExperienceForm value={editing} onChange={setEditing} onSave={() => save(editing)} />
        </Modal>
      )}
    </div>
  );
}

function ExperienceForm({
  value,
  onChange,
  onSave,
}: {
  value: Experience;
  onChange: (v: Experience) => void;
  onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Experience>(k: K, v: Experience[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-3">
      <FieldRow>
        <Field label="Cargo *">
          <Input value={value.role} onChange={(v) => set("role", v)} />
        </Field>
        <Field label="Empresa *">
          <Input value={value.company} onChange={(v) => set("company", v)} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Local">
          <Input value={value.location ?? ""} onChange={(v) => set("location", v)} placeholder="Cidade/UF" />
        </Field>
        <Field label="Tipo">
          <Select
            value={value.employmentType ?? ""}
            onChange={(v) => set("employmentType", v)}
            options={[
              { value: "", label: "—" },
              { value: "clt", label: "CLT" },
              { value: "pj", label: "PJ" },
              { value: "estagio", label: "Estágio" },
              { value: "freelance", label: "Freelance" },
              { value: "voluntario", label: "Voluntário" },
            ]}
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Início (MM/AAAA)" small>
          <Input value={value.startDate ?? ""} onChange={(v) => set("startDate", v)} placeholder="01/2023" />
        </Field>
        <Field label="Fim (MM/AAAA)" small>
          <Input
            value={value.endDate ?? ""}
            onChange={(v) => set("endDate", v)}
            disabled={!!value.current}
            placeholder={value.current ? "atual" : "01/2024"}
          />
        </Field>
        <Field label=" " small>
          <label className="text-xs flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={!!value.current}
              onChange={(e) => set("current", e.target.checked)}
            />
            Trabalho atual
          </label>
        </Field>
      </FieldRow>
      <Field label="Descrição">
        <Textarea
          value={value.description ?? ""}
          onChange={(v) => set("description", v)}
          rows={3}
          placeholder="O que você fazia, ferramentas usadas..."
        />
      </Field>
      <Field label="Principais entregas / resultados">
        <Textarea
          value={value.achievements ?? ""}
          onChange={(v) => set("achievements", v)}
          rows={2}
          placeholder="Conquistas mensuráveis..."
        />
      </Field>
      <div className="flex justify-end pt-2">
        <button
          onClick={async () => {
            if (!value.role || !value.company) return;
            setSaving(true);
            await onSave();
            setSaving(false);
          }}
          disabled={saving}
          className="px-5 py-2 rounded-lg font-bold text-black disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

// ========= FORMAÇÃO =========
function EducationTab({
  items,
  setItems,
}: {
  items: Education[];
  setItems: (i: Education[]) => void;
}) {
  const [editing, setEditing] = useState<Education | null>(null);

  async function save(e: Education) {
    if (e.id === "new") {
      const res = await fetch("/api/portal/me/educacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      });
      if (res.ok) {
        const j = await res.json();
        setItems([...items, { ...e, id: j.id }]);
      }
    } else {
      const res = await fetch(`/api/portal/me/educacoes/${e.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      });
      if (res.ok) setItems(items.map((x) => (x.id === e.id ? e : x)));
    }
    setEditing(null);
  }

  async function remove(id: string) {
    if (!confirm("Remover esta formação?")) return;
    const res = await fetch(`/api/portal/me/educacoes/${id}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm opacity-70">{items.length} formação(ões) cadastrada(s)</p>
        <button
          onClick={() =>
            setEditing({
              id: "new",
              institution: "",
              course: "",
              level: "",
              status: "",
              startYear: null,
              endYear: null,
              description: "",
              sortOrder: items.length,
            })
          }
          className="text-sm px-3 py-1.5 rounded-lg font-semibold text-black"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          + Adicionar
        </button>
      </div>

      {items.length === 0 && <Empty msg="Nenhuma formação cadastrada." />}

      {items.map((e) => (
        <div
          key={e.id}
          className="border rounded-lg p-4 flex items-start justify-between gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0">
            <div className="font-semibold">{e.course || e.level || "—"}</div>
            <div className="text-sm opacity-80">{e.institution}</div>
            <div className="text-xs opacity-60 mt-1">
              {e.startYear} – {e.endYear ?? "?"} {e.status && `· ${e.status}`}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <IconButton onClick={() => setEditing(e)} title="Editar">✎</IconButton>
            <IconButton onClick={() => remove(e.id)} title="Remover">×</IconButton>
          </div>
        </div>
      ))}

      {editing && (
        <Modal title={editing.id === "new" ? "Nova formação" : "Editar formação"} onClose={() => setEditing(null)}>
          <EducationForm value={editing} onChange={setEditing} onSave={() => save(editing)} />
        </Modal>
      )}
    </div>
  );
}

function EducationForm({
  value,
  onChange,
  onSave,
}: {
  value: Education;
  onChange: (v: Education) => void;
  onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Education>(k: K, v: Education[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-3">
      <Field label="Instituição *">
        <Input value={value.institution} onChange={(v) => set("institution", v)} />
      </Field>
      <Field label="Curso">
        <Input value={value.course ?? ""} onChange={(v) => set("course", v)} />
      </Field>
      <FieldRow>
        <Field label="Nível">
          <Select
            value={value.level ?? ""}
            onChange={(v) => set("level", v)}
            options={[
              { value: "", label: "—" },
              { value: "medio", label: "Ensino médio" },
              { value: "tecnico", label: "Técnico" },
              { value: "tecnologo", label: "Tecnólogo" },
              { value: "graduacao", label: "Graduação" },
              { value: "pos", label: "Pós-graduação" },
              { value: "mba", label: "MBA" },
              { value: "mestrado", label: "Mestrado" },
              { value: "doutorado", label: "Doutorado" },
              { value: "curso", label: "Curso livre" },
            ]}
          />
        </Field>
        <Field label="Status">
          <Select
            value={value.status ?? ""}
            onChange={(v) => set("status", v)}
            options={[
              { value: "", label: "—" },
              { value: "completo", label: "Completo" },
              { value: "cursando", label: "Cursando" },
              { value: "trancado", label: "Trancado" },
              { value: "incompleto", label: "Interrompido" },
            ]}
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Ano início" small>
          <Input
            type="number"
            value={value.startYear?.toString() ?? ""}
            onChange={(v) => set("startYear", v ? parseInt(v) : null)}
          />
        </Field>
        <Field label="Ano fim" small>
          <Input
            type="number"
            value={value.endYear?.toString() ?? ""}
            onChange={(v) => set("endYear", v ? parseInt(v) : null)}
          />
        </Field>
      </FieldRow>
      <Field label="Descrição">
        <Textarea value={value.description ?? ""} onChange={(v) => set("description", v)} rows={2} />
      </Field>
      <div className="flex justify-end pt-2">
        <button
          onClick={async () => {
            if (!value.institution) return;
            setSaving(true);
            await onSave();
            setSaving(false);
          }}
          disabled={saving}
          className="px-5 py-2 rounded-lg font-bold text-black disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

// ========= SKILLS =========
function SkillsTab({ items, setItems }: { items: Skill[]; setItems: (i: Skill[]) => void }) {
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [adding, setAdding] = useState(false);

  async function add() {
    if (!skill.trim()) return;
    setAdding(true);
    const body = { skill: skill.trim(), level, sortOrder: items.length };
    const res = await fetch("/api/portal/me/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const j = await res.json();
      setItems([...items, { id: j.id, skill: body.skill, level: body.level, category: null, yearsOfUse: null }]);
      setSkill("");
    }
    setAdding(false);
  }

  async function remove(id: string) {
    const res = await fetch(`/api/portal/me/skills/${id}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="border rounded-lg p-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs uppercase tracking-wider opacity-70 block mb-1">Nova skill</label>
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Ex.: Python, React, Excel avançado"
              className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider opacity-70 block mb-1">Nível</label>
            <Select
              value={level}
              onChange={setLevel}
              options={[
                { value: "basic", label: "Básico" },
                { value: "intermediate", label: "Intermediário" },
                { value: "advanced", label: "Avançado" },
                { value: "expert", label: "Especialista" },
              ]}
            />
          </div>
          <button
            onClick={add}
            disabled={adding || !skill.trim()}
            className="px-4 py-2 rounded-lg font-bold text-black disabled:opacity-50 text-sm"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            Adicionar
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <Empty msg="Nenhuma skill cadastrada." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full text-xs border"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              {s.skill}
              {s.level && <span className="opacity-60 text-[10px] uppercase">· {s.level}</span>}
              <button
                onClick={() => remove(s.id)}
                className="ml-0.5 w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center text-[10px]"
                title="Remover"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ========= IDIOMAS =========
function LanguagesTab({ items, setItems }: { items: Language[]; setItems: (i: Language[]) => void }) {
  const [lang, setLang] = useState("");
  const [level, setLevel] = useState("intermediario");
  const [adding, setAdding] = useState(false);

  async function add() {
    if (!lang.trim()) return;
    setAdding(true);
    const body = { language: lang.trim(), level };
    const res = await fetch("/api/portal/me/idiomas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const j = await res.json();
      setItems([...items, { id: j.id, language: body.language, level: body.level, certification: null }]);
      setLang("");
    }
    setAdding(false);
  }

  async function remove(id: string) {
    const res = await fetch(`/api/portal/me/idiomas/${id}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="border rounded-lg p-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs uppercase tracking-wider opacity-70 block mb-1">Idioma</label>
            <input
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Inglês, Espanhol..."
              className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider opacity-70 block mb-1">Nível</label>
            <Select
              value={level}
              onChange={setLevel}
              options={[
                { value: "basico", label: "Básico" },
                { value: "intermediario", label: "Intermediário" },
                { value: "avancado", label: "Avançado" },
                { value: "fluente", label: "Fluente" },
                { value: "nativo", label: "Nativo" },
              ]}
            />
          </div>
          <button
            onClick={add}
            disabled={adding || !lang.trim()}
            className="px-4 py-2 rounded-lg font-bold text-black disabled:opacity-50 text-sm"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
          >
            Adicionar
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <Empty msg="Nenhum idioma cadastrado." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {items.map((l) => (
            <div
              key={l.id}
              className="border rounded-lg p-3 flex items-start justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <div className="font-semibold text-sm">{l.language}</div>
                {l.level && <div className="text-xs opacity-70 capitalize">{l.level}</div>}
              </div>
              <button
                onClick={() => remove(l.id)}
                className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center text-xs"
                title="Remover"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========= UI HELPERS =========
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border rounded-xl p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  small = false,
  children,
}: {
  label: string;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={small ? "" : ""}>
      <label className="text-xs uppercase tracking-wider opacity-70 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm disabled:opacity-50"
      style={{ borderColor: "var(--border)" }}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm resize-y"
      style={{ borderColor: "var(--border)" }}
    />
  );
}


function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-base opacity-70 hover:opacity-100"
    >
      {children}
    </button>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div
      className="p-6 rounded-lg border border-dashed text-center"
      style={{ borderColor: "var(--border)" }}
    >
      <p className="text-sm opacity-60">{msg}</p>
    </div>
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
          <button onClick={onClose} className="opacity-60 hover:opacity-100 text-xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
