import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AnalyzingStatus } from "@/components/onboarding/analyzing-status";
import { requireAuthenticatedUser } from "@/lib/auth/server";
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
    return (
      <AnalyzingStatus
        completedRedirectPath="/trails/new"
        handoffOnly
        message="Working on your trails..."
      />
    );
  }

  if (onboardingState.status !== "analyzing") {
    redirect("/onboarding");
  }

  return (
    <AnalyzingStatus
      completedRedirectPath="/trails/new"
      message="Working on your trails..."
    />
  );
}
