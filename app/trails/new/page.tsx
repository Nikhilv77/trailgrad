import type { Metadata } from "next";

import { FirstTrailForm } from "@/components/trails/first-trail-form";
import { requireCompletedOnboarding } from "@/lib/auth/server";
import { listJobApplicationRecords } from "@/lib/db/application-repository";

export const metadata: Metadata = {
  title: "Create a trail",
  description: "Create a Trailgrad trail for your workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function NewTrailPage() {
  const user = await requireCompletedOnboarding({
    currentPath: "/trails/new",
  });
  const applications = await listJobApplicationRecords(user.userId);

  return <FirstTrailForm isFirstTrail={applications.length === 0} />;
}
