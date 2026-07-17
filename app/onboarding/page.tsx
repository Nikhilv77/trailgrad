import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  getSafeAppRedirectPath,
  getSingleSearchParam,
  requireAuthenticatedUser,
} from "@/lib/auth/server";
import { listJobApplicationRecords } from "@/lib/db/application-repository";
import { getReconciledOnboardingState } from "@/lib/services/onboarding-analysis-status-service";
import { OnboardingSubmissionSchema } from "@/lib/validators/profile";

export const metadata: Metadata = {
  title: "Build your workspace",
  description: "Create a personalized interview-readiness plan in a few quick steps.",
  robots: {
    index: false,
    follow: false,
  },
};

interface OnboardingPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = searchParams ? await searchParams : {};
  const completionRedirectUrl =
    getSafeAppRedirectPath(getSingleSearchParam(params.redirect_url)) ??
    DEFAULT_AUTHENTICATED_ROUTE;
  const user = await requireAuthenticatedUser({
    returnBackUrl: `/onboarding${
      completionRedirectUrl === DEFAULT_AUTHENTICATED_ROUTE
        ? ""
        : `?${new URLSearchParams({ redirect_url: completionRedirectUrl }).toString()}`
    }`,
  });
  const onboardingState = await getReconciledOnboardingState(user.userId);

  const completedOnboarding =
    onboardingState.status === "completed" &&
    OnboardingSubmissionSchema.safeParse(onboardingState.onboarding).success;

  if (completedOnboarding) {
    const trails = await listJobApplicationRecords(user.userId);

    if (trails.length > 0) {
      redirect(DEFAULT_AUTHENTICATED_ROUTE);
    }

    return (
      <OnboardingFlow
        initialState={{
          ...onboardingState,
          status: "in_progress",
          currentStep: "trail",
        }}
      />
    );
  }

  return <OnboardingFlow initialState={onboardingState} />;
}
