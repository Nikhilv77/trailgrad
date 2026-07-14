import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ApplicationWorkspace } from "@/components/today/application-workspace";
import { TodayDashboard } from "@/components/today/today-dashboard";
import {
  getSingleSearchParam,
  requireCompletedOnboarding,
} from "@/lib/auth/server";
import { listJobApplicationRecords } from "@/lib/db/application-repository";
import { findLatestCompletedProfileAnalysisForTargetContextRecord } from "@/lib/db/profile-analysis-repository";

export const metadata: Metadata = {
  title: "Today",
  description: "Review Trailgrad's structured readiness analysis.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface TodayPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const params = searchParams ? await searchParams : {};
  const updating = getSingleSearchParam(params.updating) === "1";
  const reanalysisJobId = getSingleSearchParam(params.jobId);
  const selectedTrailId = getSingleSearchParam(params.trail);
  const user = await requireCompletedOnboarding({ currentPath: "/today" });
  const applications = await listJobApplicationRecords(user.userId);

  if (applications.length === 0) {
    redirect("/trails/new");
  }

  const selectedApplication =
    applications.find((application) => application.id === selectedTrailId) ??
    applications[0];
  const analysis = selectedApplication.targetContextId
    ? await findLatestCompletedProfileAnalysisForTargetContextRecord({
        profileId: user.userId,
        targetContextId: selectedApplication.targetContextId,
      })
    : null;

  if (!analysis?.result) {
    return (
      <ApplicationWorkspace
        applications={applications}
        reanalysisJobId={reanalysisJobId}
        selectedApplicationId={selectedApplication.id}
        updating={updating}
      />
    );
  }

  return (
    <TodayDashboard
      analysis={{
        model: analysis.model,
        promptVersion: analysis.promptVersion,
        provider: analysis.provider,
        updatedAt: analysis.updatedAt,
      }}
      result={analysis.result}
      reanalysisJobId={reanalysisJobId}
      applications={applications}
      selectedApplicationId={selectedApplication.id}
      updating={updating}
    />
  );
}
