import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/server";
import { listJobApplicationRecords } from "@/lib/db/application-repository";
import { getReconciledOnboardingState } from "@/lib/services/onboarding-analysis-status-service";

export const metadata: Metadata = {
  title: "Working on your trails",
  description: "Trailgrad is getting your first trail ready.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OnboardingAnalyzingPage() {
  const user = await requireAuthenticatedUser({
    returnBackUrl: "/onboarding/analyzing",
  });
  const onboardingState = await getReconciledOnboardingState(user.userId);

  if (onboardingState.status === "completed") {
    const trails = await listJobApplicationRecords(user.userId);

    redirect(trails.length > 0 ? "/trails/new" : "/onboarding");
  }

  redirect("/onboarding");
}
