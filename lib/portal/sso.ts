import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "kavuka-dev-secret-change-in-production",
);

export interface SsoHandoffPayload {
  candidateId: string;
  email: string;
}

/**
 * Token de handoff entre kavukavagas.com.br e candidato.kavuka.ai.
 * TTL curto (5 min) e aud="sso-handoff" pra não ser confundido com sessão.
 * O endpoint /sso consome esse token, emite o JWT de sessão e seta o cookie.
 */
export async function signSsoToken(payload: SsoHandoffPayload): Promise<string> {
  return new SignJWT({ ...payload, aud: "sso-handoff" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m")
    .setIssuedAt()
    .sign(secret);
}

export async function verifySsoToken(token: string): Promise<SsoHandoffPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.aud !== "sso-handoff") return null;
    return {
      candidateId: payload.candidateId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
