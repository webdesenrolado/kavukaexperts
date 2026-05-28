import Link from "next/link";
import { LoginClient } from "./login-client";
import { GoogleLoginButton } from "../google-login-button";
import { AuthTabs } from "../auth-tabs";
import { AuthShell } from "../auth-shell";

export const metadata = { title: "Entrar — Kavuka" };

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
      <div className="max-w-md mx-auto px-6 pt-16 pb-20">
        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-wider uppercase text-kavuka-yellow">
            Portal do candidato
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-kavuka-black">
            Bem-vindo de volta.
          </h1>
          <p className="mt-4 text-sm text-kavuka-gray-700">
            Acesse sua KYID, candidaturas e avaliações.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-kavuka-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <AuthTabs active="login" />

          {googleClientId && (
            <>
              <div className="flex justify-center mb-4">
                <GoogleLoginButton
                  clientId={googleClientId}
                  redirectTo={redirectTo}
                  text="signin_with"
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

          <LoginClient redirectTo={redirectTo} />

          <div className="text-xs text-kavuka-gray-500 mt-6 text-center">
            <Link
              href="/portal/recuperar"
              className="text-kavuka-black hover:underline underline-offset-4"
            >
              Esqueci minha senha
            </Link>
          </div>
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
