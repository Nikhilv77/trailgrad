import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCompletedOnboarding } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Projects",
  description: "Build stronger project evidence for interviews.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProjectsPage() {
  await requireCompletedOnboarding({ currentPath: "/projects" });

  return <DashboardShell />;
}
