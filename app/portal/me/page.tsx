import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  candidates,
  candidateExperiences,
  candidateEducations,
  candidateSkills,
  candidateLanguages,
  candidateLinks,
  assessments,
  applications,
  jobs,
  companies,
} from "@/db/schema";
import { eq, asc, desc, and, sql, notInArray } from "drizzle-orm";
import { getCandidateSession } from "@/lib/portal/session";
import { MeClient } from "./me-client";
import { WelcomeBanner } from "./welcome-banner";
import { ApplicationsSection, type MyApplication } from "./applications-section";
import { SuggestedJobs, type SuggestedJob } from "./suggested-jobs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meu perfil — Kavuka" };

export default async function PortalMePage() {
  const session = await getCandidateSession();
  if (!session) redirect("/portal/login");

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.id, session.candidateId),
  });
  if (!candidate) redirect("/portal/login");

  const [
    experiences,
    educations,
    skills,
    languages,
    links,
    assessmentList,
    myApplicationsRaw,
  ] = await Promise.all([
    db
      .select()
      .from(candidateExperiences)
      .where(eq(candidateExperiences.candidateId, candidate.id))
      .orderBy(asc(candidateExperiences.sortOrder), desc(candidateExperiences.startDate)),
    db
      .select()
      .from(candidateEducations)
      .where(eq(candidateEducations.candidateId, candidate.id))
      .orderBy(asc(candidateEducations.sortOrder), desc(candidateEducations.endYear)),
    db
      .select()
      .from(candidateSkills)
      .where(eq(candidateSkills.candidateId, candidate.id))
      .orderBy(asc(candidateSkills.sortOrder)),
    db
      .select()
      .from(candidateLanguages)
      .where(eq(candidateLanguages.candidateId, candidate.id))
      .orderBy(asc(candidateLanguages.sortOrder)),
    db
      .select()
      .from(candidateLinks)
      .where(eq(candidateLinks.candidateId, candidate.id))
      .orderBy(asc(candidateLinks.sortOrder)),
    db
      .select({
        id: assessments.id,
        instrument: assessments.instrument,
        status: assessments.status,
        completedAt: assessments.completedAt,
      })
      .from(assessments)
      .where(eq(assessments.candidateId, candidate.id))
      .orderBy(desc(assessments.completedAt)),
    db
      .select({
        applicationId: applications.id,
        jobId: jobs.id,
        jobSlug: jobs.slug,
        jobTitle: jobs.title,
        jobLocation: jobs.location,
        jobRemote: jobs.remote,
        companyName: companies.name,
        stage: applications.stage,
        appliedAt: applications.createdAt,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.candidateId, candidate.id))
      .orderBy(desc(applications.createdAt))
      .limit(20),
  ]);

  const myApplications: MyApplication[] = myApplicationsRaw.map((a) => ({
    ...a,
    appliedAt: a.appliedAt ?? null,
  }));

  const appliedJobIds = myApplications.map((a) => a.jobId);
  const suggestedRows = await db
    .select({
      id: jobs.id,
      slug: jobs.slug,
      title: jobs.title,
      location: jobs.location,
      remote: jobs.remote,
      companyName: companies.name,
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(
      appliedJobIds.length > 0
        ? and(
            sql`${jobs.publiclyOpen} = true AND ${jobs.status} = 'open'`,
            notInArray(jobs.id, appliedJobIds),
          )
        : sql`${jobs.publiclyOpen} = true AND ${jobs.status} = 'open'`,
    )
    .orderBy(desc(jobs.publishedAt))
    .limit(6);

  const suggested: SuggestedJob[] = suggestedRows;

  const recentApplication = myApplications[0];
  const recentJobTitle =
    recentApplication &&
    recentApplication.appliedAt &&
    Date.now() - new Date(recentApplication.appliedAt).getTime() < 1000 * 60 * 10
      ? recentApplication.jobTitle
      : null;

  const {
    passwordHash,
    resetToken,
    resetTokenExpiresAt,
    rawResumeText,
    ...safeCandidate
  } = candidate;

  const firstName = candidate.name?.split(" ")[0] ?? "candidato";

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-10">
        <WelcomeBanner
          candidateFirstName={firstName}
          recentJobTitle={recentJobTitle}
        />
        <ApplicationsSection applications={myApplications} />
        <SuggestedJobs jobs={suggested} />
      </div>

      <div id="perfil">
        <MeClient
          initialCandidate={safeCandidate as any}
          initialExperiences={experiences as any}
          initialEducations={educations as any}
          initialSkills={skills as any}
          initialLanguages={languages as any}
          initialLinks={links as any}
          initialAssessments={assessmentList as any}
        />
      </div>
    </>
  );
}
