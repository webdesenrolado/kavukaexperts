"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Job {
  id: string;
  title: string;
  candidateCount: number;
}

export function JobSwitcher({ currentId, jobs }: { currentId: string; jobs: Job[] }) {
  const router = useRouter();
  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentId}
        onChange={(e) => router.push(`/vagas/${e.target.value}/kanban`)}
        className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
        title="Trocar de vaga"
      >
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title} · {j.candidateCount}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 pointer-events-none opacity-60" />
    </div>
  );
}
