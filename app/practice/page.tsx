import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  requireCompletedOnboarding,
} from "@/lib/auth/server";

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

  redirect(DEFAULT_AUTHENTICATED_ROUTE);
}
