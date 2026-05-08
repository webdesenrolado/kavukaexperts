import Link from "next/link";
import { LoginClient } from "./login-client";

export const metadata = { title: "Entrar — Kavuka Experts" };

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-12">
      <h1 className="text-2xl font-bold mb-1">Entrar no portal</h1>
      <p className="text-sm opacity-70 mb-6">
        Acesse seu painel para manter seu currículo sempre atualizado.
      </p>
      <LoginClient redirectTo={from || "/portal/me"} />
      <p className="text-xs opacity-60 mt-6 text-center">
        Não tem conta?{" "}
        <Link href="/portal/cadastro" className="underline hover:opacity-100 opacity-90">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
