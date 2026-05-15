"use client";
import Link from "next/link";
import { ArrowLeft, Heart, Coffee, Clock, Brain } from "lucide-react";

interface IntroScreenProps {
  candidateId: string;
  candidateName: string;
  instrumentName: string;
  itemsLabel: string; // ex: "120 adjetivos", "24 blocos", "120 afirmações"
  durationLabel: string; // ex: "15-20 minutos"
  description: string; // breve do que o candidato vai fazer
  onStart: () => void;
}

export function IntroScreen({
  candidateId,
  candidateName,
  instrumentName,
  itemsLabel,
  durationLabel,
  description,
  onStart,
}: IntroScreenProps) {
  return (
    <div
      className="min-h-screen flex items-start justify-center p-4 pt-6 sm:pt-12 pb-8"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-2xl w-full">
        <Link
          href={`/candidatos/${candidateId}`}
          className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100 mb-4"
        >
          <ArrowLeft size={12} /> Voltar
        </Link>

        <div
          className="rounded-2xl border p-5 sm:p-6 mb-4"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(135deg, rgba(255,106,0,0.06), rgba(255,204,0,0.02))",
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">
            Avaliação comportamental
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">{instrumentName}</h1>
          <p className="text-sm opacity-80 leading-relaxed">
            Olá, <strong>{candidateName}</strong>. {description} Você vai responder{" "}
            <strong>{itemsLabel}</strong>. Leva cerca de <strong>{durationLabel}</strong>.
          </p>
        </div>

        <div
          className="rounded-2xl border p-5 sm:p-6 mb-4"
          style={{
            borderColor: "rgba(255,106,0,0.4)",
            background: "rgba(255,106,0,0.05)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-[#ff6a00]" />
            <h2 className="font-bold text-lg">Antes de começar</h2>
          </div>
          <p className="text-sm opacity-90 leading-relaxed mb-4">
            O resultado depende do seu{" "}
            <strong>estado emocional no momento da resposta</strong>. Para que o perfil seja
            fiel a quem você é (e não a como você está agora), siga estas recomendações:
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Brain size={16} className="text-[#ff6a00] shrink-0 mt-0.5" />
              <div>
                <strong>Esteja com a cabeça tranquila.</strong> Se você acabou de receber
                notícia difícil, brigou com alguém, ou está sob estresse agudo,{" "}
                <strong>adie</strong> a avaliação. O ideal é fazer em um dia comum.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={16} className="text-[#ff6a00] shrink-0 mt-0.5" />
              <div>
                <strong>Reserve tempo sem pressa.</strong> {durationLabel} sem interrupção. Se
                precisar parar, suas respostas até então não são salvas — melhor fazer de uma
                vez.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Coffee size={16} className="text-[#ff6a00] shrink-0 mt-0.5" />
              <div>
                <strong>Ambiente calmo.</strong> De preferência num lugar silencioso, com
                água ou café por perto. Evite responder no transporte ou no meio de reunião.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#ff6a00] shrink-0 mt-0.5 font-bold">⟳</span>
              <div>
                <strong>Vá com a primeira impressão.</strong> Não passe muito tempo em cada
                item. A resposta mais espontânea costuma ser a mais fiel.
              </div>
            </li>
          </ul>
        </div>

        <div
          className="rounded-2xl border p-5 mb-6 text-xs opacity-80 leading-relaxed"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <strong>Sobre a privacidade:</strong> seus resultados são confidenciais e usados
          apenas para o processo seletivo da empresa que solicitou. Você pode pedir revisão
          humana de qualquer interpretação automática (LGPD art. 20). Os dados não são
          vendidos a terceiros.
        </div>

        <button
          onClick={onStart}
          className="w-full py-3 rounded-lg font-bold text-black text-base shadow-xl"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          Estou tranquilo(a), vamos começar
        </button>
      </div>
    </div>
  );
}
