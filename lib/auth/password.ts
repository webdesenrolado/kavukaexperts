import bcrypt from "bcryptjs";

/**
 * Normaliza senha antes de hash/compare.
 * Remove apenas espaços nas extremidades — preservar espaços internos (passphrases válidas).
 * Mobile autocompleta com espaço no fim com frequência; isso causa "credencial inválida"
 * quando o usuário tenta logar depois (ele digita sem espaço, mas o hash salvo é com).
 */
export function normalizePassword(password: string): string {
  return password.trim();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(normalizePassword(password), 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Tenta primeiro normalizado (caso novo); se falhar, tenta cru — retro-compat
  // para senhas hashadas antes desse fix (que podem ter espaços indevidos).
  const normalized = normalizePassword(password);
  if (await bcrypt.compare(normalized, hash)) return true;
  if (normalized !== password) {
    return bcrypt.compare(password, hash);
  }
  return false;
}
