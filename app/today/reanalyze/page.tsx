import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReanalysisForm } from "@/components/today/reanalysis-form";
import { requireCompletedOnboarding } from "@/lib/auth/server";
import { OnboardingSubmissionSchema } from "@/lib/validators/profile";

export const metadata: Metadata = {
  title: "Update analysis",
  description: "Update your target role or job description and reanalyze Trailgrad readiness.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReanalyzePage() {
  const user = await requireCompletedOnboarding({
    currentPath: "/today/reanalyze",
  });
  const onboarding = OnboardingSubmissionSchema.safeParse(
    user.profile.onboarding,
  );

  if (!onboarding.success) {
    redirect("/today");
  }

  return <ReanalysisForm onboarding={onboarding.data} />;
}
