import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "Obrigado — Avaliação NR-1" };

export default function ObrigadoPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div
        className="max-w-md w-full border rounded-2xl p-8 text-center"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
          }}
        >
          <CheckCircle2 size={32} className="text-[#10b981]" />
        </div>
        <h1 className="text-xl font-bold mb-2">Resposta enviada com sucesso</h1>
        <p className="text-sm opacity-80 leading-relaxed">
          Obrigado pela sua participação. Suas respostas vão ajudar a melhorar o ambiente de trabalho
          e o cumprimento da NR-1 na sua empresa.
        </p>
        <p className="text-xs opacity-60 mt-4">
          Você pode fechar esta janela.
        </p>
      </div>
    </div>
  );
}
