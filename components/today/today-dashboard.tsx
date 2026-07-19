"use client";

import { motion, type Variants } from "framer-motion";
import { Plus_Jakarta_Sans } from "next/font/google";
import { useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { MVPAnalysis } from "@/lib/ai/schemas/mvp-analysis";
import type { JobApplicationRecord } from "@/lib/db/types";

import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar, MobileHeader } from "./dashboard-sidebar";
import { EvidencePanel } from "./evidence-panel";
import { LearningTrailPanel } from "./learning-trail-panel";
import { PriorityPanel } from "./priority-panel";
import { SkillGapsPanel } from "./readiness-signals-panel";

interface TodayDashboardProps {
  analysis: {
    model: string;
    promptVersion: string;
    provider: string;
    updatedAt: string;
  };
  applications: JobApplicationRecord[];
  reanalysisJobId?: string;
  result: MVPAnalysis;
  selectedApplicationId: string;
  updating?: boolean;
  viewer: {
    firstName: string;
    imageUrl: string | null;
  };
}

const dashboardSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dashboardVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.18,
      staggerChildren: 0.16,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function TodayDashboard(props: TodayDashboardProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const firstName = props.viewer.firstName;

  return (
    <main
      className={`${dashboardSans.className} min-h-screen bg-white text-[#0f1d38]`}
      data-selected-trail={props.selectedApplicationId}
    >
      <div
        className={`grid min-h-screen transition-[grid-template-columns] duration-300 ease-out ${
          sidebarCollapsed
            ? "lg:grid-cols-[86px_minmax(0,1fr)]"
            : "lg:grid-cols-[264px_minmax(0,1fr)]"
        }`}
      >
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col border-r border-[#b9e7df] bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar
            collapsed={sidebarCollapsed}
            firstName={firstName}
            imageUrl={props.viewer.imageUrl}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onToggle={() => setSidebarCollapsed((value) => !value)}
          />
        </aside>

        {mobileMenuOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-[#0f1d38]/20 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        ) : null}

        <section className="min-w-0 bg-white">
          <MobileHeader onOpen={() => setMobileMenuOpen(true)} />
          <motion.div
            className="w-full px-5 pb-8 pt-6 sm:px-6 lg:px-8 xl:px-9"
            variants={dashboardVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            <motion.div
              variants={cardVariants}
            >
              <DashboardHeader firstName={firstName} />
            </motion.div>

            <div className="mt-5 grid items-stretch gap-4 2xl:grid-cols-[minmax(0,0.86fr)_minmax(640px,1.14fr)]">
              <motion.div
                variants={cardVariants}
              >
                <PriorityPanel />
              </motion.div>
              <motion.div
                variants={cardVariants}
              >
                <SkillGapsPanel />
              </motion.div>
            </div>

            <motion.div
              className="mt-4"
              variants={cardVariants}
            >
              <LearningTrailPanel />
            </motion.div>

            <motion.div
              className="mt-4"
              variants={cardVariants}
            >
              <EvidencePanel />
            </motion.div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
