import { db } from "@/db";
import { candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { RedefinirClient } from "./redefinir-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Redefinir senha — Kavuka Experts" };

async function checkToken(token: string) {
  const c = await db.query.candidates.findFirst({
    where: eq(candidates.resetToken, token),
    columns: { id: true, name: true, email: true, resetTokenExpiresAt: true },
  });
  if (!c || !c.resetTokenExpiresAt) return { ok: false, reason: "invalid" as const };
  if (c.resetTokenExpiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" as const };
  }
  return { ok: true as const, name: c.name, email: c.email };
}

export default async function RedefinirPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const check = await checkToken(token);

  if (!check.ok) {
    return (
      <div className="max-w-md mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-2xl font-bold mb-2">
          {check.reason === "expired" ? "Link expirado" : "Link inválido"}
        </h1>
        <p className="text-sm opacity-70 mb-6">
          {check.reason === "expired"
            ? "Este link de redefinição já expirou. Solicite um novo."
            : "Este link não é válido ou já foi usado."}
        </p>
        <a
          href="/portal/recuperar"
          className="inline-block px-5 py-2.5 rounded-lg font-bold text-black"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }}
        >
          Solicitar novo link
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-12">
      <h1 className="text-2xl font-bold mb-1">Crie sua nova senha</h1>
      <p className="text-sm opacity-70 mb-6">
        Olá, <strong>{check.name?.split(" ")[0]}</strong>. Defina uma senha nova abaixo —
        você vai entrar automaticamente depois.
      </p>
      <RedefinirClient token={token} />
    </div>
  );
}
