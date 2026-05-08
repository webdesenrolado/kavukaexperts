import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "kavuka-dev-secret-change-in-production"
);

export interface CandidateTokenPayload {
  candidateId: string;
  email: string;
}

export async function signCandidateToken(payload: CandidateTokenPayload): Promise<string> {
  return new SignJWT({ ...payload, aud: "candidate" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyCandidateToken(token: string): Promise<CandidateTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.aud !== "candidate") return null;
    return {
      candidateId: payload.candidateId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
