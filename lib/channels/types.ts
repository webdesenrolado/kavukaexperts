/**
 * Interface comum de todos os drivers de canal omnichannel.
 *
 * Cada canal (email, whatsapp baileys, instagram graph, etc) implementa este contrato.
 * O ciclo de vida e' gerenciado pelo lib/channels/registry.ts.
 */

export type ChannelKind = "email" | "whatsapp" | "instagram";

export interface InboundMessage {
  externalId?: string;            // ID na origem (uid IMAP, message id WA, etc) p/ dedupe
  contactHandle: string;          // email, e164, @user
  contactName?: string;
  contactAvatarUrl?: string;
  bodyText: string;
  sentAt: Date;
  threadKey?: string;             // chave de agrupamento (assunto normalizado p/ email, jid p/ WA)
}

export interface OutboundMessage {
  to: string;                     // mesmo handle do contato
  bodyText: string;
  subject?: string;               // p/ email
  replyToExternalId?: string;     // pra threading
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "qr"                          // baileys aguardando scan
  | "connected"
  | "error";

export interface ChannelDriverState {
  status: ConnectionStatus;
  qrDataUrl?: string;             // data:image/png;base64,... quando status='qr'
  lastError?: string;
  lastSyncAt?: Date;
}

export interface ChannelDriver {
  readonly channelId: string;
  readonly companyId: string;
  readonly kind: ChannelKind;

  start(): Promise<void>;
  stop(): Promise<void>;

  /** Estado em memoria — UI faz GET /api/channels/[id] periodicamente */
  getState(): ChannelDriverState;

  /** Forca uma busca por novas mensagens (usado pelo botao "Sync now" + polling) */
  pullInbound(): Promise<{ fetched: number }>;

  /** Envia mensagem outbound. Retorna externalId pra persistir em messages.externalId se quiser. */
  send(msg: OutboundMessage): Promise<{ externalId?: string }>;

  /** Teste de conectividade — usado pelo botao "Testar conexao" no settings. */
  test(): Promise<{ ok: boolean; detail?: string }>;
}

/** Callback que o driver chama quando recebe mensagem inbound. Implementado no registry. */
export type InboundHandler = (msg: InboundMessage) => Promise<void>;
