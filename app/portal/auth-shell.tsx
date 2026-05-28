/**
 * Shell visual das páginas de auth do portal — paleta kavukavagas
 * (branco/preto/amarelo) com pattern de pontos sutil e blobs amarelos.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-kavuka-gray-50">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-kavuka-black) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-kavuka-yellow rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-kavuka-yellow rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
