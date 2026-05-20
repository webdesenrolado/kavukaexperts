/**
 * Email driver — IMAP polling (recebe) + SMTP (envia).
 *
 * Cada canal email tem credenciais isoladas em channels.config (criptografado).
 * Polling roda a cada N segundos via setInterval enquanto o driver esta started.
 * Persiste o ultimo UID processado no campo channels.config (lastUid) p/ nao reprocessar.
 */

import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer, { type Transporter } from "nodemailer";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptJson, encryptJson } from "@/lib/crypto";
import type { ChannelDriver, ChannelDriverState, OutboundMessage } from "./types";
import { persistInbound } from "./persist";

export interface EmailConfig {
  imapHost: string;
  imapPort: number;     // 993 normalmente
  imapSecure: boolean;  // true p/ 993
  smtpHost: string;
  smtpPort: number;     // 587 ou 465
  smtpSecure: boolean;  // true p/ 465
  user: string;
  pass: string;
  fromName?: string;
  lastUid?: number;     // ultimo UID processado
  pollIntervalSec?: number; // default 60
}

export const EMAIL_SECRET_KEYS: (keyof EmailConfig)[] = ["pass"];

export class EmailDriver implements ChannelDriver {
  readonly kind = "email" as const;
  private state: ChannelDriverState = { status: "disconnected" };
  private cfg: EmailConfig;
  private pollHandle: NodeJS.Timeout | null = null;
  private polling = false;

  constructor(
    public readonly channelId: string,
    public readonly companyId: string,
    encryptedConfig: string | null,
  ) {
    if (!encryptedConfig) throw new Error(`Canal email ${channelId} sem config`);
    this.cfg = decryptJson<EmailConfig>(encryptedConfig);
  }

  getState(): ChannelDriverState {
    return this.state;
  }

  async start(): Promise<void> {
    this.state = { status: "connecting" };
    const ok = await this.test();
    if (!ok.ok) {
      this.state = { status: "error", lastError: ok.detail };
      return;
    }
    this.state = { status: "connected" };
    // primeiro pull imediato + agenda recorrente
    this.pullInbound().catch((e) => console.error(`[email/${this.channelId}] pull falhou:`, e));
    const ms = (this.cfg.pollIntervalSec ?? 60) * 1000;
    this.pollHandle = setInterval(() => {
      this.pullInbound().catch((e) => console.error(`[email/${this.channelId}] pull falhou:`, e));
    }, ms);
  }

  async stop(): Promise<void> {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
    this.state = { status: "disconnected" };
  }

  async test(): Promise<{ ok: boolean; detail?: string }> {
    // Testa IMAP + SMTP
    try {
      const imap = this.makeImap();
      await imap.connect();
      await imap.logout();
    } catch (e: unknown) {
      return { ok: false, detail: `IMAP: ${describeError(e)}` };
    }
    try {
      const smtp = this.makeSmtp();
      await smtp.verify();
    } catch (e: unknown) {
      return { ok: false, detail: `SMTP: ${describeError(e)}` };
    }
    return { ok: true };
  }

  async pullInbound(): Promise<{ fetched: number }> {
    if (this.polling) return { fetched: 0 };
    this.polling = true;
    let fetched = 0;
    const imap = this.makeImap();
    try {
      await imap.connect();
      const lock = await imap.getMailboxLock("INBOX");
      try {
        const since = this.cfg.lastUid ? `${this.cfg.lastUid + 1}:*` : "1:*";
        // Se for primeira execucao, so pega ultimas 20 pra nao explodir
        const isFirstRun = !this.cfg.lastUid;
        let maxUid = this.cfg.lastUid ?? 0;

        for await (const msg of imap.fetch(since, { envelope: true, source: true, uid: true })) {
          if (isFirstRun && fetched >= 20) break;
          if (typeof msg.uid !== "number") continue;
          maxUid = Math.max(maxUid, msg.uid);
          const parsed = await simpleParser(msg.source as Buffer);
          const fromAddr = parsed.from?.value?.[0];
          if (!fromAddr?.address) continue;

          // Ignora emails do proprio usuario (loops)
          if (fromAddr.address.toLowerCase() === this.cfg.user.toLowerCase()) continue;

          await persistInbound(this.companyId, this.channelId, {
            externalId: `imap-${msg.uid}`,
            contactHandle: fromAddr.address.toLowerCase(),
            contactName: fromAddr.name || fromAddr.address,
            bodyText: (parsed.text || parsed.subject || "").slice(0, 5000),
            sentAt: parsed.date ?? new Date(),
            threadKey: parsed.subject?.replace(/^(re:|fwd?:)\s*/i, "").trim() || undefined,
          });
          fetched++;
        }

        if (maxUid > (this.cfg.lastUid ?? 0)) {
          this.cfg.lastUid = maxUid;
          await db
            .update(channels)
            .set({ config: encryptJson(this.cfg) })
            .where(eq(channels.id, this.channelId));
        }
      } finally {
        lock.release();
      }
      await imap.logout();
      this.state = { ...this.state, lastSyncAt: new Date() };
    } catch (e: unknown) {
      this.state = { ...this.state, lastError: describeError(e) };
      console.error(`[email/${this.channelId}] erro no pull:`, e);
    } finally {
      this.polling = false;
    }
    return { fetched };
  }

  async send(msg: OutboundMessage): Promise<{ externalId?: string }> {
    const smtp = this.makeSmtp();
    const info = await smtp.sendMail({
      from: { name: this.cfg.fromName || this.cfg.user, address: this.cfg.user },
      to: msg.to,
      subject: msg.subject || "(sem assunto)",
      text: msg.bodyText,
      html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(msg.bodyText)}</pre>`,
    });
    return { externalId: info.messageId };
  }

  private makeImap(): ImapFlow {
    return new ImapFlow({
      host: this.cfg.imapHost,
      port: this.cfg.imapPort,
      secure: this.cfg.imapSecure,
      auth: { user: this.cfg.user, pass: this.cfg.pass },
      logger: false,
    });
  }

  private makeSmtp(): Transporter {
    return nodemailer.createTransport({
      host: this.cfg.smtpHost,
      port: this.cfg.smtpPort,
      secure: this.cfg.smtpSecure,
      auth: { user: this.cfg.user, pass: this.cfg.pass },
    });
  }
}

/**
 * Extrai detalhes uteis de erros do ImapFlow / nodemailer.
 * ImapFlow expoe: code, response, responseText, responseStatus, authenticationFailed.
 * Nodemailer expoe: code, response, responseCode.
 */
function describeError(e: unknown): string {
  const err = e as Record<string, unknown> & { message?: string };
  const parts: string[] = [];
  if (err.authenticationFailed) parts.push("auth rejeitada pelo servidor");
  if (err.code) parts.push(`code=${err.code}`);
  if (err.responseStatus) parts.push(`status=${err.responseStatus}`);
  if (err.responseText) {
    parts.push(String(err.responseText).slice(0, 220));
  } else if (err.response) {
    parts.push(String(err.response).slice(0, 220));
  } else if (err.message) {
    parts.push(err.message);
  }
  if (parts.length === 0) parts.push("erro desconhecido");
  return parts.join(" · ");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
