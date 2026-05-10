import { redirect, notFound } from "next/navigation";
import { getCandidateSession } from "@/lib/portal/session";
import { loadApostilaData } from "@/lib/ich/loader";
import { ApostilaICH } from "@/components/apostila-ich";
import { appBaseUrl } from "@/lib/email/transport";

export const dynamic = "force-dynamic";
export const metadata = { title: "Minha apostila ICH — Kavuka Experts" };

export default async function MinhaApostilaPage() {
  const session = await getCandidateSession();
  if (!session) redirect("/portal/login");

  const data = await loadApostilaData(session.candidateId);
  if (!data) notFound();

  return (
    <ApostilaICH
      candidate={data.candidate as any}
      experiences={data.experiences as any}
      educations={data.educations as any}
      skills={data.skills as any}
      languages={data.languages as any}
      assessments={data.assessments as any}
      skillsIndex={data.skillsIndex}
      behavioralIndex={data.behavioralIndex}
      narrative={data.narrative}
      viewer="self"
      baseUrl={appBaseUrl()}
    />
  );
}
