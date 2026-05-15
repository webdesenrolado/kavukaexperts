"use client";

import { useEffect, useState, useCallback } from "react";

export interface TourStep {
  /** valor do data-tour no elemento âncora */
  anchor: string;
  title: string;
  body: string;
  /** Onde posicionar o balão em relação ao elemento (default: auto) */
  placement?: "top" | "bottom" | "auto";
  /** Tab pra ativar antes de mostrar este step (se aplicável) */
  activateTab?: string;
}

const STEPS: TourStep[] = [
  {
    anchor: "avatar",
    title: "Comece pela foto",
    body:
      "Sua foto humaniza a candidatura. Toque no avatar pra subir uma imagem — ela aparece no seu Currículo ICH.",
    placement: "bottom",
  },
  {
    anchor: "completude",
    title: "Acompanhe seu progresso",
    body:
      "Esta barra mostra o quanto do seu perfil está preenchido. Quanto mais completo, mais relevante você fica nas buscas.",
    placement: "bottom",
  },
  {
    anchor: "curriculo-ich",
    title: "Seu Currículo ICH",
    body:
      "ICH é a Identidade de Conhecimento e Habilidades — um currículo dinâmico com seus dados, habilidades e perfil comportamental. Você pode imprimir ou compartilhar quando quiser.",
    placement: "bottom",
  },
  {
    anchor: "tabs",
    title: "Preencha cada seção",
    body:
      "Navegue pelas abas: Perfil, Experiência, Formação, Skills e Idiomas. Pode preencher na ordem que preferir.",
    placement: "bottom",
  },
  {
    anchor: "avaliacoes-tab",
    title: "Faça as avaliações",
    body:
      "Aqui ficam as 4 avaliações comportamentais. Elas alimentam seu Score Humano e revelam seu arquétipo dominante. Comece pela mais curta (Arquétipos, 5-10 min).",
    placement: "bottom",
    activateTab: "avaliacoes",
  },
];

interface Props {
  candidateId: string;
  /** Se true, abre direto o modal de welcome (vindo de ?welcome=1) */
  forceOpen?: boolean;
  /** Callback pra ativar uma tab no parent quando step pede */
  onRequestTab?: (tabKey: string) => void;
}

type Phase = "closed" | "welcome" | "running" | "done";

function tourStorageKey(candidateId: string) {
  return `kavuka_tour_completed:${candidateId}`;
}

