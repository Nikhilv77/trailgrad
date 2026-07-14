import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PreparingWorkspaceStatus } from "@/components/trails/preparing-workspace-status";
import {
  getSingleSearchParam,
  requireCompletedOnboarding,
} from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Preparing your workspace",
  description: "Trailgrad is preparing your workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface TrailPreparingPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TrailPreparingPage({
  searchParams,
}: TrailPreparingPageProps) {
  await requireCompletedOnboarding({
    currentPath: "/trails/preparing",
  });

  const params = searchParams ? await searchParams : {};
  const jobId = getSingleSearchParam(params.jobId);
  const trailId = getSingleSearchParam(params.trail);

  if (!jobId) {
    redirect("/today");
  }

  return <PreparingWorkspaceStatus jobId={jobId} trailId={trailId} />;
}
