import type { Metadata } from "next";

import { TodayDashboard } from "@/components/today/today-dashboard";
import {
  getSingleSearchParam,
  requireCompletedOnboarding,
} from "@/lib/auth/server";
import { findLatestCompletedProfileAnalysisRecord } from "@/lib/db/profile-analysis-repository";

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
  const user = await requireCompletedOnboarding({ currentPath: "/today" });
  const analysis = await findLatestCompletedProfileAnalysisRecord(user.userId);

  if (!analysis?.result) {
    return (
      <main className="min-h-screen bg-[#f4fbf9] px-5 py-8 text-[#111827] sm:px-8">
        <section className="mx-auto max-w-4xl rounded-[24px] border border-[#dcefeb] bg-white p-6 shadow-[0_24px_70px_rgba(15,118,110,0.1)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f8f7e]">
            Trailgrad analysis
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            No completed analysis yet.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5f6f6b]">
            Complete onboarding once, then Trailgrad will show your saved readiness snapshot here.
          </p>
        </section>
      </main>
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
      updating={updating}
    />
  );
}
