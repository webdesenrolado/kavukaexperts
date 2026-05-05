/**
 * Folha imprimível A4 da KYID — visível APENAS em modo print (window.print()).
 * Layout otimizado pra 1 página em preto-no-branco com selo + QR.
 */

import { Fingerprint } from "lucide-react";

interface PrintSheetProps {
  candidateName: string;
  emittedAt: Date | null;
  updatedAt: Date | null;
  kyidUrl: string;
  qrSvg: string;
  scoreHumano: number | null;
  scoreBand: string | null;
  instrumentCount: number;
  bigFive: Record<string, { level: string }> | null;
  topStrengths: string[];
  topWatchouts: string[];
  mbti?: string | null;
  label?: string | null;
  archetype?: string | null;
  enneagram?: { type: number; type_name: string } | null;
  discProfile?: string | null;
}

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const DOMAIN: Record<string, { name: string; intensity: (lvl: string) => string }> = {
  O: { name: "Curiosidade e abertura", intensity: levelLabel },
  C: { name: "Organização e foco", intensity: levelLabel },
  E: { name: "Energia social", intensity: levelLabel },
  A: { name: "Cooperação", intensity: levelLabel },
  N: { name: "Sensibilidade emocional", intensity: levelLabel },
};

function levelLabel(lvl: string) {
  return lvl === "very_high" || lvl === "high"
    ? "Alto"
    : lvl === "very_low" || lvl === "low"
    ? "Baixo"
    : "Equilibrado";
}

export function KyidPrintSheet({
  candidateName,
  emittedAt,
  updatedAt,
  kyidUrl,
  qrSvg,
  scoreHumano,
  scoreBand,
  instrumentCount,
  bigFive,
  topStrengths,
  topWatchouts,
  mbti,
  label,
  archetype,
  enneagram,
  discProfile,
}: PrintSheetProps) {
  const shortUrl = kyidUrl.replace(/^https?:\/\//, "");

  return (
    <div className="kyid-print-sheet hidden print:block">
      <header className="kyid-print-header">
        <div className="kyid-print-logo">
          <span>K</span>
          <span className="kyid-print-id">ID</span>
        </div>
        <div className="kyid-print-title">
          <strong>Kavuka KYID</strong>
          <span>Conheça Sua Identidade</span>
        </div>
        <div className="kyid-print-meta">
          Emitida {fmt(emittedAt)} · Atualizada {fmt(updatedAt)}
        </div>
      </header>

      <h1 className="kyid-print-name">{candidateName}</h1>

      <div className="kyid-print-summary">
        {scoreHumano !== null && (
          <div className="kyid-print-stat">
            <span className="kyid-print-stat-label">Score Humano</span>
            <span className="kyid-print-stat-value kyid-print-stat-big">{scoreHumano}/100</span>
            {scoreBand && <span className="kyid-print-stat-sub">banda {scoreBand}</span>}
          </div>
        )}
        <div className="kyid-print-stat">
          <span className="kyid-print-stat-label">Avaliações</span>
          <span className="kyid-print-stat-value">{instrumentCount}/12</span>
          <span className="kyid-print-stat-sub">instrumentos</span>
        </div>
        {mbti && (
          <div className="kyid-print-stat">
            <span className="kyid-print-stat-label">MBTI</span>
            <span className="kyid-print-stat-value kyid-print-stat-mono">{mbti}</span>
          </div>
        )}
        {discProfile && (
          <div className="kyid-print-stat">
            <span className="kyid-print-stat-label">DISC</span>
            <span className="kyid-print-stat-value kyid-print-stat-mono">{discProfile}</span>
          </div>
        )}
        {label && (
          <div className="kyid-print-stat">
            <span className="kyid-print-stat-label">Label GUÉP</span>
            <span className="kyid-print-stat-value">{label}</span>
          </div>
        )}
        {archetype && (
          <div className="kyid-print-stat">
            <span className="kyid-print-stat-label">Arquétipo</span>
            <span className="kyid-print-stat-value">{archetype}</span>
          </div>
        )}
        {enneagram && (
          <div className="kyid-print-stat">
            <span className="kyid-print-stat-label">Eneagrama</span>
            <span className="kyid-print-stat-value">
              Tipo {enneagram.type} — {enneagram.type_name}
            </span>
          </div>
        )}
      </div>

      {bigFive && (
        <section className="kyid-print-section">
          <h2>Identidade base · Big Five</h2>
          <div className="kyid-print-bigfive">
            {Object.entries(DOMAIN).map(([k, m]) => {
              const lvl = bigFive[k]?.level;
              if (!lvl) return null;
              return (
                <div key={k} className="kyid-print-bigfive-row">
                  <span className="kyid-print-bigfive-name">{m.name}</span>
                  <span
                    className={`kyid-print-bigfive-level kyid-print-level-${
                      lvl === "very_high" || lvl === "high" ? "high" : lvl === "very_low" || lvl === "low" ? "low" : "mid"
                    }`}
                  >
                    {m.intensity(lvl)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {topStrengths.length > 0 && (
        <section className="kyid-print-section">
          <h2>Forças sinalizadas</h2>
          <ul className="kyid-print-list">
            {topStrengths.slice(0, 4).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {topWatchouts.length > 0 && (
        <section className="kyid-print-section">
          <h2>Áreas de crescimento</h2>
          <ul className="kyid-print-list">
            {topWatchouts.slice(0, 3).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="kyid-print-footer">
        <div className="kyid-print-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        <div className="kyid-print-footer-text">
          <strong>Verificação online:</strong>
          <span className="kyid-print-url">{shortUrl}</span>
          <p>
            Esta KYID pode ser verificada por qualquer pessoa apontando a câmera para o QR Code. Resultado é
            uma sinalização da identidade comportamental — não diagnóstico clínico. LGPD art. 20: titular
            tem direito a contestar decisão automatizada.
          </p>
        </div>
        <div className="kyid-print-watermark">
          <Fingerprint size={28} />
          <span>Kavuka KYID · GUÉP</span>
        </div>
      </footer>
    </div>
  );
}
