"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (el: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface Props {
  /** Onde mandar o user depois de logar (default /portal/me) */
  redirectTo?: string;
  /** "signin_with" | "signup_with" | "continue_with" */
  text?: "signin_with" | "signup_with" | "continue_with";
  /** Largura do botão em px */
  width?: number;
  clientId: string | null;
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

export function GoogleLoginButton({
  redirectTo = "/portal/me",
  text = "signin_with",
  width = 320,
  clientId,
}: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega o script GIS uma única vez
  useEffect(() => {
    if (!clientId) return;
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      // já tá carregando, espera
      const check = setInterval(() => {
        if (window.google?.accounts?.id) {
          setScriptLoaded(true);
          clearInterval(check);
        }
      }, 100);
      return () => clearInterval(check);
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => setScriptLoaded(true);
    s.onerror = () => setError("Falha ao carregar Google Sign-In.");
    document.head.appendChild(s);
  }, [clientId]);

  // Inicializa e renderiza o botão quando script carregar
  useEffect(() => {
    if (!scriptLoaded || !clientId || !containerRef.current) return;

    async function handleCredential(response: { credential: string }) {
      try {
        const res = await fetch("/api/portal/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error || "Falha ao entrar com Google.");
          return;
        }
        router.push(redirectTo);
        router.refresh();
      } catch {
        setError("Erro de conexão.");
      }
    }

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
      ux_mode: "popup",
      auto_select: false,
    });

    window.google?.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text,
      shape: "rectangular",
      logo_alignment: "left",
      width,
    });
  }, [scriptLoaded, clientId, text, width, redirectTo, router]);

  if (!clientId) {
    // Sem CLIENT_ID = botão fica oculto. Mostra hint só em dev.
    if (process.env.NODE_ENV !== "production") {
      return (
        <div className="text-[10px] opacity-50 italic">
          [dev] Google Sign-In não ativado. Configure GOOGLE_CLIENT_ID em /.env.
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} />
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
