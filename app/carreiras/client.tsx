"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Building2,
  Send,
  Loader2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";
import type { PublicJob } from "./page";
import { REMOTE_LABEL, SENIORITY_LABEL, EMPLOYMENT_TYPE_LABEL, EDUCATION_LABEL } from "@/lib/labels";
import { Select } from "@/components/select";

interface Props {
  jobs: PublicJob[];
}

export function CarreirasClient({ jobs }: Props) {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountResult, setAccountResult] = useState<{
    activated: boolean;
    alreadyExisted: boolean;
    passwordMismatch: boolean;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    linkedinUrl: "",
    currentRole: "",
    currentCompany: "",
    yearsExperience: "",
    expectedSalary: "",
    educationLevel: "",
    consent: false,
    createAccount: true,
    password: "",
    passwordConfirm: "",
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.consent) {
      setError("Para se candidatar, aceite os termos LGPD.");
      return;
    }
    if (form.createAccount) {
      if (!form.password || form.password.length < 6) {
        setError("Senha precisa ter ao menos 6 caracteres.");
        return;
      }
      if (form.password !== form.passwordConfirm) {
        setError("As senhas não conferem.");
        return;
      }
    }
    setLoading(true);
    try {
      const { passwordConfirm, createAccount, ...rest } = form;
      const res = await fetch("/api/public/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJobId,
          ...rest,
          password: createAccount ? form.password : undefined,
          yearsExperience: rest.yearsExperience ? parseInt(rest.yearsExperience) : null,
          expectedSalary: rest.expectedSalary ? parseInt(rest.expectedSalary) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível enviar a candidatura.");
        return;
      }
      setAccountResult(data.account || null);
      setSubmitted(true);
      setTimeout(() => {
        document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Erro de conexão. Tenta de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }

  function fmtSalary(min: number | null, max: number | null) {
    if (!min && !max) return null;
    const f = (n: number) => `R$ ${n.toLocaleString("pt-BR")}`;
    if (min && max) return `${f(min)} – ${f(max)}`;
    return f((min ?? max)!);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0b 0%, #131319 100%)",
        color: "#f5f5f4",
      }}
    >
      {/* Header */}
      <header className="px-4 py-5 border-b border-white/5 sticky top-0 z-30 backdrop-blur-md" style={{ background: "rgba(10,10,11,0.85)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-black font-black text-lg">
                K
              </div>
              <div className="absolute -bottom-1 -right-1 px-1 rounded bg-black border border-white/20 text-[7px] font-bold tracking-wider">
                ID
              </div>
            </div>
            <div>
              <div className="font-bold text-sm">Kavuka Experts</div>
              <div className="text-[9px] uppercase tracking-[0.2em] opacity-60">Conheça Sua Identidade</div>
            </div>
          </div>
          <a
            href="#vagas"
            className="text-xs px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hidden md:inline-block"
          >
            Ver todas as vagas
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative px-4 pt-12 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(255,106,0,0.4), transparent 50%), radial-gradient(ellipse at bottom left, rgba(255,204,0,0.3), transparent 50%)",
          }}
        />
        <div className="max-w-4xl mx-auto relative">
          {submitted ? (
            <div className="text-center py-10 max-w-2xl mx-auto">
              <CheckCircle2 size={64} className="mx-auto text-[#10b981] mb-5" />
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Inscrição enviada 🎉</h1>
              <p className="text-lg opacity-80 leading-relaxed">
                Você se candidatou para <strong>{selectedJob?.title}</strong>.
              </p>

              {accountResult?.activated && (
                <div className="mt-8 p-6 rounded-2xl border border-[#ff6a00]/30 bg-gradient-to-br from-[#ff6a00]/10 to-[#ffcc00]/5 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-[#ff6a00]" />
                    <h3 className="font-bold text-lg">
                      {accountResult.alreadyExisted
                        ? "Bem-vindo(a) de volta!"
                        : "Conta criada · próximos passos"}
                    </h3>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed mb-4">
                    {accountResult.alreadyExisted
                      ? "Você já tinha conta no portal. Entre agora pra acompanhar o processo."
                      : "Sua conta no portal foi criada. Use ela pra:"}
                  </p>
                  {!accountResult.alreadyExisted && (
                    <ul className="text-sm opacity-90 space-y-1.5 mb-5">
                      <li>✓ Completar seu currículo (formação, experiência, skills, idiomas)</li>
                      <li>✓ Fazer as avaliações comportamentais (LABEL, DISC, IPIP)</li>
                      <li>
                        ✓ Gerar sua <strong className="text-[#ff6a00]">Apostila ICH</strong> —
                        sua identidade comportamental e de habilidades, portátil pra qualquer processo
                      </li>
                    </ul>
                  )}
                  <a
                    href="/portal/me"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 shadow-xl"
                  >
                    <Fingerprint size={16} /> Acessar meu portal
                  </a>
                </div>
              )}

              {accountResult?.passwordMismatch && (
                <div className="mt-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-sm text-left">
                  <strong className="text-yellow-400">Já existe uma conta com este email,</strong>{" "}
                  mas a senha que você digitou não bateu. Sua candidatura foi registrada normalmente.
                  Pra acompanhar, faça login no portal:
                  <div className="mt-3">
                    <a
                      href="/portal/login"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/10 text-sm"
                    >
                      Entrar no portal
                    </a>{" "}
                    <a
                      href="/portal/recuperar"
                      className="ml-2 text-xs underline opacity-70 hover:opacity-100"
                    >
                      Esqueci a senha
                    </a>
                  </div>
                </div>
              )}

              {!accountResult?.activated && !accountResult?.passwordMismatch && (
                <p className="text-base opacity-70 mt-4">
                  Em breve, o time de RH vai te chamar para a próxima etapa — onde sua{" "}
                  <strong className="text-[#ff6a00]">KYID</strong> começa a ser construída.
                </p>
              )}

              <button
                onClick={() => {
                  setSubmitted(false);
                  setAccountResult(null);
                  setForm({
                    ...form,
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    passwordConfirm: "",
                  });
                }}
                className="mt-6 px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
              >
                Candidatar-se a outra vaga
              </button>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[#ff6a00]/10 border border-[#ff6a00]/30">
                <Sparkles size={12} className="text-[#ff6a00]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff6a00] font-bold">
                  Carreiras Kavuka
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
                Encontre uma vaga.<br />
                <span className="bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] bg-clip-text text-transparent">
                  Construa sua KYID.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg opacity-80 leading-relaxed">
                Aqui você não é currículo — é identidade. Aplique na vaga, faça a avaliação Kavuka, e
                receba sua KYID: a sua identidade comportamental que você leva pra qualquer processo.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-6 text-xs opacity-70">
                <span className="inline-flex items-center gap-1">
                  <Fingerprint size={12} className="text-[#ff6a00]" /> KYID portátil pra vida toda
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#10b981]" /> Tratamento conforme LGPD
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {!submitted && (
        <>
          {/* Vagas */}
          <section id="vagas" className="px-4 py-10">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-1">Vagas abertas</h2>
              <p className="text-sm opacity-70 mb-6">{jobs.length} oportunidade{jobs.length === 1 ? "" : "s"} esperando por você.</p>

              {jobs.length === 0 ? (
                <div className="p-12 rounded-xl border border-white/10 text-center bg-white/5">
                  <Briefcase size={36} className="mx-auto opacity-30 mb-3" />
                  <p className="opacity-70">No momento não há vagas abertas. Volte em breve.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jobs.map((j) => {
                    const selected = j.id === selectedJobId;
                    return (
                      <button
                        key={j.id}
                        onClick={() => {
                          setSelectedJobId(j.id);
                          document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`text-left p-5 rounded-xl border transition-all ${selected ? "border-[#ff6a00] bg-[#ff6a00]/10 shadow-lg shadow-[#ff6a00]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold">{j.title}</h3>
                          {selected && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#ff6a00] text-black font-bold shrink-0">
                              Selecionada
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] opacity-70 mb-3">
                          {j.companyName && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 size={10} /> {j.companyName}
                            </span>
                          )}
                          {j.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={10} /> {j.location}
                              {j.remote && j.remote !== "on_site" && ` · ${REMOTE_LABEL[j.remote] ?? j.remote}`}
                            </span>
                          )}
                          {j.seniority && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase size={10} /> {SENIORITY_LABEL[j.seniority] ?? j.seniority}
                            </span>
                          )}
                        </div>
                        {fmtSalary(j.salaryMin, j.salaryMax) && (
                          <div className="text-xs font-bold text-[#10b981] mb-2">
                            {fmtSalary(j.salaryMin, j.salaryMax)}
                          </div>
                        )}
                        {j.description && (
                          <p className="text-xs opacity-60 line-clamp-2">{j.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Formulário */}
          {jobs.length > 0 && (
            <section id="formulario" className="px-4 py-10 border-t border-white/5">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-1">Quero me candidatar</h2>
                <p className="text-sm opacity-70 mb-6">
                  Preencha rapidinho. Em breve te chamaremos para construir sua KYID.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Vaga */}
                  <Field label="Vaga *">
                    <Select
                      value={selectedJobId}
                      onChange={setSelectedJobId}
                      options={jobs.map((j) => ({
                        value: j.id,
                        label: j.title,
                        hint: j.location ?? undefined,
                      }))}
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome completo *">
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="form-input"
                      />
                    </Field>
                    <Field label="Email *">
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="form-input"
                      />
                    </Field>
                    <Field label="WhatsApp">
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+55 11 99999-9999"
                        className="form-input"
                      />
                    </Field>
                    <Field label="Cidade">
                      <input
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="form-input"
                      />
                    </Field>
                    <Field label="Cargo atual">
                      <input
                        value={form.currentRole}
                        onChange={(e) => setForm({ ...form, currentRole: e.target.value })}
                        className="form-input"
                      />
                    </Field>
                    <Field label="Empresa atual">
                      <input
                        value={form.currentCompany}
                        onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                        className="form-input"
                      />
                    </Field>
                    <Field label="Anos de experiência">
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={form.yearsExperience}
                        onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                        className="form-input"
                      />
                    </Field>
                    <Field label="Pretensão salarial (R$)">
                      <input
                        type="number"
                        min={0}
                        value={form.expectedSalary}
                        onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                        className="form-input"
                      />
                    </Field>
                    <Field label="Escolaridade">
                      <Select
                        value={form.educationLevel}
                        onChange={(v) => setForm({ ...form, educationLevel: v })}
                        placeholder="Selecione"
                        options={[
                          { value: "", label: "Não informar" },
                          ...Object.entries(EDUCATION_LABEL).map(([k, v]) => ({
                            value: k,
                            label: v,
                          })),
                        ]}
                      />
                    </Field>
                    <Field label="LinkedIn">
                      <input
                        value={form.linkedinUrl}
                        onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="form-input"
                      />
                    </Field>
                  </div>

                  {/* Bloco: criar conta no portal */}
                  <div className="rounded-xl border border-[#ff6a00]/30 bg-gradient-to-br from-[#ff6a00]/10 to-[#ffcc00]/5 p-5">
                    <label className="flex items-start gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={form.createAccount}
                        onChange={(e) => setForm({ ...form, createAccount: e.target.checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Sparkles size={14} className="text-[#ff6a00]" />
                          Criar minha conta no portal Kavuka
                        </div>
                        <p className="opacity-80 text-xs mt-1 leading-relaxed">
                          Recomendado. Com sua conta você completa o currículo, faz as avaliações
                          comportamentais (LABEL, DISC, IPIP) e recebe sua{" "}
                          <strong className="text-[#ff6a00]">Apostila ICH</strong> — sua
                          identidade portátil pra qualquer processo seletivo.
                        </p>
                      </div>
                    </label>

                    {form.createAccount && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
                        <Field label="Senha (mín. 6) *">
                          <input
                            type="password"
                            required={form.createAccount}
                            minLength={6}
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="form-input"
                          />
                        </Field>
                        <Field label="Confirme a senha *">
                          <input
                            type="password"
                            required={form.createAccount}
                            minLength={6}
                            autoComplete="new-password"
                            value={form.passwordConfirm}
                            onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                            className="form-input"
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      className="mt-1"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <ShieldCheck size={14} className="text-[#10b981]" />
                        Concordo com a coleta e tratamento dos meus dados
                      </div>
                      <p className="opacity-70 text-xs mt-1">
                        Conforme LGPD art. 7º. Você poderá pedir a exclusão dos seus dados a qualquer
                        momento. Os resultados de avaliação são <strong>sinalizações</strong>, não
                        diagnósticos clínicos, e você tem direito a contestar qualquer decisão
                        automatizada (LGPD art. 20).
                      </p>
                    </div>
                  </label>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 disabled:opacity-50 shadow-xl shadow-[#ff6a00]/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Enviar candidatura
                      </>
                    )}
                  </button>
                </form>
              </div>
            </section>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-white/5 mt-10">
        <div className="max-w-6xl mx-auto text-center text-[11px] opacity-50">
          <p>
            <strong>Kavuka Experts</strong> · A primeira plataforma KYID do RH brasileiro · GUÉP Soluções
            Corporativas
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.7rem 0.85rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.6rem;
          font-size: 0.875rem;
          color: #f5f5f4;
        }
        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .form-input:focus {
          outline: none;
          border-color: #ff6a00;
          background: rgba(255, 106, 0, 0.05);
          box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.15);
        }
        .form-input option {
          background: #131319;
          color: #f5f5f4;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider opacity-60 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
