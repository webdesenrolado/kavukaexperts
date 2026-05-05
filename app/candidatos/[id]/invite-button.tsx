"use client";

import { useState } from "react";
import { Send, Copy, Check, X, ExternalLink, Sparkles, Clock, Calendar, Fingerprint } from "lucide-react";

interface InviteButtonProps {
  candidateId: string;
  candidateName: string;
}

const INSTRUMENTS = [
  { slug: "ipip-neo-120", name: "IPIP-NEO-120 (Big Five completo, 120 itens)", available: true, defaultMinutes: 30 },
  { slug: "bigfive-short", name: "Big Five curto (IPIP-50)", available: false, defaultMinutes: 15 },
  { slug: "mbti-like", name: "MBTI-like (16 letras)", available: false, defaultMinutes: 12 },
  { slug: "disc-adapt", name: "DISC adaptado", available: false, defaultMinutes: 10 },
  { slug: "label-guep", name: "Label GUÉP", available: false, defaultMinutes: 10 },
  { slug: "gallup-adapt", name: "Gallup adaptado", available: false, defaultMinutes: 25 },
  { slug: "dark-triad", name: "Dark Triad (perfil de risco)", available: false, defaultMinutes: 8 },
  { slug: "hogan-adapt", name: "Hogan HDS adaptado", available: false, defaultMinutes: 30 },
];

