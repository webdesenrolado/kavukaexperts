import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function buildTransport(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export function getTransport(): Transporter | null {
  if (cached) return cached;
  cached = buildTransport();
  return cached;
}

export function emailFrom(): { name: string; address: string } | null {
  const address = process.env.SMTP_FROM_EMAIL;
  if (!address) return null;
  return {
    name: process.env.SMTP_FROM_NAME || "Kavuka Experts",
    address,
  };
}

export type SendOptions = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(opts: SendOptions): Promise<{ ok: boolean; reason?: string }> {
  const transport = getTransport();
  const from = emailFrom();
  if (!transport || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email/dev] SMTP não configurado — email seria enviado:");
      console.log("  to:", opts.to);
      console.log("  subject:", opts.subject);
      console.log("  text:", opts.text.slice(0, 200));
    }
    return { ok: false, reason: "SMTP_NOT_CONFIGURED" };
  }

  await transport.sendMail({
    from: { name: from.name, address: from.address },
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return { ok: true };
}

export function appBaseUrl(): string {
  return process.env.APP_BASE_URL || "http://2.24.85.36";
}
