import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "./jwt";

export const SESSION_COOKIE = "kavuka_token";

export async function getSession(): Promise<TokenPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
