import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { DEFAULT_AUTHENTICATED_ROUTE, requireAuthenticatedUser } from "@/lib/auth/server";
import { getOnboardingState } from "@/lib/services/profile-service";

export const metadata: Metadata = {
  title: "Building your Trailgrad profile",
  description: "Trailgrad is analyzing your onboarding inputs.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OnboardingAnalyzingPage() {
  const user = await requireAuthenticatedUser({
    returnBackUrl: "/onboarding/analyzing",
  });
  const onboardingState = await getOnboardingState(user.userId);

  if (onboardingState.status === "completed") {
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }

  if (onboardingState.status !== "analyzing") {
    redirect("/onboarding");
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
        <div
          className="absolute inset-[-12%]"
          style={{
            background:
              "radial-gradient(ellipse 58% 30% at 26% 92%, rgba(20,184,166,0.13), transparent 72%), radial-gradient(ellipse 58% 34% at 87% 38%, rgba(125,232,218,0.12), transparent 74%)",
            filter: "blur(64px)",
            opacity: 0.7,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.2)_46%,rgba(255,255,255,0.5))]" />
        <div className="tg-grid absolute inset-0 opacity-[0.045]" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
        <article className="w-full max-w-[640px] rounded-[28px] bg-white p-7 text-center shadow-[0_34px_110px_rgba(15,118,110,0.16),0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:p-9">
          <div className="mx-auto grid size-16 place-items-center rounded-[18px] border border-[#dff2ee] bg-[#effbf8] text-[#0f9f8d]">
            <LoaderCircle className="size-7 animate-spin" />
          </div>
          <h1 className="mt-6 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[46px]">
            Building your Trailgrad profile.
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] text-sm font-medium leading-6 text-[#5f6f6b]">
            Trailgrad is reviewing your resume, target role, timeline, job context, and project signals.
          </p>
        </article>
      </section>

    </main>
  );
}
