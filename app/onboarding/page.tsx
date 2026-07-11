import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  getSafeAppRedirectPath,
  getSingleSearchParam,
  readOnboardingStatus,
  requireAuthenticatedUser,
} from "@/lib/auth/server";

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
  const onboardingStatus = await readOnboardingStatus(user.userId);

  if (onboardingStatus.completed) {
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }

  return <OnboardingFlow completionRedirectUrl={completionRedirectUrl} />;
}
