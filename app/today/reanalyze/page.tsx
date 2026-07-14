import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireCompletedOnboarding } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Create your first trail",
  description: "Create the first Trailgrad trail for your workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReanalyzePage() {
  await requireCompletedOnboarding({
    currentPath: "/today/reanalyze",
  });

  redirect("/trails/new");
}
