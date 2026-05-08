import { cookies } from "next/headers";
import { verifyCandidateToken, type CandidateTokenPayload } from "./jwt";

export const PORTAL_COOKIE = "kavuka_candidate_token";

export async function getCandidateSession(): Promise<CandidateTokenPayload | null> {
  const store = await cookies();
  const token = store.get(PORTAL_COOKIE)?.value;
  if (!token) return null;
  return verifyCandidateToken(token);
}

export async function requireCandidateSession(): Promise<CandidateTokenPayload> {
  const session = await getCandidateSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export function cookieSecure(): boolean {
  return process.env.COOKIE_SECURE === "false"
    ? false
    : process.env.NODE_ENV === "production";
}
