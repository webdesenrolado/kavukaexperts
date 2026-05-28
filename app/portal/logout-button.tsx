"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        setLoading(true);
        await fetch("/api/portal/auth/logout", { method: "POST" });
        router.push("/portal/login");
        router.refresh();
      }}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-kavuka-gray-200 text-kavuka-gray-700 hover:border-kavuka-black hover:text-kavuka-black transition-colors disabled:opacity-50"
    >
      <LogOut size={14} />
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
