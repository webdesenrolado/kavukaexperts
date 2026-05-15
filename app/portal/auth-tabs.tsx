import Link from "next/link";

interface Props {
  active: "login" | "cadastro";
}

export function AuthTabs({ active }: Props) {
  return (
    <div
      className="flex p-1 rounded-xl mb-6 border"
      style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.2)" }}
    >
      <Link
        href="/portal/login"
        className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-all ${
          active === "login"
            ? "text-black"
            : "opacity-60 hover:opacity-100"
        }`}
        style={
          active === "login"
            ? { background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }
            : undefined
        }
      >
        Entrar
      </Link>
      <Link
        href="/portal/cadastro"
        className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-all ${
          active === "cadastro"
            ? "text-black"
            : "opacity-60 hover:opacity-100"
        }`}
        style={
          active === "cadastro"
            ? { background: "linear-gradient(135deg, #ff6a00, #ffcc00)" }
            : undefined
        }
      >
        Cadastre-se grátis
      </Link>
    </div>
  );
}
