import Link from "next/link";
import { LoginClient } from "./login-client";
import { GoogleLoginButton } from "../google-login-button";
import { AuthTabs } from "../auth-tabs";
import { AuthShell } from "../auth-shell";

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
    <AuthShell>
      <div className="max-w-md mx-auto px-6 pt-12 pb-12">
        <div
          className="rounded-2xl p-7 backdrop-blur-xl border shadow-2xl"
          style={{
            background: "rgba(0,0,0,0.65)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <AuthTabs active="login" />

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
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-wider opacity-50">ou com email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          )}

          <LoginClient redirectTo={redirectTo} />

          <div className="text-xs opacity-60 mt-6 text-center">
            <Link href="/portal/recuperar" className="underline hover:opacity-100">
              Esqueci a senha
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
