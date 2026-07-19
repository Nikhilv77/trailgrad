"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bell } from "lucide-react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { lobsterTwo } from "@/lib/fonts";

import { mockDashboard } from "./dashboard-data";
import { StaggeredText } from "./staggered-text";

export function DashboardHeader({ firstName }: { firstName: string }) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className={`${lobsterTwo.className} text-[30px] font-normal leading-none tracking-normal text-[#0d1d39] sm:text-[38px]`}>
          <StaggeredText text={`Good morning, ${firstName}`} />
        </h1>
        <motion.p
          className="mt-2 text-[15px] font-medium leading-6 text-[#60708d]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48, duration: 0.5, ease: "easeOut" }}
        >
          You&apos;re <strong className="font-extrabold text-[#243852]">{mockDashboard.readiness}% ready</strong> for{" "}
          <span className="font-bold text-[#078f7c] underline decoration-[#96dacf] underline-offset-2">
            {mockDashboard.targetRole}
          </span>{" "}
          with today&apos;s focus on project architecture.
        </motion.p>
      </div>
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button
          type="button"
          className="relative grid size-10 cursor-pointer place-items-center rounded-md border border-[#dce3e8] bg-white text-[#314766] transition-colors hover:border-[#9fd8ce] hover:text-[#078f7c]"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#f35f51] ring-2 ring-white" />
        </button>
        <button
          type="button"
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-3 rounded-md bg-[#079985] px-5 text-sm font-bold text-white transition-colors hover:bg-[#078774]"
        >
          Start practice
          <ArrowRight className="size-4" />
        </button>
      </div>
    </header>
  );
}
