"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  Loader2,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Fingerprint,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

interface Item {
  item_id: string;
  text: string;
}

interface DomainScore {
  raw: number;
  level: "very_low" | "low" | "average" | "high" | "very_high";
}

interface InitialResult {
  scores: { domains: Record<string, DomainScore>; facets?: Record<string, DomainScore | undefined> } | null;
  interpretation: { strengths: string[]; watchouts: string[]; narrative: string; confidence: string } | null;
}

interface ApplyClientProps {
  token: string;
  candidateName: string;
  instrument: string;
  timeLimitMinutes: number;
  items: Item[];
  initialResult: InitialResult | null;
  alreadyCompleted: boolean;
  kyidToken: string | null;
}

type Phase = "consent" | "applying" | "submitting" | "expired" | "done";

const SCALE = [
  { value: 1, label: "Discordo totalmente", short: "DT" },
  { value: 2, label: "Discordo", short: "D" },
  { value: 3, label: "Indiferente", short: "I" },
  { value: 4, label: "Concordo", short: "C" },
  { value: 5, label: "Concordo totalmente", short: "CT" },
];
const SCALE_COLORS = ["#ef4444", "#f97316", "#94a3b8", "#22c55e", "#10b981"];

const DOMAIN_FRIENDLY: Record<string, { name: string; icon: string }> = {
  O: { name: "Curiosidade e abertura", icon: "🌅" },
  C: { name: "Organização e foco", icon: "🎯" },
  E: { name: "Energia social", icon: "🤝" },
  A: { name: "Cooperação", icon: "🌿" },
  N: { name: "Sensibilidade", icon: "💭" },
};

