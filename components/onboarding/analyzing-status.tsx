"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { TrailLoadingScreen } from "@/components/trails/trail-loading-screen";
import { Button } from "@/components/ui/button";

interface OnboardingStatusResponse {
  status: "not_started" | "in_progress" | "analyzing" | "completed" | "failed";
  analysisError?: string | null;
}

interface AnalyzingStatusProps {
  completedRedirectPath?: string;
  handoffDelayMs?: number;
  handoffOnly?: boolean;
  message?: string;
}

export function AnalyzingStatus({
  completedRedirectPath = "/today",
  handoffDelayMs = 1400,
  handoffOnly = false,
  message = "Working on your trails...",
}: AnalyzingStatusProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (handoffOnly) {
      const timeout = window.setTimeout(() => {
        router.replace(completedRedirectPath);
      }, handoffDelayMs);

      return () => window.clearTimeout(timeout);
    }

    let active = true;

    async function poll() {
      try {
        const response = await fetch("/api/profile/onboarding", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to check analysis status.");
        }

        const payload = (await response.json()) as OnboardingStatusResponse;

        if (!active) {
          return;
        }

        if (payload.status === "completed") {
          router.replace(completedRedirectPath);
          return;
        }

        if (payload.status === "failed") {
          setError(
            payload.analysisError ??
              "Trailgrad could not complete your profile analysis.",
          );
          return;
        }

        if (payload.status !== "analyzing") {
          router.replace("/onboarding");
        }
      } catch (pollError) {
        if (active) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Unable to check analysis status.",
          );
        }
      }
    }

    poll();
    const interval = window.setInterval(poll, 2500);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [completedRedirectPath, handoffDelayMs, handoffOnly, router]);

  if (!error) {
    return <TrailLoadingScreen message={message} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf9] text-[#111827]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#f6fcfa]" />
        <div
          className="absolute inset-[-18%]"
          style={{
            background:
              "radial-gradient(ellipse 24% 17% at 6% 72%, rgba(15,118,110,0.3), rgba(20,184,166,0.18) 46%, transparent 76%), radial-gradient(ellipse 32% 21% at 75% 16%, rgba(94,234,212,0.28), rgba(20,184,166,0.13) 48%, transparent 78%), linear-gradient(135deg, #f9fffd 0%, #e6fbf6 54%, #f7fcfa 100%)",
            filter: "blur(34px) saturate(1.03)",
            opacity: 0.86,
          }}
        />
        <div className="tg-grid absolute inset-0 opacity-[0.045]" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
        <article className="w-full max-w-[640px] rounded-[28px] bg-white p-7 text-center shadow-[0_34px_110px_rgba(15,118,110,0.16),0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:p-9">
          <div className="mx-auto grid size-16 place-items-center rounded-[18px] border border-[#dff2ee] bg-[#effbf8] text-[#0f9f8d]">
            <AlertCircle className="size-7" />
          </div>
          <h1 className="mt-6 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[46px]">
            Profile analysis needs another try.
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] text-sm font-medium leading-6 text-[#5f6f6b]">
            {error}
          </p>
          <Button
            className="mt-6"
            type="button"
            onClick={() => router.replace("/onboarding")}
          >
            Review and retry
          </Button>
        </article>
      </section>
    </main>
  );
}
