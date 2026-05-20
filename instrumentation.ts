/**
 * Next.js instrumentation hook — roda 1 vez no startup do server.
 * Carrega drivers de canais omnichannel (Email IMAP polling, WhatsApp Baileys, Instagram passivo).
 *
 * Importante: roda no runtime Node.js (nao Edge).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Evita boot durante build estatico
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  try {
    const { bootAllConnectedChannels } = await import("./lib/channels/registry");
    await bootAllConnectedChannels();
  } catch (err) {
    console.error("[instrumentation] falha ao iniciar canais:", err);
  }
}
