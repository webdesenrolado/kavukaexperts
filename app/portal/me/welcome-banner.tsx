"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";

type Props = {
  candidateFirstName: string;
  recentJobTitle?: string | null;
};

export function WelcomeBanner({ candidateFirstName, recentJobTitle }: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const isWelcome = sp.get("welcome") === "1";
  const isFromApplication = !!recentJobTitle;

  useEffect(() => {
    if (!isWelcome && !isFromApplication) setVisible(false);
  }, [isWelcome, isFromApplication]);

  if (!visible || (!isWelcome && !isFromApplication)) return null;

  const close = () => {
    setVisible(false);
    if (isWelcome) {
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      router.replace(url.pathname + url.search);
    }
  };

  return (
    <section className="mb-10">
      <div className="relative overflow-hidden rounded-3xl bg-kavuka-black text-white p-8 sm:p-10">
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-kavuka-yellow rounded-full blur-3xl opacity-20" />
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-kavuka-yellow text-kavuka-black text-xs font-semibold">
            <Sparkles size={14} />
            {isFromApplication ? "Candidatura enviada" : "Bem-vindo à Kavuka"}
          </div>

          <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight">
            {isFromApplication ? (
              <>
                Boa, {candidateFirstName}! <br className="hidden sm:block" />
                <span className="text-kavuka-yellow">{recentJobTitle}</span> recebeu sua candidatura.
              </>
            ) : (
              <>
                Olá, {candidateFirstName}.<br className="hidden sm:block" />
                <span className="text-kavuka-yellow">Sua KYID começa aqui.</span>
              </>
            )}
          </h2>

          <p className="mt-4 text-base text-zinc-300 max-w-xl">
            {isFromApplication
              ? "Pra avançar no processo, complete suas avaliações e seu perfil. Quanto mais completo, melhor o match."
              : "Construa seu perfil, faça as avaliações comportamentais e candidate-se em 1 clique pra qualquer vaga aberta."}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="#perfil"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-kavuka-yellow text-kavuka-black font-semibold text-sm hover:scale-105 transition-transform"
            >
              Completar perfil
              <ArrowRight size={16} />
            </Link>
            <Link
              href="https://kavukavagas.com.br/vagas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-zinc-700 text-white font-medium text-sm hover:border-white transition-colors"
            >
              Ver mais vagas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
