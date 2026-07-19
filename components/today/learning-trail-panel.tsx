"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Check, CircleHelp, Lock } from "lucide-react";
import Image from "next/image";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { mockDashboard } from "./dashboard-data";
import { StaggeredText } from "./staggered-text";

type TrailStepData = (typeof mockDashboard.trail)[number];

const trailGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.28,
      staggerChildren: 0.1,
    },
  },
};

const trailStepVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function LearningTrailPanel() {
  const reduceMotion = usePrefersReducedMotion();
  const steps = mockDashboard.trail;
  const completedCount = steps.filter((step) => step.status === "complete").length;
  const activeIndex = Math.max(
    steps.findIndex((step) => step.status === "active"),
    completedCount,
  );

  return (
    <section className="rounded-lg border border-[#b9e7df] bg-white px-6 py-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#10213e]">
              <StaggeredText text="Learning trail" />
            </h2>
            <CircleHelp className="size-4 text-[#8b9ab0]" />
          </div>
          <p className="mt-1 text-[14px] font-medium leading-6 text-[#6b7b94]">
            Your current path from resume fixes to interview readiness.
          </p>
        </div>

        <span className="mt-1 rounded-full border border-[#cce8e3] bg-[#f7fcfb] px-3.5 py-1.5 text-[12px] font-extrabold text-[#078f7c]">
          {completedCount} of {steps.length} completed
        </span>
      </header>

      <div className="tg-slim-scrollbar mt-5 overflow-x-auto pb-1">
        <div className="relative min-w-[1280px]">
          <TrailRail activeIndex={activeIndex} totalSteps={steps.length} />

          <motion.div
            className="relative z-10 grid grid-cols-7 gap-4"
            variants={trailGridVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            {steps.map((step, index) => (
              <TrailStep
                key={`${step.title}-${index}`}
                index={index}
                step={step}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TrailRail({
  activeIndex,
  totalSteps,
}: {
  activeIndex: number;
  totalSteps: number;
}) {
  const columnWidth = 100 / totalSteps;
  const markerCenter = (index: number) => columnWidth * index + columnWidth / 2;
  const start = markerCenter(0);
  const active = markerCenter(activeIndex);
  const end = markerCenter(totalSteps - 1);

  return (
    <>
      <span
        aria-hidden="true"
        className="absolute top-[31px] h-px bg-[#12a38f]"
        style={{ left: `${start}%`, width: `${active - start}%` }}
      />
      <span
        aria-hidden="true"
        className="absolute top-[31px] border-t border-dashed border-[#c8d9d7]"
        style={{ left: `${active}%`, width: `${end - active}%` }}
      />
    </>
  );
}

function TrailStep({
  index,
  step,
}: {
  index: number;
  step: TrailStepData;
}) {
  const complete = step.status === "complete";
  const active = step.status === "active";
  const upcoming = !complete && !active;

  return (
    <motion.article
      variants={trailStepVariants}
      className={[
        "relative flex min-h-[232px] flex-col items-center overflow-hidden rounded-lg px-4 pb-5 pt-[70px] text-center transition-colors",
        active
          ? "border border-[#16a995] bg-gradient-to-b from-[#ecfaf7] via-white to-white shadow-[0_16px_34px_rgba(7,153,133,0.10)]"
          : complete
            ? "border border-[#d8e9e5] bg-white hover:border-[#b9e7df]"
            : "border border-[#e1e8ec] bg-white text-[#8b97a9] hover:border-[#cfdcda]",
      ].join(" ")}
    >
      {active ? (
        <Image
          src="/images/dashboard/today-priority-mountain.png"
          alt=""
          width={1536}
          height={1024}
          className="pointer-events-none absolute bottom-[-18px] right-[-26px] size-[150px] object-contain opacity-20"
          sizes="150px"
        />
      ) : null}

      <StepMarker index={index} complete={complete} active={active} />

      <p
        className={[
          "relative z-10 text-[10px] font-extrabold uppercase tracking-[0.1em]",
          active
            ? "text-[#078f7c]"
            : complete
              ? "text-[#78918d]"
              : "text-[#9aa6b5]",
        ].join(" ")}
      >
        Step {index + 1}
      </p>

      <h3
        className={[
          "relative z-10 mx-auto mt-2 max-w-[152px] text-[14px] font-extrabold leading-[1.35]",
          active
            ? "text-[#10213e]"
            : complete
              ? "text-[#33445e]"
              : "text-[#6f7b8f]",
        ].join(" ")}
      >
        {step.title}
      </h3>

      <p
        className={[
          "relative z-10 mx-auto mt-2 max-w-[150px] text-[12px] font-medium leading-5",
          active
            ? "text-[#64758f]"
            : complete
              ? "text-[#8794a4]"
              : "text-[#a0a9b6]",
        ].join(" ")}
      >
        {step.note}
      </p>

      <div className="relative z-10 mt-auto flex justify-center pt-4">
        {complete ? (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#e8f7f3] px-3.5 text-[10px] font-extrabold text-[#078f7c]">
            <Check className="size-3" strokeWidth={2.6} />
            Completed
          </span>
        ) : null}

        {active ? (
          <button
            type="button"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#078f7c] px-4.5 text-[12px] font-extrabold text-white transition-colors hover:bg-[#067b6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078f7c] focus-visible:ring-offset-2"
          >
            Start lesson
            <ArrowRight className="size-3.5" />
          </button>
        ) : null}

        {upcoming ? (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#eef2f4] px-3.5 text-[10px] font-extrabold text-[#748197]">
            <Lock className="size-3" />
            Upcoming
          </span>
        ) : null}
      </div>
    </motion.article>
  );
}

function StepMarker({
  index,
  complete,
  active,
}: {
  index: number;
  complete: boolean;
  active: boolean;
}) {
  return (
    <span
      className={[
        "absolute left-1/2 top-[31px] z-20 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[12px] font-extrabold ring-[6px] ring-white",
        complete
          ? "border-[#078f7c] bg-[#078f7c] text-white"
          : active
            ? "border-[#078f7c] bg-[#078f7c] text-white"
            : "border-[#d2dce1] bg-white text-[#758399]",
      ].join(" ")}
    >
      {complete ? (
        <Check className="size-4" strokeWidth={2.7} />
      ) : (
        index + 1
      )}
    </span>
  );
}
