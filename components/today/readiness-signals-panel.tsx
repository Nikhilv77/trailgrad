"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  CircleHelp,
  Code2,
  Database,
  Gauge,
  Layers3,
} from "lucide-react";
import Image from "next/image";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { mockDashboard } from "./dashboard-data";
import { ReadinessRing } from "./readiness-ring";
import { StaggeredText } from "./staggered-text";

const skillGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.32,
      staggerChildren: 0.12,
    },
  },
};

const skillCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function SkillGapsPanel() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="flex h-full min-h-[324px] flex-col rounded-lg border border-[#b9e7df] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#10213e]">
              <StaggeredText text="Trailgrad signals" />
            </h2>
            <CircleHelp className="size-4 text-[#8794aa]" />
          </div>
          <p className="mt-1 text-[14px] font-medium leading-6 text-[#6b7b94]">
            Your strongest blockers and the next move to improve them.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-[#dce3e8] px-3.5 text-[12px] font-bold text-[#078f7c] transition-colors hover:border-[#b9e7df] hover:bg-[#f4faf8]"
        >
          Report
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      <div className="mt-4 grid flex-1 items-stretch gap-5 lg:grid-cols-[152px_minmax(0,1fr)]">
        <div className="flex items-center gap-4 lg:flex lg:flex-col lg:items-start lg:justify-center lg:border-r lg:border-[#e3e8ec] lg:pr-5">
          <ReadinessRing score={mockDashboard.readiness} size="compact" />
          <div className="lg:mt-4">
            <p className="text-[13px] font-extrabold text-[#078f7c]">+8% this week</p>
            <p className="mt-1 max-w-[140px] text-[11px] font-medium leading-5 text-[#657590]">
              Focus on project depth and architecture stories.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#7a899e]">
              Skills to learn
            </p>
          </div>
          <motion.div
            className="mt-2.5 grid flex-1 auto-rows-fr gap-2.5 sm:grid-cols-2 xl:grid-cols-4"
            variants={skillGridVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            {mockDashboard.topGaps.slice(0, 4).map((gap) => {
              const Icon = getGapIcon(gap.label);

              return (
                <motion.div
                  key={gap.label}
                  variants={skillCardVariants}
                  className="group relative min-h-[150px] overflow-hidden rounded-md border border-[#dfe8e6] bg-white px-3 py-3 transition-colors hover:border-[#b9e7df] hover:bg-[#fbfefd]"
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-[#079985]" />
                  <SkillCardVisual label={gap.label} />
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#eef8f5] text-[#078f7c]">
                      <Icon className="size-4" strokeWidth={1.9} />
                    </span>
                    <span className="relative z-10 rounded-full bg-[#e8f8f4] px-2 py-1 text-[10px] font-extrabold text-[#078f7c]">
                      {gap.score}%
                    </span>
                  </div>
                  <p className="relative z-10 mt-5 line-clamp-2 pr-8 text-[15px] font-extrabold leading-6 text-[#20334f]">
                    {gap.label}
                  </p>
                  <p className="relative z-10 mt-1 line-clamp-2 pr-6 text-[13px] font-medium leading-5 text-[#73819a]">
                    {gap.note}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function getGapIcon(label: string) {
  if (label.includes("Backend")) return Boxes;
  if (label.includes("DSA")) return Code2;
  if (label.includes("React")) return Gauge;
  if (label.includes("SQL")) return Database;

  return Layers3;
}

function SkillCardVisual({ label }: { label: string }) {
  return (
    <Image
      src={getSkillVisualSrc(label)}
      alt=""
      width={360}
      height={360}
      className="pointer-events-none absolute bottom-[-42px] right-[-42px] z-0 size-[138px] object-contain opacity-55 transition-opacity duration-300 group-hover:opacity-70"
      sizes="138px"
    />
  );
}

function getSkillVisualSrc(label: string) {
  if (label.includes("Backend")) {
    return "/images/dashboard/skill-backend-architecture.png";
  }

  if (label.includes("DSA")) {
    return "/images/dashboard/skill-dsa.png";
  }

  if (label.includes("React")) {
    return "/images/dashboard/skill-react-performance.png";
  }

  return "/images/dashboard/skill-system-design.png";
}
