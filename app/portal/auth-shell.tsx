/**
 * Shell visual das páginas de autenticação do portal do candidato.
 * Reusa o background de rostos do login do recrutador, com opacidade maior
 * pra ficar mais presente.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Fundo de rostos */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/brand/login-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.45,
          filter: "saturate(0.9)",
        }}
      />
      {/* Overlay com gradiente Kavuka pra manter contraste do card */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(255,106,0,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,204,0,0.10), transparent 60%), linear-gradient(180deg, rgba(10,10,11,0.55), rgba(10,10,11,0.80))",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
