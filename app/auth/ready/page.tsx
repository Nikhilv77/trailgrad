import type { Metadata } from "next";

import { WorkspaceReadyExperience } from "@/components/auth/workspace-ready-experience";

export const metadata: Metadata = {
  title: "Preparing your workspace",
  description: "Trailgrad is preparing your interview-readiness workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthReadyPage() {
  return <WorkspaceReadyExperience />;
}
