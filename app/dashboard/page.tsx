import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Readiness workspace — TrailGrad",
  description: "Track interview readiness, close rejection risks, and practice what matters next.",
};

export default function DashboardPage() {
  return <DashboardShell />;
}
