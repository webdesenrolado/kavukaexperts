import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function EmpresaNR1() {
  const session = await requireSession();
  if (!session.companyId) redirect("/login");
  redirect(`/empresas-clientes/${session.companyId}/nr1`);
}
