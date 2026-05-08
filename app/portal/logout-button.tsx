"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      className="text-xs px-3 py-1.5 rounded-md border hover:bg-white/5 disabled:opacity-50"
      style={{ borderColor: "var(--border)" }}
    >
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
