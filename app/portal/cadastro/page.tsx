import { CadastroClient } from "./cadastro-client";
import { GoogleLoginButton } from "../google-login-button";
import { AuthTabs } from "../auth-tabs";
import { AuthShell } from "../auth-shell";

export const metadata = { title: "Cadastre-se — Kavuka Experts" };

export default function PortalCadastroPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
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
