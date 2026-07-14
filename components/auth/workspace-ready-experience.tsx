"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HashLoader } from "react-spinners";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface WorkspaceReadyExperienceProps {
  redirectPath: string;
}

export function WorkspaceReadyExperience({
  redirectPath,
}: WorkspaceReadyExperienceProps) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    router.prefetch(redirectPath);

    const redirectTimer = window.setTimeout(
      () => {
        router.replace(redirectPath);
      },
      reduceMotion ? 160 : 820,
    );

    return () => window.clearTimeout(redirectTimer);
  }, [redirectPath, reduceMotion, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fcfa] text-[#082f35]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-[-12%] bg-[radial-gradient(circle_at_28%_28%,rgba(20,184,166,0.18),transparent_34%),radial-gradient(circle_at_74%_68%,rgba(15,118,110,0.12),transparent_38%),linear-gradient(135deg,#fbfefd_0%,#eff8f5_52%,#f9fcfb_100%)]" />
        <div className="tg-grid absolute inset-0 opacity-[0.045]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 text-center">
        <div className="grid size-20 place-items-center">
          <HashLoader
            color="#159b89"
            loading
            size={58}
            speedMultiplier={0.9}
            cssOverride={{
              filter: "drop-shadow(0 16px 34px rgba(15, 118, 110, 0.16))",
            }}
          />
        </div>
      </section>
    </main>
  );
}
