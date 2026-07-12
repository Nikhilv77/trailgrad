"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { lobsterTwo } from "@/lib/fonts";

interface OnboardingStatusResponse {
  status: "not_started" | "in_progress" | "analyzing" | "completed" | "failed";
  analysisError?: string | null;
}

export function AnalyzingStatus() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          router.replace("/today");
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
  }, [router]);

  if (!error) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f7fcfa] text-[#082f35]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#f7fcfa]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(86,190,174,0.16),transparent_43%)]" />
          <div className="tg-grid absolute inset-0 opacity-[0.045]" />
        </div>

        <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 text-center">
          <h1
            aria-live="polite"
            className={`${lobsterTwo.className} tg-analysis-copy tg-analysis-shine max-w-[860px] px-2 pb-8 pt-6 text-[42px] font-normal leading-[1.32] tracking-normal text-[#082f35] sm:text-[64px] sm:leading-[1.28]`}
          >
            Building your Trailgrad profile
          </h1>
        </section>

        <style jsx global>{`
          @keyframes tg-analysis-shine {
            0% {
              background-position: 140% 50%;
            }
            100% {
              background-position: -140% 50%;
            }
          }

          .tg-analysis-copy {
            display: block;
            overflow: visible;
            text-rendering: geometricPrecision;
          }

          @supports ((background-clip: text) or (-webkit-background-clip: text)) {
            .tg-analysis-shine {
              color: transparent;
              -webkit-text-fill-color: transparent;
              background-image: linear-gradient(
                100deg,
                #082f35 0%,
                #082f35 34%,
                #159b89 46%,
                #b7f4e9 50%,
                #159b89 54%,
                #082f35 66%,
                #082f35 100%
              );
              background-size: 260% 100%;
              background-clip: text;
              -webkit-background-clip: text;
              animation: tg-analysis-shine 2.2s ease-in-out infinite;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .tg-analysis-shine {
              animation: none !important;
              color: #082f35;
              -webkit-text-fill-color: #082f35;
            }
          }
        `}</style>
      </main>
    );
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
