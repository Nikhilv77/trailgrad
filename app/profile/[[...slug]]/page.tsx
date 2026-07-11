import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCompletedOnboarding } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Trailgrad profile.",
  robots: {
    index: false,
    follow: false,
  },
};

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

  await requireCompletedOnboarding({ currentPath });

  return <DashboardShell />;
}
