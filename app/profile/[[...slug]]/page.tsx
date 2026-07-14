import type { Metadata } from "next";

import { ProfileSettings } from "@/components/profile/profile-settings";
import { requireCompletedOnboarding } from "@/lib/auth/server";
import {
  getOnboardingState,
  listResumeVersions,
} from "@/lib/services/profile-service";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Trailgrad profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params?: Promise<{
    slug?: string[];
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = params ? await params : {};
  const slug = resolvedParams.slug ?? [];
  const currentPath =
    slug.length > 0
      ? `/profile/${slug.map(encodeURIComponent).join("/")}`
      : "/profile";

  const user = await requireCompletedOnboarding({ currentPath });
  const [state, resumeVersions] = await Promise.all([
    getOnboardingState(user.userId),
    listResumeVersions(user.userId),
  ]);
  const activeResume = resumeVersions.find((version) => version.active);

  return (
    <ProfileSettings
      initialExperienceLevel={state.onboarding?.experienceLevel ?? "mid-level"}
      initialResumeName={
        state.onboarding?.resumeName ??
        (activeResume ? `Resume version ${activeResume.version}` : undefined)
      }
      initialTargetRole={state.onboarding?.targetRole ?? "software-engineer"}
    />
  );
}
