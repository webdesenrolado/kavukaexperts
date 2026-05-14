import { notFound } from "next/navigation";
import { loadApostilaData } from "@/lib/ich/loader";
import { CurriculoICH } from "@/components/apostila-ich";
import { appBaseUrl } from "@/lib/email/transport";

export const dynamic = "force-dynamic";
export const metadata = { title: "Currículo ICH — Kavuka Experts" };

export default async function ApostilaCandidatoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadApostilaData(id);
  if (!data) notFound();

  return (
    <CurriculoICH
      candidate={data.candidate as any}
      experiences={data.experiences as any}
      educations={data.educations as any}
      skills={data.skills as any}
      languages={data.languages as any}
      assessments={data.assessments as any}
      skillsIndex={data.skillsIndex}
      behavioralIndex={data.behavioralIndex}
      narrative={data.narrative}
      viewer="recruiter"
      baseUrl={appBaseUrl()}
    />
  );
}
