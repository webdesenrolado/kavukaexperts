import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "kavuka-dev-secret-change-in-production"
);

export interface TokenPayload {
  userId: string;
  role: string;
  companyId: string | null;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      companyId: (payload.companyId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}
