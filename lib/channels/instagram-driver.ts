/**
 * Instagram DM driver — via Meta Graph API.
 *
 * Diferente dos outros 2 drivers, este e' "passivo": nao mantem socket aberto.
 * Inbound vem via webhook (rota /api/channels/webhooks/instagram).
 * Outbound chama POST https://graph.facebook.com/v23.0/me/messages.
 *
 * Requer setup externo no Meta Business:
 * 1. App business com Instagram Messaging product
 * 2. Conta IG profissional vinculada a Page do Facebook
 * 3. Webhook subscription apontando p/ /api/channels/webhooks/instagram
 * 4. Page Access Token de longa duracao
 */

import { decryptJson } from "@/lib/crypto";
import type { ChannelDriver, ChannelDriverState, OutboundMessage } from "./types";

export interface InstagramConfig {
  pageAccessToken: string;     // token longo da Page do Facebook
  igUserId: string;            // ID numerico da conta IG (nao o @)
  verifyToken: string;         // segredo da subscription do webhook
  graphVersion?: string;       // default "v23.0"
}

export const INSTAGRAM_SECRET_KEYS: (keyof InstagramConfig)[] = ["pageAccessToken", "verifyToken"];

export class InstagramDriver implements ChannelDriver {
  readonly kind = "instagram" as const;
  private state: ChannelDriverState = { status: "disconnected" };
  private cfg: InstagramConfig;

  constructor(
    public readonly channelId: string,
    public readonly companyId: string,
    encryptedConfig: string | null,
  ) {
    if (!encryptedConfig) throw new Error(`Canal instagram ${channelId} sem config`);
    this.cfg = decryptJson<InstagramConfig>(encryptedConfig);
  }

  getState(): ChannelDriverState {
    return this.state;
  }

  async start(): Promise<void> {
    // Driver Instagram nao mantem socket — apenas valida token via Graph.
    const ok = await this.test();
    this.state = ok.ok
      ? { status: "connected", lastSyncAt: new Date() }
      : { status: "error", lastError: ok.detail };
  }

  async stop(): Promise<void> {
    this.state = { status: "disconnected" };
  }

  async test(): Promise<{ ok: boolean; detail?: string }> {
    try {
      const v = this.cfg.graphVersion ?? "v23.0";
      const res = await fetch(
        `https://graph.facebook.com/${v}/${this.cfg.igUserId}?fields=id,username&access_token=${encodeURIComponent(this.cfg.pageAccessToken)}`,
      );
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, detail: `Graph ${res.status}: ${body.slice(0, 200)}` };
      }
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, detail: (e as Error).message };
    }
  }

  async pullInbound(): Promise<{ fetched: number }> {
    // Meta nao da endpoint de "puxar mensagens" — tudo via webhook push.
    return { fetched: 0 };
  }

  async send(msg: OutboundMessage): Promise<{ externalId?: string }> {
    const v = this.cfg.graphVersion ?? "v23.0";
    const res = await fetch(
      `https://graph.facebook.com/${v}/me/messages?access_token=${encodeURIComponent(this.cfg.pageAccessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: msg.to },
          message: { text: msg.bodyText },
          messaging_type: "RESPONSE",
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Instagram send ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = (await res.json()) as { message_id?: string };
    return { externalId: data.message_id };
  }

  // Helper exposto pra webhook handler validar o token de verificacao
  get verifyToken(): string {
    return this.cfg.verifyToken;
  }
}
