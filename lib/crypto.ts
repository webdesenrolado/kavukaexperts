import crypto from "crypto";

// Deriva chave de 32 bytes a partir do AUTH_SECRET (ja existente p/ JWT).
// Sem AUTH_SECRET, nao tem como criptografar — falha rapido em vez de armazenar em claro.
function key(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET nao configurado — necessario p/ criptografar credenciais de canais");
  return crypto.createHash("sha256").update(secret).digest();
}

// Formato: base64(iv(12) || authTag(16) || ciphertext)
export function encryptJson(value: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptJson<T = unknown>(encoded: string): T {
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

// Sanitiza um objeto de config pra exibir no front (mascara campos sensiveis).
export function maskConfig<T extends Record<string, unknown>>(config: T, secretKeys: (keyof T)[]): T {
  const out: Record<string, unknown> = { ...config };
  for (const k of secretKeys) {
    if (out[k as string]) out[k as string] = "••••••••";
  }
  return out as T;
}
