import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCompletedOnboarding } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Today",
  description: "Focus on the highest-impact Trailgrad action for today.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TodayPage() {
  await requireCompletedOnboarding({ currentPath: "/today" });

  return <DashboardShell />;
}
