import Link from "next/link";

interface Props {
  active: "login" | "cadastro";
}

export function AuthTabs({ active }: Props) {
  const baseTab =
    "flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all";
  const activeTab = "bg-kavuka-black text-kavuka-yellow";
  const inactiveTab = "text-kavuka-gray-500 hover:text-kavuka-black";

  return (
    <div className="flex p-1 rounded-full mb-8 border border-kavuka-gray-200 bg-kavuka-gray-50">
      <Link
        href="/portal/login"
        className={`${baseTab} ${active === "login" ? activeTab : inactiveTab}`}
      >
        Entrar
      </Link>
      <Link
        href="/portal/cadastro"
        className={`${baseTab} ${active === "cadastro" ? activeTab : inactiveTab}`}
      >
        Criar conta
      </Link>
    </div>
  );
}
