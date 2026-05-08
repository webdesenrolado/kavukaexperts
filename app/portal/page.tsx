import { redirect } from "next/navigation";
import { getCandidateSession } from "@/lib/portal/session";

export const dynamic = "force-dynamic";

export default async function PortalRoot() {
  const session = await getCandidateSession();
  redirect(session ? "/portal/me" : "/portal/login");
}
