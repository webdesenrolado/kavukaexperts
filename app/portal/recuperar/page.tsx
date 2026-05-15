import Link from "next/link";
import { RecuperarClient } from "./recuperar-client";
import { AuthShell } from "../auth-shell";

export const metadata = { title: "Recuperar senha — Kavuka Experts" };

export default function PortalRecuperarPage() {
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
          <h1 className="text-2xl font-bold mb-1">Esqueci a senha</h1>
          <p className="text-sm opacity-70 mb-6">
            Digite o email da sua conta. Vamos enviar um link para você criar uma nova senha.
          </p>
          <RecuperarClient />
          <p className="text-xs opacity-60 mt-6 text-center">
            Lembrou a senha?{" "}
            <Link href="/portal/login" className="underline hover:opacity-100 opacity-90">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
