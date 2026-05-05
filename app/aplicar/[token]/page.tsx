import { db } from "@/db";
import { invitations, candidates, assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IPIP_NEO_120_ITEMS } from "@/services/ipip-neo-120/src/items";
import { ApplyClient } from "./client";

export default async function AplicarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await db.query.invitations.findFirst({ where: eq(invitations.token, token) });

  if (!inv) {
    return <ErrorScreen title="Convite não encontrado" message="Verifique se o link está correto ou peça um novo ao recrutador." />;
  }
  if (inv.expiresAt && new Date(inv.expiresAt) < new Date() && inv.status !== "completed") {
    return <ErrorScreen title="Convite expirado" message="Este link já passou da data de validade. Entre em contato com o recrutador para receber um novo." />;
  }
  if (inv.status === "revoked") {
    return <ErrorScreen title="Convite cancelado" message="Este convite foi cancelado pelo recrutador." />;
  }

  const candidate = await db.query.candidates.findFirst({ where: eq(candidates.id, inv.candidateId) });
  if (!candidate) {
    return <ErrorScreen title="Candidato não encontrado" message="Algo deu errado com este convite. Fale com o recrutador." />;
  }

  // Verifica tempo limite (se já iniciou e estourou o tempo, mostra expirado)
  if (inv.startedAt && inv.timeLimitMinutes && inv.status !== "completed") {
    const deadline = new Date(inv.startedAt).getTime() + inv.timeLimitMinutes * 60 * 1000;
    if (Date.now() > deadline) {
      return <ErrorScreen title="Tempo esgotado" message={`O tempo de ${inv.timeLimitMinutes} minutos para responder essa avaliação já passou. Peça um novo convite ao recrutador.`} />;
    }
  }

  // Se já completou, busca o assessment e mostra o resultado
  let initialResult = null;
  if (inv.status === "completed" && inv.assessmentId) {
    const a = await db.query.assessments.findFirst({ where: eq(assessments.id, inv.assessmentId) });
    if (a) {
      initialResult = {
        scores: a.scoresJson ? JSON.parse(a.scoresJson) : null,
        interpretation: a.interpretationJson ? JSON.parse(a.interpretationJson) : null,
      };
    }
  }

  const items = IPIP_NEO_120_ITEMS.map((it) => ({ item_id: it.item_id, text: it.text }));

  return (
    <ApplyClient
      token={token}
      candidateName={candidate.name}
      instrument={inv.instrument}
      timeLimitMinutes={inv.timeLimitMinutes ?? 30}
      items={items}
      initialResult={initialResult}
      alreadyCompleted={inv.status === "completed"}
      kyidToken={candidate.kyidToken ?? null}
    />
  );
}

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, rgba(255,106,0,0.1), transparent 50%), #0a0a0b",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#ffcc00] flex items-center justify-center text-black font-black text-2xl">
          K
        </div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="opacity-70 text-sm">{message}</p>
      </div>
    </div>
  );
}
