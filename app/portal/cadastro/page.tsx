import { CadastroClient } from "./cadastro-client";
import { GoogleLoginButton } from "../google-login-button";
import { AuthTabs } from "../auth-tabs";
import { AuthShell } from "../auth-shell";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Criar conta — Kavuka" };

export default async function PortalCadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; qr?: string }>;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
  const sp = await searchParams;
  const viaQr = sp.from === "qr" || sp.qr === "1";

  return (
    <AuthShell>
      <div className="max-w-md mx-auto px-6 pt-16 pb-20">
        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-wider uppercase text-kavuka-yellow">
            Portal do candidato
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-kavuka-black">
            Crie sua conta.
          </h1>
          <p className="mt-4 text-sm text-kavuka-gray-700">
            Construa sua KYID e candidate-se com 1 clique.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-kavuka-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <AuthTabs active="cadastro" />

          {viaQr && (
            <div className="rounded-xl p-4 mb-6 bg-kavuka-yellow-soft border border-kavuka-yellow">
              <div className="flex gap-3">
                <Sparkles
                  size={18}
                  className="text-kavuka-black flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-kavuka-black">
                    Boas-vindas à Kavuka
                  </p>
                  <p className="mt-1 text-xs text-kavuka-ink">
                    Em 2 minutos você cria sua conta. Depois, um tour curto
                    mostra como construir sua identidade profissional.
                  </p>
                </div>
              </div>
            </div>
          )}

          {googleClientId && (
            <>
              <div className="flex justify-center mb-4">
                <GoogleLoginButton
                  clientId={googleClientId}
                  redirectTo="/portal/me"
                  text="signup_with"
                />
              </div>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-kavuka-gray-200" />
                <span className="text-[10px] uppercase tracking-wider text-kavuka-gray-500">
                  ou com email
                </span>
                <div className="flex-1 h-px bg-kavuka-gray-200" />
              </div>
            </>
          )}

          <CadastroClient />
        </div>

        <p className="mt-8 text-center text-xs text-kavuka-gray-500">
          É empresa?{" "}
          <a
            href="https://gestor.kavuka.ai"
            className="text-kavuka-black font-medium hover:underline underline-offset-4"
          >
            Entrar como empresa
          </a>
        </p>
      </div>
    </AuthShell>
  );
}
