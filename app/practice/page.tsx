import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCompletedOnboarding } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Practice",
  description: "Practise explaining your evidence with Trailgrad.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PracticePage() {
  await requireCompletedOnboarding({ currentPath: "/practice" });

  return <DashboardShell />;
}
