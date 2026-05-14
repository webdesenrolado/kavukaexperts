import Link from "next/link";
import { CadastroClient } from "./cadastro-client";
import { GoogleLoginButton } from "../google-login-button";

export const metadata = { title: "Cadastro — Kavuka Experts" };

export default function PortalCadastroPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-12">
      <h1 className="text-2xl font-bold mb-1">Crie sua conta</h1>
      <p className="text-sm opacity-70 mb-6">
        Cadastre-se para construir um currículo completo e participar de processos seletivos.
      </p>

      {googleClientId && (
        <>
          <div className="flex justify-center mb-4">
            <GoogleLoginButton clientId={googleClientId} redirectTo="/portal/me" text="signup_with" />
          </div>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[10px] uppercase tracking-wider opacity-50">ou cadastro tradicional</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
        </>
      )}

      <CadastroClient />
      <p className="text-xs opacity-60 mt-6 text-center">
        Já tem conta?{" "}
        <Link href="/portal/login" className="underline hover:opacity-100 opacity-90">
          Entrar
        </Link>
      </p>
    </div>
  );
}
