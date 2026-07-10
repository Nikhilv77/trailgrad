import type { Metadata } from "next";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Build your workspace — TrailGrad",
  description: "Create a personalized interview-readiness plan in a few quick steps.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
