import { CadastroClient } from "./cadastro-client";
import { GoogleLoginButton } from "../google-login-button";
import { AuthTabs } from "../auth-tabs";
import { AuthShell } from "../auth-shell";

export const metadata = { title: "Cadastre-se — Kavuka Experts" };

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
      <div className="max-w-md mx-auto px-6 pt-12 pb-12">
        <div
          className="rounded-2xl p-7 backdrop-blur-xl border shadow-2xl"
          style={{
            background: "rgba(0,0,0,0.65)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <AuthTabs active="cadastro" />

          {viaQr && (
            <div
              className="rounded-lg p-3 mb-4 text-xs border"
              style={{
                background: "rgba(255,106,0,0.10)",
                borderColor: "rgba(255,106,0,0.30)",
                color: "#ffd699",
              }}
            >
              <strong className="block text-sm text-white mb-0.5">Boas-vindas à Kavuka</strong>
              Em 2 minutos você cria sua conta. Logo depois, um tour curto mostra como construir
              sua identidade profissional.
            </div>
          )}

          <h1 className="text-2xl font-bold mb-1">Crie sua conta grátis</h1>
          <p className="text-sm opacity-70 mb-6">
            Construa seu Currículo ICH e participe de processos seletivos no Brasil inteiro.
          </p>

          {googleClientId && (
            <>
              <div className="flex justify-center mb-4">
                <GoogleLoginButton clientId={googleClientId} redirectTo="/portal/me" text="signup_with" />
              </div>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-wider opacity-50">ou com email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          )}

          <CadastroClient />
        </div>
      </div>
    </AuthShell>
  );
}
