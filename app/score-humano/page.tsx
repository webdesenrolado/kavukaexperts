import { AppShell } from "@/components/app-shell";
import { BrainCircuit } from "lucide-react";

export default function ScoreHumanoPage() {
  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Score Humano</h1>
        <p className="opacity-70 mb-8">Índice proprietário GUÉP que sintetiza as 6 camadas de avaliação em uma métrica explicável.</p>
        <div
          className="p-12 rounded-xl border text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <BrainCircuit size={36} className="mx-auto opacity-30 mb-3" />
          <h2 className="text-lg font-semibold">Disponível após o Marco 3 da pesquisa</h2>
          <p className="opacity-70 text-sm mt-1">
            Score Humano depende dos 12 instrumentos calibrados. Em desenvolvimento.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
