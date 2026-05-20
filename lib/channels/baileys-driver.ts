/**
 * WhatsApp driver via Baileys (lib nao-oficial WA Web).
 *
 * Sessao por canal armazenada em ./data/baileys/{channelId}/.
 * Estado de conexao + QR exposto via getState() pra UI mostrar o QR ao vivo.
 *
 * Comportamento:
 * - start() abre o socket. Se nao tem auth salva, emite QR e fica em status='qr'.
 * - apos scan, status='connected'.
 * - reconect automatico em quedas (exceto se for logout explicito = 401).
 */

import path from "path";
import fs from "fs/promises";
import qrcode from "qrcode";
import { decryptJson } from "@/lib/crypto";
import type { ChannelDriver, ChannelDriverState, OutboundMessage } from "./types";
import { persistInbound } from "./persist";

export interface BaileysConfig {
  displayName?: string;       // ex: "WhatsApp Recrutamento"
  identifier?: string;        // sera preenchido apos conectar (numero E.164)
}

export class BaileysDriver implements ChannelDriver {
  readonly kind = "whatsapp" as const;
  private state: ChannelDriverState = { status: "disconnected" };
  private cfg: BaileysConfig;
  private sock: any | null = null;
  private stopRequested = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(
    public readonly channelId: string,
    public readonly companyId: string,
    encryptedConfig: string | null,
  ) {
    this.cfg = encryptedConfig ? decryptJson<BaileysConfig>(encryptedConfig) : {};
  }

  getState(): ChannelDriverState {
    return this.state;
  }

  async start(): Promise<void> {
    this.stopRequested = false;
    await this.connect();
  }

  async stop(): Promise<void> {
    this.stopRequested = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.sock) {
      try {
        await this.sock.logout?.();
      } catch {
        // ignore — sock pode estar em estado ruim
      }
      try {
        this.sock.end?.(undefined);
      } catch {
        // ignore
      }
      this.sock = null;
    }
    this.state = { status: "disconnected" };
  }

  async test(): Promise<{ ok: boolean; detail?: string }> {
    if (this.state.status === "connected") return { ok: true };
    return { ok: false, detail: `status=${this.state.status}` };
  }

  async pullInbound(): Promise<{ fetched: number }> {
    // Baileys e push-based via evento messages.upsert. Pull manual nao se aplica.
    this.state = { ...this.state, lastSyncAt: new Date() };
    return { fetched: 0 };
  }

  async send(msg: OutboundMessage): Promise<{ externalId?: string }> {
    if (!this.sock || this.state.status !== "connected") {
      throw new Error(`WhatsApp ${this.channelId} nao conectado (status=${this.state.status})`);
    }
    const jid = toJid(msg.to);
    const sent = await this.sock.sendMessage(jid, { text: msg.bodyText });
    return { externalId: sent?.key?.id };
  }

  private async authFolder(): Promise<string> {
    const folder = path.join(process.cwd(), "data", "baileys", this.channelId);
    await fs.mkdir(folder, { recursive: true });
    return folder;
  }

  private async connect(): Promise<void> {
    if (this.stopRequested) return;
    this.state = { status: "connecting" };
    try {
      // Import dinamico — baileys e' ESM puro
      const baileysMod = await import("@whiskeysockets/baileys");
      const makeWASocket = baileysMod.default;
      const { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = baileysMod;

      const folder = await this.authFolder();
      const { state: authState, saveCreds } = await useMultiFileAuthState(folder);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        auth: authState,
        printQRInTerminal: false,
        logger: silentLogger() as any,
        browser: ["Kavuka Experts", "Chrome", "1.0.0"],
      });

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
          const qrDataUrl = await qrcode.toDataURL(qr);
          this.state = { status: "qr", qrDataUrl };
          console.log(`[baileys/${this.channelId}] QR gerado`);
        }
        if (connection === "open") {
          const me = sock.user?.id?.split(":")[0]?.split("@")[0];
          this.state = { status: "connected", lastSyncAt: new Date() };
          if (me) this.cfg.identifier = me;
          console.log(`[baileys/${this.channelId}] conectado como ${me}`);
        }
        if (connection === "close") {
          const code = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = code !== DisconnectReason.loggedOut;
          this.state = {
            status: "error",
            lastError: `connection closed (code=${code})`,
          };
          this.sock = null;
          if (shouldReconnect && !this.stopRequested) {
            console.log(`[baileys/${this.channelId}] reconectando em 5s...`);
            this.reconnectTimer = setTimeout(() => this.connect(), 5000);
          } else {
            console.log(`[baileys/${this.channelId}] desconectado definitivamente (loggedOut)`);
          }
        }
      });

      sock.ev.on("messages.upsert", async (m: any) => {
        if (m.type !== "notify") return;
        for (const wam of m.messages) {
          try {
            if (!wam.message) continue;
            if (wam.key.fromMe) continue; // nao processa eco das proprias
            const jid = wam.key.remoteJid as string | undefined;
            if (!jid || jid.endsWith("@g.us") || jid.endsWith("@broadcast")) continue; // ignora grupos/broadcast por enquanto

            const handle = jid.split("@")[0];
            const text =
              wam.message.conversation ??
              wam.message.extendedTextMessage?.text ??
              wam.message.imageMessage?.caption ??
              wam.message.videoMessage?.caption ??
              "[mensagem nao-textual]";

            await persistInbound(this.companyId, this.channelId, {
              externalId: wam.key.id,
              contactHandle: handle,
              contactName: wam.pushName || handle,
              bodyText: text,
              sentAt: new Date((wam.messageTimestamp ?? Math.floor(Date.now() / 1000)) * 1000),
            });
          } catch (err) {
            console.error(`[baileys/${this.channelId}] erro processando msg:`, err);
          }
        }
      });

      this.sock = sock;
    } catch (e: unknown) {
      this.state = { status: "error", lastError: (e as Error).message };
      console.error(`[baileys/${this.channelId}] erro ao conectar:`, e);
      if (!this.stopRequested) {
        this.reconnectTimer = setTimeout(() => this.connect(), 10000);
      }
    }
  }
}

function toJid(handle: string): string {
  if (handle.includes("@")) return handle;
  // remove tudo que nao for digito
  const digits = handle.replace(/\D+/g, "");
  return `${digits}@s.whatsapp.net`;
}

function silentLogger() {
  const noop = () => {};
  return {
    fatal: noop,
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
    trace: noop,
    level: "silent",
    child() {
      return this;
    },
  };
}
