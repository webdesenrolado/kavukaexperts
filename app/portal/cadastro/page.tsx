import { CadastroClient } from "./cadastro-client";
import { GoogleLoginButton } from "../google-login-button";
import { AuthTabs } from "../auth-tabs";

export const metadata = { title: "Cadastre-se — Kavuka Experts" };

export default function PortalCadastroPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-12">
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
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[10px] uppercase tracking-wider opacity-50">ou com email</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
        </>
      )}

      <CadastroClient />
    </div>
  );
}