export function PortalTour({ candidateId, forceOpen, onRequestTab }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [stepIndex, setStepIndex] = useState(0);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  // Decide se deve abrir no mount
  useEffect(() => {
    let shouldOpen = false;
    try {
      const completed = localStorage.getItem(tourStorageKey(candidateId));
      const pending = localStorage.getItem("kavuka_show_tour");
      if (forceOpen && !completed) shouldOpen = true;
      else if (pending === "1" && !completed) shouldOpen = true;
    } catch {}

    if (shouldOpen) {
      setPhase("welcome");
      try {
        localStorage.removeItem("kavuka_show_tour");
      } catch {}
      // limpa o ?welcome=1 da URL sem reload
      if (typeof window !== "undefined" && window.location.search.includes("welcome")) {
        const url = new URL(window.location.href);
        url.searchParams.delete("welcome");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [candidateId, forceOpen]);

  // Posiciona âncora a cada step
  const updateRect = useCallback(() => {
    if (phase !== "running") return;
    const step = STEPS[stepIndex];
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.anchor}"]`);
    if (!el) {
      setAnchorRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    // Pequeno delay pro scroll terminar antes de medir
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      setAnchorRect(r);
    }, 320);
  }, [phase, stepIndex]);

  useEffect(() => {
    if (phase !== "running") return;
    const step = STEPS[stepIndex];
    if (step?.activateTab && onRequestTab) onRequestTab(step.activateTab);
    updateRect();
    const onResize = () => updateRect();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [phase, stepIndex, onRequestTab, updateRect]);

  function startTour() {
    setStepIndex(0);
    setPhase("running");
  }

  function skipTour() {
    try {
      localStorage.setItem(tourStorageKey(candidateId), new Date().toISOString());
    } catch {}
    setPhase("closed");
  }

  function nextStep() {
    if (stepIndex >= STEPS.length - 1) {
      try {
        localStorage.setItem(tourStorageKey(candidateId), new Date().toISOString());
      } catch {}
      setPhase("done");
      setTimeout(() => setPhase("closed"), 2400);
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function prevStep() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  if (phase === "closed") return null;

  // ===== Modal de boas-vindas =====
  if (phase === "welcome") {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)" }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="max-w-md w-full rounded-2xl border p-6 sm:p-7"
          style={{
            background: "linear-gradient(135deg,#1a1a1a,#0a0a0a)",
            borderColor: "rgba(255,106,0,0.4)",
            color: "#fff",
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2">
            Bem-vindo(a) à Kavuka
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-3">
            Sua identidade profissional começa aqui
          </h2>
          <p className="text-sm opacity-80 leading-relaxed mb-5">
            Aqui você constrói seu <strong>Currículo ICH</strong> — uma identidade de conhecimento
            e habilidades que vai muito além do currículo tradicional. Em poucos minutos podemos
            mostrar como cada parte funciona.
          </p>

          <div
            className="rounded-lg p-3 mb-5 text-xs border"
            style={{
              background: "rgba(255,106,0,0.10)",
              borderColor: "rgba(255,106,0,0.25)",
            }}
          >
            <strong className="block text-white mb-1">Quer um tour guiado de 2 minutos?</strong>
            <span className="opacity-75">
              Mostro onde colocar foto, como funcionam as avaliações comportamentais e onde fica seu
              Currículo ICH. Você pode pular a qualquer momento.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={startTour}
              className="flex-1 py-3 rounded-lg font-bold text-black text-sm"
              style={{ background: "linear-gradient(135deg,#ff6a00,#ffcc00)" }}
            >
              Fazer tour guiado
            </button>
            <button
              onClick={skipTour}
              className="flex-1 py-3 rounded-lg font-medium text-sm border"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}
            >
              Vou explorar sozinho(a)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Final feliz =====
  if (phase === "done") {
    return (
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] rounded-xl px-5 py-3 text-sm font-semibold shadow-2xl"
        style={{
          background: "linear-gradient(135deg,#10b981,#059669)",
          color: "#fff",
        }}
      >
        ✓ Tour concluído · bom preenchimento!
      </div>
    );
  }

  // ===== Tour rodando — spotlight + balão =====
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <>
      {/* Overlay com recorte (spotlight) */}
      <div
        className="fixed inset-0 z-[180] pointer-events-none"
        style={{
          background: "rgba(0,0,0,0.65)",
          ...(anchorRect
            ? {
                clipPath: `polygon(
                  0% 0%,
                  0% 100%,
                  ${anchorRect.left - 8}px 100%,
                  ${anchorRect.left - 8}px ${anchorRect.top - 8}px,
                  ${anchorRect.right + 8}px ${anchorRect.top - 8}px,
                  ${anchorRect.right + 8}px ${anchorRect.bottom + 8}px,
                  ${anchorRect.left - 8}px ${anchorRect.bottom + 8}px,
                  ${anchorRect.left - 8}px 100%,
                  100% 100%,
                  100% 0%
                )`,
              }
            : {}),
        }}
      />
      {/* Anel sobre o elemento ancorado */}
      {anchorRect && (
        <div
          className="fixed z-[181] pointer-events-none rounded-xl"
          style={{
            top: anchorRect.top - 6,
            left: anchorRect.left - 6,
            width: anchorRect.width + 12,
            height: anchorRect.height + 12,
            border: "2px solid #ff6a00",
            boxShadow: "0 0 0 4px rgba(255,106,0,0.25)",
          }}
        />
      )}

      {/* Balão */}
      <TourBalloon
        step={step}
        rect={anchorRect}
        index={stepIndex}
        total={STEPS.length}
        isLast={isLast}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
      />
    </>
  );
}

function TourBalloon({
  step,
  rect,
  index,
  total,
  isLast,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TourStep;
  rect: DOMRect | null;
  index: number;
  total: number;
  isLast: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number; placement: "top" | "bottom"; mobile: boolean }>({
    top: 0,
    left: 0,
    placement: "bottom",
    mobile: false,
  });

  useEffect(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;
    const isMobile = vw < 640;

    if (!rect || isMobile) {
      setPos({ top: 0, left: 0, placement: "bottom", mobile: true });
      return;
    }

    const balloonW = 360;
    const balloonH = 200; // estimativa
    const margin = 16;
    const spaceBelow = vh - rect.bottom;
    const placement: "top" | "bottom" =
      step.placement === "top"
        ? "top"
        : step.placement === "bottom"
          ? "bottom"
          : spaceBelow > balloonH + margin
            ? "bottom"
            : "top";

    const top =
      placement === "bottom"
        ? rect.bottom + 14
        : Math.max(margin, rect.top - balloonH - 14);

    const wantLeft = rect.left + rect.width / 2 - balloonW / 2;
    const left = Math.max(margin, Math.min(vw - balloonW - margin, wantLeft));

    setPos({ top, left, placement, mobile: false });
  }, [rect, step.placement]);

  return (
    <div
      className={
        pos.mobile
          ? "fixed left-3 right-3 bottom-3 z-[182] rounded-xl border p-4 shadow-2xl"
          : "fixed z-[182] rounded-xl border p-4 shadow-2xl"
      }
      style={
        pos.mobile
          ? {
              background: "linear-gradient(135deg,#1a1a1a,#0a0a0a)",
              borderColor: "rgba(255,106,0,0.45)",
              color: "#fff",
            }
          : {
              top: pos.top,
              left: pos.left,
              width: 360,
              background: "linear-gradient(135deg,#1a1a1a,#0a0a0a)",
              borderColor: "rgba(255,106,0,0.45)",
              color: "#fff",
            }
      }
      role="dialog"
      aria-modal="false"
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,106,0,0.18)", color: "#ffcc66" }}
        >
          Passo {index + 1} de {total}
        </span>
        <button
          onClick={onSkip}
          className="text-[10px] opacity-60 hover:opacity-100 underline"
        >
          pular tour
        </button>
      </div>

      <h3 className="font-bold text-base leading-tight mb-1.5">{step.title}</h3>
      <p className="text-[12.5px] opacity-85 leading-relaxed mb-4">{step.body}</p>

      <div className="flex items-center gap-2">
        {index > 0 && (
          <button
            onClick={onPrev}
            className="px-3 py-2 rounded-lg text-xs font-medium border"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}
          >
            ← Anterior
          </button>
        )}
        <button
          onClick={onNext}
          className="ml-auto px-4 py-2 rounded-lg text-xs font-bold text-black"
          style={{ background: "linear-gradient(135deg,#ff6a00,#ffcc00)" }}
        >
          {isLast ? "Concluir" : "Próximo →"}
        </button>
      </div>

      {/* Indicador de progresso */}
      <div className="mt-3 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              background: i <= index ? "#ff6a00" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
