import { TokenPayload } from "./jwt";

/**
 * Garante que a session pode acessar a empresa cliente do id passado.
 * - master/recruiter: livre
 * - company_admin: só sua própria empresa (session.companyId === id)
 * Retorna true se OK, false se não.
 */
export function canAccessClientCompany(session: TokenPayload, companyId: string): boolean {
  if (session.role === "master" || session.role === "recruiter") return true;
  if (session.role === "company_admin") return session.companyId === companyId;
  return false;
}

export function canManagePlatform(session: TokenPayload): boolean {
  return session.role === "master" || session.role === "recruiter";
}
