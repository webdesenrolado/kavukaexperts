import Link from "next/link";
import { CadastroClient } from "./cadastro-client";

export const metadata = { title: "Cadastro — Kavuka Experts" };

export default function PortalCadastroPage() {
  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-12">
      <h1 className="text-2xl font-bold mb-1">Crie sua conta</h1>
      <p className="text-sm opacity-70 mb-6">
        Cadastre-se para construir um currículo completo e participar de processos seletivos.
      </p>
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
