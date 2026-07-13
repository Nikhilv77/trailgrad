import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  requireCompletedOnboarding,
} from "@/lib/auth/server";

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

  redirect(DEFAULT_AUTHENTICATED_ROUTE);
}
