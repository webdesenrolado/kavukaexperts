/**
 * Registry global de drivers ativos. Singleton em memoria do processo Next.js.
 *
 * - Mantem 1 instancia de driver por channelId
 * - Inicia drivers automaticamente em startup (via instrumentation.ts)
 * - Permite ciclo de vida via APIs (start/stop/restart)
 */

import { db } from "@/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ChannelDriver } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __kavukaChannelRegistry: Map<string, ChannelDriver> | undefined;
}

function store(): Map<string, ChannelDriver> {
  if (!globalThis.__kavukaChannelRegistry) {
    globalThis.__kavukaChannelRegistry = new Map();
  }
  return globalThis.__kavukaChannelRegistry;
}

export function getDriver(channelId: string): ChannelDriver | undefined {
  return store().get(channelId);
}

export function listDrivers(): ChannelDriver[] {
  return Array.from(store().values());
}

export async function startDriverForChannel(channelId: string): Promise<ChannelDriver> {
  const existing = store().get(channelId);
  if (existing) return existing;

  const row = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  if (!row) throw new Error(`Canal ${channelId} nao encontrado`);

  // Email e Instagram exigem config — sem ela nao da pra instanciar.
  // WhatsApp/Baileys vive sem config inicial (ID e' descoberto apos QR scan).
  if ((row.kind === "email" || row.kind === "instagram") && !row.config) {
    throw new Error(
      `Canal ${row.kind} ${channelId} sem credenciais — abra /settings/integracoes pra configurar`,
    );
  }

  let driver: ChannelDriver;
  switch (row.kind) {
    case "email": {
      const { EmailDriver } = await import("./email-driver");
      driver = new EmailDriver(row.id, row.companyId, row.config);
      break;
    }
    case "whatsapp": {
      const { BaileysDriver } = await import("./baileys-driver");
      driver = new BaileysDriver(row.id, row.companyId, row.config);
      break;
    }
    case "instagram": {
      const { InstagramDriver } = await import("./instagram-driver");
      driver = new InstagramDriver(row.id, row.companyId, row.config);
      break;
    }
    default:
      throw new Error(`Kind ${row.kind} sem driver (canal ${channelId})`);
  }

  store().set(channelId, driver);
  // start() pode demorar (Baileys/IMAP). Nao bloqueia a chamada.
  driver.start().catch((err) => {
    console.error(`[channels] driver ${channelId} falhou ao iniciar:`, err);
  });
  return driver;
}

export async function stopDriverForChannel(channelId: string): Promise<void> {
  const driver = store().get(channelId);
  if (!driver) return;
  await driver.stop().catch((err) => {
    console.error(`[channels] driver ${channelId} falhou ao parar:`, err);
  });
  store().delete(channelId);
}

export async function bootAllConnectedChannels(): Promise<void> {
  console.log("[channels] boot — carregando canais conectados");
  const rows = await db.select().from(channels).where(eq(channels.connected, true));
  let started = 0;
  let skipped = 0;
  for (const row of rows) {
    // Skip canais nao-suportados ou sem config (sem barulho).
    if (!["email", "whatsapp", "instagram"].includes(row.kind)) {
      skipped++;
      continue;
    }
    if ((row.kind === "email" || row.kind === "instagram") && !row.config) {
      skipped++;
      continue;
    }
    try {
      await startDriverForChannel(row.id);
      started++;
    } catch (err) {
      console.error(`[channels] boot canal ${row.id} falhou:`, err);
    }
  }
  console.log(`[channels] boot — ${started} iniciado(s), ${skipped} pulado(s) (sem config ou kind nao suportado)`);
}
