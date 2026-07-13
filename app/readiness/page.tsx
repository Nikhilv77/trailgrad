import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  requireCompletedOnboarding,
} from "@/lib/auth/server";

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

  redirect(DEFAULT_AUTHENTICATED_ROUTE);
}
