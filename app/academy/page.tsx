import { AppShell } from "@/components/app-shell";
import { GraduationCap } from "lucide-react";

export default function AcademyPage() {
  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Academy Kavuka</h1>
        <p className="opacity-70 mb-8">Trilhas de aprendizado recomendadas a partir das lacunas mapeadas pelos diagnósticos.</p>
        <div
          className="p-12 rounded-xl border text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <GraduationCap size={36} className="mx-auto opacity-30 mb-3" />
          <h2 className="text-lg font-semibold">Próxima fase do produto</h2>
          <p className="opacity-70 text-sm mt-1">
            Conecta diagnósticos comportamentais a trilhas de evolução individual.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
