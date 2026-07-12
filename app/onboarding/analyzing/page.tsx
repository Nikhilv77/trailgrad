import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AnalyzingStatus } from "@/components/onboarding/analyzing-status";
import { DEFAULT_AUTHENTICATED_ROUTE, requireAuthenticatedUser } from "@/lib/auth/server";
import { getReconciledOnboardingState } from "@/lib/services/onboarding-analysis-status-service";

export const metadata: Metadata = {
  title: "Building your Trailgrad profile",
  description: "Trailgrad is preparing your workspace.",
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
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }

  if (onboardingState.status !== "analyzing") {
    redirect("/onboarding");
  }

  return <AnalyzingStatus />;
}
