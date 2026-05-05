import { Fingerprint, ShieldCheck } from "lucide-react";

interface KyidSealProps {
  candidateName: string;
  emittedAt: Date | null;
  updatedAt: Date | null;
  kyidUrl: string;
  qrSvg: string; // SVG inline string gerado server-side
  instrumentCount: number;
  scoreHumano: number | null;
}

const fmt = (d: Date | null) =>
  d
    ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export function KyidSeal({
  candidateName,
  emittedAt,
  updatedAt,
  kyidUrl,
  qrSvg,
  instrumentCount,
  scoreHumano,
}: KyidSealProps) {
  const shortUrl = kyidUrl.replace(/^https?:\/\//, "");

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden relative"
      style={{
        borderColor: "rgba(255,106,0,0.4)",
        background: "linear-gradient(135deg, rgba(255,106,0,0.08), rgba(255,204,0,0.04))",
      }}
    >
      {/* Watermark fingerprint */}
      <div
        className="absolute right-4 top-4 opacity-5 pointer-events-none"
        aria-hidden="true"
      >
        <Fingerprint size={120} />
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-center">
        <div
          className="rounded-xl p-3 bg-white shrink-0 mx-auto md:mx-0"
          style={{ width: 132, height: 132 }}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-[#10b981]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-bold">
              KYID Validada
            </span>
          </div>

          <h2 className="text-xl font-bold mb-1">{candidateName}</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-3 text-xs">
            <div>
              <div className="text-[9px] uppercase tracking-wider opacity-60">Emitida</div>
              <div className="font-mono">{fmt(emittedAt)}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider opacity-60">Atualizada</div>
              <div className="font-mono">{fmt(updatedAt)}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider opacity-60">Avaliações</div>
              <div className="font-mono">
                {instrumentCount}/12
              </div>
            </div>
            {scoreHumano !== null && (
              <div>
                <div className="text-[9px] uppercase tracking-wider opacity-60">Score Humano</div>
                <div className="font-mono font-bold text-[#10b981]">{scoreHumano}/100</div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
              Verificável em
            </div>
            <div className="text-[11px] font-mono opacity-90 break-all">{shortUrl}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