export function ApplyClient(props: ApplyClientProps) {
  const [phase, setPhase] = useState<Phase>(props.alreadyCompleted ? "done" : "consent");
  const [result] = useState<InitialResult | null>(props.initialResult);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({});
  const startedAtRef = useRef<number>(0);
  const lastInteractionRef = useRef<number>(Date.now());
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [kyidLink, setKyidLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const total = props.items.length;
  const answered = Object.keys(responses).length;
  const progress = (answered / total) * 100;
  const allDone = answered === total;
  const firstUnanswered = useMemo(
    () => props.items.findIndex((it) => responses[it.item_id] === undefined),
    [props.items, responses],
  );

  const timeRemainingSec = deadline ? Math.max(0, Math.floor((deadline - now) / 1000)) : 0;
  const minutesLeft = Math.floor(timeRemainingSec / 60);
  const secondsLeft = timeRemainingSec % 60;

  // Tick clock every second when in applying phase
  useEffect(() => {
    if (phase !== "applying") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Auto-expire when time runs out
  useEffect(() => {
    if (phase !== "applying" || !deadline) return;
    if (now >= deadline) {
      setPhase("expired");
    }
  }, [now, deadline, phase]);

  useEffect(() => {
    if (phase !== "applying") return;
    function before(e: BeforeUnloadEvent) {
      if (answered > 0 && !allDone) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [phase, answered, allDone]);

  function setResponse(itemId: string, value: number) {
    const t = Date.now();
    const dt = t - lastInteractionRef.current;
    lastInteractionRef.current = t;
    setResponses((r) => ({ ...r, [itemId]: value }));
    setResponseTimes((tt) => ({ ...tt, [itemId]: dt }));
  }

  async function startApplying() {
    if (!consent) {
      setError("Para começar, confirme o consentimento LGPD.");
      return;
    }
    setError("");
    try {
      const res = await fetch(`/api/public/invitations/${props.token}/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível iniciar a avaliação.");
        return;
      }
      // Server-authoritative clocks
      const startedAt = new Date(data.startedAt).getTime();
      const serverNow = new Date(data.serverNow).getTime();
      const localNow = Date.now();
      const skew = serverNow - localNow;
      const dl = startedAt + (data.timeLimitMinutes ?? props.timeLimitMinutes) * 60 * 1000 - skew;
      setDeadline(dl);
      startedAtRef.current = localNow;
      lastInteractionRef.current = localNow;
      setNow(localNow);
      setPhase("applying");
    } catch {
      setError("Erro de conexão.");
    }
  }

  async function handleSubmit() {
    if (!allDone) {
      setError(`Faltam ${total - answered} item(s) sem resposta.`);
      const target = document.getElementById(`item-${firstUnanswered}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError("");
    setPhase("submitting");
    try {
      const completionTime = Math.round((Date.now() - startedAtRef.current) / 1000);
      const payload = {
        consentLgpd: true,
        channel: "web" as const,
        language: "pt-BR" as const,
        completionTimeSeconds: completionTime,
        responses: props.items.map((it) => ({
          item_id: it.item_id,
          value: { kind: "likert5" as const, value: responses[it.item_id] },
          response_time_ms: responseTimes[it.item_id] ?? 2000,
        })),
      };
      const res = await fetch(`/api/public/invitations/${props.token}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 410) {
          setPhase("expired");
          return;
        }
        setError(data.error || "Não foi possível enviar suas respostas.");
        setPhase("applying");
        return;
      }
      // Sucesso — mostra KYID
      if (data.kyidToken) {
        setKyidLink(`${window.location.origin}/kyid/${data.kyidToken}`);
      }
      // Recarrega pra puxar resultado
      window.location.reload();
    } catch {
      setError("Erro de conexão.");
      setPhase("applying");
    }
  }

  async function copyKyid() {
    if (!kyidLink) return;
    await navigator.clipboard.writeText(kyidLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const bgStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0a0a0b 0%, #131319 100%)",
    color: "#f5f5f4",
  };

  // EXPIRADO
  if (phase === "expired") {
    return (
      <div style={bgStyle}>
        <Header subtitle="Avaliação encerrada" />
        <div className="max-w-md mx-auto px-4 pt-12 text-center">
          <Clock size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tempo esgotado</h1>
          <p className="opacity-70 text-sm">
            O tempo de {props.timeLimitMinutes} minutos para responder essa avaliação acabou. Entre em
            contato com o recrutador para receber um novo convite.
          </p>
        </div>
      </div>
    );
  }

  // CONCLUÍDO COM RESULTADO
  if (phase === "done" && result?.scores && result?.interpretation) {
    const candidateKyid = props.kyidToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/kyid/${props.kyidToken}` : "";
    return (
      <div style={bgStyle}>
        <Header subtitle="Sua identidade revelada" />
        <div className="max-w-2xl mx-auto px-4 pb-16">
          {props.kyidToken && <KyidBanner kyidLink={candidateKyid} />}
          <ResultView candidateName={props.candidateName} result={result} />
        </div>
      </div>
    );
  }

  // CONCLUÍDO SEM RESULTADO
  if (phase === "done") {
    return (
      <div style={bgStyle}>
        <Header subtitle="Avaliação concluída" />
        <div className="max-w-md mx-auto px-4 pt-12 text-center">
          <CheckCircle2 size={48} className="mx-auto text-[#10b981] mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pronto, {props.candidateName.split(" ")[0]}!</h1>
          <p className="opacity-70 text-sm">
            Suas respostas foram enviadas. O recrutador entrará em contato.
          </p>
        </div>
      </div>
    );
  }

  // CONSENT
  if (phase === "consent") {
    return (
      <div style={bgStyle}>
        <Header subtitle="Convite Kavuka KYID" />
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            Olá, {props.candidateName.split(" ")[0]} 👋
          </h1>
          <p className="opacity-80 leading-relaxed mb-6">
            Você foi convidado(a) a fazer uma avaliação de perfil comportamental. Mais que um teste —
            isso vai construir sua <strong className="text-[#ff6a00]">KYID</strong>: a sua identidade
            comportamental, que você leva pra qualquer lugar.
          </p>

          <div className="space-y-4 mb-8">
            <InfoCard icon="⏱️" title={`Tempo: ${props.timeLimitMinutes} minutos`}>
              Quando começar, o cronômetro corre. São 120 afirmações curtas — responda com rapidez e
              espontaneidade. Se o tempo acabar, será preciso pedir um novo convite.
            </InfoCard>
            <InfoCard icon="🪪" title="A KYID é sua, pra sempre">
              Ao terminar, você recebe um link permanente da própria identidade comportamental. Pode
              levar para outros processos seletivos. É como o KYC dos bancos — só que para você se
              conhecer.
            </InfoCard>
            <InfoCard icon="🔒" title="Tratamento conforme a LGPD">
              Dados sensíveis. Você pode pedir exclusão a qualquer momento. Resultado é{" "}
              <strong>sinalização</strong>, não diagnóstico clínico, e você tem direito a contestar
              decisão automatizada.
            </InfoCard>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck size={14} className="text-[#10b981]" />
                Concordo em participar e construir minha KYID
              </div>
              <p className="opacity-70 text-xs mt-1">
                Confirmo que li as informações acima e dou meu consentimento para a coleta e tratamento
                dos meus dados nos termos da LGPD (art. 7º).
              </p>
            </div>
          </label>

          {error && (
            <p className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <button
            onClick={startApplying}
            className="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 shadow-xl shadow-[#ff6a00]/20 disabled:opacity-50"
            disabled={!consent}
          >
            <Sparkles size={16} />
            Começar — {props.timeLimitMinutes} min no cronômetro
          </button>
        </div>
      </div>
    );
  }

  // APPLYING / SUBMITTING
  const timeWarning = deadline && now > deadline - 60 * 1000; // último minuto

  return (
    <div style={bgStyle}>
      <header
        className="sticky top-0 z-20 border-b backdrop-blur-md"
        style={{ background: "rgba(0,0,0,0.7)", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-60">{props.candidateName.split(" ")[0]} · IPIP-NEO-120</span>
            <div className="flex items-center gap-3">
              {deadline && (
                <span
                  className={`text-xs font-mono font-bold flex items-center gap-1 ${
                    timeWarning ? "text-red-400 animate-pulse" : "text-[#ffcc00]"
                  }`}
                >
                  <Clock size={12} />
                  {String(minutesLeft).padStart(2, "0")}:{String(secondsLeft).padStart(2, "0")}
                </span>
              )}
              <span className="text-xs">
                <span className="font-bold">{answered}</span>
                <span className="opacity-60"> / {total}</span>
              </span>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #ff6a00, #ffcc00)",
              }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {props.items.map((item, idx) => {
          const value = responses[item.item_id];
          return (
            <div
              key={item.item_id}
              id={`item-${idx}`}
              className="p-4 rounded-xl border transition-colors bg-white/5"
              style={{ borderColor: value !== undefined ? "rgba(255,106,0,0.4)" : "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-[10px] font-mono opacity-40 mt-0.5 shrink-0 w-8">
                  {String(idx + 1).padStart(3, "0")}
                </span>
                <span className="text-sm md:text-base leading-relaxed">{item.text}</span>
              </div>
              <div className="flex gap-1.5 ml-11">
                {SCALE.map((s, i) => {
                  const selected = value === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setResponse(item.item_id, s.value)}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                        selected ? "scale-105 shadow-md" : "opacity-60 hover:opacity-100"
                      }`}
                      style={{
                        background: selected ? SCALE_COLORS[i] : "transparent",
                        borderColor: selected ? SCALE_COLORS[i] : "rgba(255,255,255,0.1)",
                        color: "#fff",
                      }}
                      title={s.label}
                    >
                      <div className="hidden md:block">{s.label}</div>
                      <div className="md:hidden font-bold">{s.short}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {error && (
          <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 pb-8">
          <button
            onClick={handleSubmit}
            disabled={phase === "submitting"}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff6a00] to-[#ffcc00] hover:opacity-90 disabled:opacity-50 shadow-xl shadow-[#ff6a00]/20"
          >
            {phase === "submitting" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Construindo sua KYID...
              </>
            ) : (
              <>
                <Send size={18} />
                {allDone ? "Enviar e gerar KYID" : `Faltam ${total - answered} respostas`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <header className="px-4 py-6 border-b border-white/5">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-black font-black">
            K
          </div>
          <div className="absolute -bottom-1 -right-1 px-1 rounded bg-black border border-white/20 text-[7px] font-bold tracking-wider">
            ID
          </div>
        </div>
        <div>
          <div className="font-bold text-sm">Kavuka KYID</div>
          <div className="text-[10px] uppercase tracking-wider opacity-60">{subtitle}</div>
        </div>
      </div>
    </header>
  );
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-medium mb-1">{title}</div>
          <p className="text-sm opacity-70 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}

function KyidBanner({ kyidLink }: { kyidLink: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(kyidLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div
      className="p-5 rounded-2xl border-2 border-dashed mb-6 mt-4"
      style={{ borderColor: "#ff6a00", background: "rgba(255,106,0,0.05)" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <Fingerprint size={28} className="text-[#ff6a00] mt-0.5 shrink-0" />
        <div>
          <h2 className="font-bold text-lg">Sua KYID foi criada 🎉</h2>
          <p className="text-sm opacity-80 mt-1">
            Esta é a sua <strong>identidade comportamental Kavuka</strong>. Salve este link — você pode
            consultá-lo a qualquer momento e levar para outros processos seletivos.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-black/30">
        <input
          readOnly
          value={kyidLink}
          className="flex-1 bg-transparent text-xs font-mono outline-none truncate"
        />
        <button
          onClick={copy}
          className="px-3 py-1.5 rounded-md bg-[#ff6a00] text-black text-xs font-bold hover:opacity-90 flex items-center gap-1"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "OK" : "Copiar"}
        </button>
        <a
          href={kyidLink}
          target="_blank"
          rel="noopener"
          className="px-3 py-1.5 rounded-md border border-white/20 text-xs font-medium hover:bg-white/5 flex items-center gap-1"
        >
          <ExternalLink size={12} /> Abrir
        </a>
      </div>
    </div>
  );
}

function ResultView({
  candidateName,
  result,
}: {
  candidateName: string;
  result: InitialResult;
}) {
  const scores = result.scores!;
  const interp = result.interpretation!;
  const firstName = candidateName.split(" ")[0];

  const topStrengths = interp.strengths.slice(0, 3);
  const topWatchouts = interp.watchouts.slice(0, 2);

  return (
    <div className="space-y-6 pt-2">
      <div className="text-center pt-4">
        <CheckCircle2 size={40} className="mx-auto text-[#10b981] mb-3" />
        <h1 className="text-3xl font-bold tracking-tight">Pronto, {firstName}!</h1>
        <p className="opacity-70 mt-2">Conheça a sua identidade — sua KYID Kavuka.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(DOMAIN_FRIENDLY).map(([k, meta]) => {
          const d = scores.domains[k];
          if (!d) return null;
          const intensity =
            d.level === "very_high" || d.level === "high"
              ? "Alto"
              : d.level === "very_low" || d.level === "low"
              ? "Baixo"
              : "Equilibrado";
          return (
            <div key={k} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{meta.icon}</span>
                <span className="text-xs uppercase tracking-wider opacity-60">{intensity}</span>
              </div>
              <div className="font-medium">{meta.name}</div>
            </div>
          );
        })}
      </div>

      {topStrengths.length > 0 && (
        <div className="p-5 rounded-xl border border-white/10 bg-white/5">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <span className="text-xl">✨</span> Forças sinalizadas
          </h2>
          <ul className="space-y-2">
            {topStrengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 size={16} className="text-[#10b981] mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {topWatchouts.length > 0 && (
        <div className="p-5 rounded-xl border border-white/10 bg-white/5">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <span className="text-xl">🌱</span> Áreas de desenvolvimento
          </h2>
          <ul className="space-y-2">
            {topWatchouts.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <AlertTriangle size={16} className="text-[#f59e0b] mt-0.5 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-5 rounded-xl border border-white/10 bg-white/5">
        <h2 className="font-semibold mb-2">Sobre você</h2>
        <p className="text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{interp.narrative}</p>
      </div>

      <div className="p-4 rounded-xl border border-white/5 text-[11px] opacity-50 text-center leading-relaxed">
        Resultado é uma <em>sinalização</em> e não substitui acompanhamento profissional. Você pode
        contestar este resultado entrando em contato com o recrutador.
      </div>
    </div>
  );
}