export function InviteButton({ candidateId, candidateName }: InviteButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [kyidLink, setKyidLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedKyid, setCopiedKyid] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  const [instrument, setInstrument] = useState("ipip-neo-120");
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);

  function pickInstrument(slug: string) {
    setInstrument(slug);
    const meta = INSTRUMENTS.find((i) => i.slug === slug);
    if (meta) setTimeLimitMinutes(meta.defaultMinutes);
  }

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          instrument,
          expiresInDays,
          timeLimitMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao criar convite");
        return;
      }
      const url = `${window.location.origin}/aplicar/${data.token}`;
      const kyid = `${window.location.origin}/kyid/${data.kyidToken}`;
      setLink(url);
      setKyidLink(kyid);
      setExpiresAt(data.expiresAt);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, which: "link" | "kyid") {
    await navigator.clipboard.writeText(text);
    if (which === "link") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedKyid(true);
      setTimeout(() => setCopiedKyid(false), 2000);
    }
  }

  function close() {
    setOpen(false);
    setLink("");
    setKyidLink("");
    setError("");
  }

  const whatsappMsg = link
    ? `Olá ${candidateName.split(" ")[0]}! Você foi convidado(a) para a avaliação Kavuka — leva uns ${timeLimitMinutes} minutos. Quando começar, o tempo conta. Acesse: ${link}`
    : "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 shadow-lg shadow-[#ff6a00]/20"
      >
        <Send size={16} />
        Enviar avaliação
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={close}
        >
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header
              className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles size={16} className="text-[#ff6a00]" />
                Enviar avaliação
              </h2>
              <button onClick={close} className="opacity-60 hover:opacity-100">
                <X size={18} />
              </button>
            </header>

            <div className="p-5">
              {!link ? (
                <>
                  <p className="text-sm opacity-80 mb-5">
                    Gere um link para <strong>{candidateName}</strong> responder uma avaliação. O candidato
                    acessa sem login, faz dentro do tempo limite, e recebe a própria{" "}
                    <strong className="text-[#ff6a00]">KYID — Conheça Sua Identidade</strong>.
                  </p>

                  {/* Instrumento */}
                  <Field label="Avaliação">
                    <div className="space-y-1.5">
                      {INSTRUMENTS.map((i) => (
                        <label
                          key={i.slug}
                          className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer ${
                            instrument === i.slug ? "border-[#ff6a00] bg-[#ff6a00]/5" : ""
                          } ${!i.available ? "opacity-50 cursor-not-allowed" : ""}`}
                          style={{ borderColor: instrument === i.slug ? "#ff6a00" : "var(--border)" }}
                        >
                          <input
                            type="radio"
                            checked={instrument === i.slug}
                            onChange={() => pickInstrument(i.slug)}
                            disabled={!i.available}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="text-xs font-medium">
                              {i.name}
                              {!i.available && <span className="ml-2 text-[9px] opacity-60">(em breve)</span>}
                            </div>
                            <div className="text-[10px] opacity-60">~{i.defaultMinutes} min</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Field>

                  {/* Tempo + Validade */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Field label="Tempo p/ concluir">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                        <Clock size={14} className="opacity-60" />
                        <input
                          type="number"
                          min={5}
                          max={180}
                          value={timeLimitMinutes}
                          onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 30)}
                          className="flex-1 bg-transparent text-sm outline-none"
                        />
                        <span className="text-xs opacity-60">min</span>
                      </div>
                      <div className="text-[10px] opacity-60 mt-1">
                        Conta a partir do momento em que o candidato começar
                      </div>
                    </Field>

                    <Field label="Validade do link">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                        <Calendar size={14} className="opacity-60" />
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={expiresInDays}
                          onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 14)}
                          className="flex-1 bg-transparent text-sm outline-none"
                        />
                        <span className="text-xs opacity-60">dias</span>
                      </div>
                      <div className="text-[10px] opacity-60 mt-1">
                        Após esse prazo o link expira
                      </div>
                    </Field>
                  </div>

                  <div
                    className="mt-4 p-3 rounded-lg text-xs flex items-start gap-2"
                    style={{ background: "rgba(255,106,0,0.05)", border: "1px solid rgba(255,106,0,0.2)" }}
                  >
                    <Fingerprint size={14} className="text-[#ff6a00] mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-[#ff6a00]">KYID:</strong> ao concluir a avaliação, o candidato
                      ganha um link permanente da própria identidade comportamental. Pode levar para qualquer
                      processo seletivo.
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3 mt-4">
                      {error}
                    </p>
                  )}
                  <button
                    onClick={generate}
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Gerando..." : "Gerar link de avaliação"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm opacity-80 mb-3">
                    Convite gerado. Envie para <strong>{candidateName}</strong>:
                  </p>
                  <div
                    className="p-3 rounded-lg border flex items-center gap-2 mb-2"
                    style={{ borderColor: "var(--border)", background: "var(--background)" }}
                  >
                    <input
                      readOnly
                      value={link}
                      className="flex-1 bg-transparent text-xs font-mono outline-none truncate"
                    />
                    <button
                      onClick={() => copy(link, "link")}
                      className="px-3 py-1.5 rounded-md bg-[#ff6a00]/10 text-[#ff6a00] text-xs font-medium hover:bg-[#ff6a00]/20 flex items-center gap-1"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <ExternalLink size={12} /> Abrir
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20"
                    >
                      WhatsApp
                    </a>
                  </div>

                  <div
                    className="p-3 rounded-lg border-2 border-dashed mt-4"
                    style={{ borderColor: "rgba(255,106,0,0.4)", background: "rgba(255,106,0,0.03)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Fingerprint size={14} className="text-[#ff6a00]" />
                      <span className="text-xs font-bold text-[#ff6a00] uppercase tracking-wider">
                        KYID permanente
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 mb-2">
                      Esse é o link permanente da identidade comportamental do candidato. Após concluir
                      a primeira avaliação, ele acessa todos os resultados aqui:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={kyidLink}
                        className="flex-1 bg-transparent text-[11px] font-mono outline-none truncate p-1"
                      />
                      <button
                        onClick={() => copy(kyidLink, "kyid")}
                        className="px-2 py-1 rounded-md bg-[#ff6a00]/15 text-[#ff6a00] text-[10px] font-medium hover:bg-[#ff6a00]/25 flex items-center gap-1"
                      >
                        {copiedKyid ? <Check size={10} /> : <Copy size={10} />}
                        {copiedKyid ? "OK" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] opacity-60 mt-4">
                    Validade: {expiresAt && new Date(expiresAt).toLocaleDateString("pt-BR")} · Tempo após
                    iniciar: {timeLimitMinutes} min
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
