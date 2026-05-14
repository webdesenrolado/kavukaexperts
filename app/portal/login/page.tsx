import Link from "next/link";
import { LoginClient } from "./login-client";
import { GoogleLoginButton } from "../google-login-button";

export const metadata = { title: "Entrar — Kavuka Experts" };

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
  const redirectTo = from || "/portal/me";
  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-12">
      <h1 className="text-2xl font-bold mb-1">Entrar no portal</h1>
      <p className="text-sm opacity-70 mb-6">
        Acesse seu painel para manter seu currículo sempre atualizado.
      </p>

      {googleClientId && (
        <>
          <div className="flex justify-center mb-4">
            <GoogleLoginButton clientId={googleClientId} redirectTo={redirectTo} text="signin_with" />
          </div>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[10px] uppercase tracking-wider opacity-50">ou com email</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
        </>
      )}

      <LoginClient redirectTo={redirectTo} />

      <div className="flex items-center justify-between text-xs opacity-60 mt-6">
        <Link href="/portal/recuperar" className="underline hover:opacity-100">
          Esqueci a senha
        </Link>
        <Link href="/portal/cadastro" className="underline hover:opacity-100">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
