import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCompletedOnboarding } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Readiness",
  description: "Review Trailgrad readiness signals and interview risk.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReadinessPage() {
  await requireCompletedOnboarding({ currentPath: "/readiness" });

  return <DashboardShell />;
}
