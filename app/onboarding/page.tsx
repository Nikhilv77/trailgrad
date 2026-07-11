import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  getSafeAppRedirectPath,
  getSingleSearchParam,
  requireAuthenticatedUser,
} from "@/lib/auth/server";
import { getOnboardingState } from "@/lib/services/profile-service";

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
  const onboardingState = await getOnboardingState(user.userId);

  if (onboardingState.status === "completed") {
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }

  if (onboardingState.status === "analyzing") {
    redirect("/onboarding/analyzing");
  }

  return <OnboardingFlow initialState={onboardingState} />;
}
