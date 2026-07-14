"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { TrailLoadingScreen } from "@/components/trails/trail-loading-screen";

interface PreparingWorkspaceStatusProps {
  jobId: string;
  trailId?: string;
}

export function PreparingWorkspaceStatus({
  jobId,
  trailId,
}: PreparingWorkspaceStatusProps) {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const response = await fetch(
          `/api/profile/reanalysis?jobId=${encodeURIComponent(jobId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          job?: {
            status?: string;
          };
          latestAnalysisUpdatedAt?: string | null;
        };
        const status = payload.job?.status;

        if (
          active &&
          (status === "COMPLETED" ||
            status === "FAILED" ||
            status === "CANCELLED")
        ) {
          const completedAt = encodeURIComponent(
            payload.latestAnalysisUpdatedAt ?? new Date().toISOString(),
          );
          const nextPath = trailId
            ? `/today?trail=${encodeURIComponent(trailId)}&refreshed=${completedAt}`
            : `/today?refreshed=${completedAt}`;

          router.replace(nextPath);
          router.refresh();
        }
      } catch {
        // Keep the preparation screen visible if one polling attempt misses.
      }
    }

    void poll();
    const interval = window.setInterval(poll, 2500);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [jobId, router, trailId]);

  return <TrailLoadingScreen message="Preparing your workspace" />;
}
