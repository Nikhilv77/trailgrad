"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  LoaderCircle,
  Plus,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";

import { SiteBrand } from "@/components/marketing/site-brand";
import type { JobApplicationRecord } from "@/lib/db/types";

interface ApplicationWorkspaceProps {
  applications: JobApplicationRecord[];
  reanalysisJobId?: string;
  selectedApplicationId?: string;
  updating?: boolean;
}

export function ApplicationWorkspace({
  applications,
  reanalysisJobId,
  selectedApplicationId,
  updating = false,
}: ApplicationWorkspaceProps) {
  useEffect(() => {
    if (!updating || !reanalysisJobId) return;

    let cancelled = false;
    const jobId = reanalysisJobId;

    async function poll() {
      try {
        const response = await fetch(
          `/api/profile/reanalysis?jobId=${encodeURIComponent(jobId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const payload = (await response.json()) as {
          job?: {
            status?: string;
          };
          latestAnalysisUpdatedAt?: string | null;
        };
        const status = payload.job?.status;

        if (
          !cancelled &&
          (status === "COMPLETED" ||
            status === "FAILED" ||
            status === "CANCELLED")
        ) {
          const completedAt = encodeURIComponent(
            payload.latestAnalysisUpdatedAt ?? new Date().toISOString(),
          );
          const trailQuery = selectedApplicationId
            ? `trail=${encodeURIComponent(selectedApplicationId)}&`
            : "";

          window.location.replace(`/today?${trailQuery}refreshed=${completedAt}`);
        }
      } catch {
        // Keep the workspace visible if a polling attempt misses.
      }
    }

    void poll();
    const interval = window.setInterval(poll, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [reanalysisJobId, selectedApplicationId, updating]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf9] px-4 py-5 text-[#111827] sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(45,212,191,0.13),transparent_34%),radial-gradient(circle_at_84%_8%,rgba(125,232,218,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(244,251,249,0.8))]"
      />
      <section className="relative mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-3">
          <SiteBrand compact iconFrame={false} />
          <div className="flex items-center gap-2">
            <Link
              href="/trails/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0f9f8d] px-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,159,141,0.18)] transition-colors hover:bg-[#0d8d7d]"
            >
              <Plus className="size-4" />
              Trail
            </Link>
            <Link
              href="/profile"
              className="grid size-10 place-items-center rounded-xl border border-[#d7ebe6] bg-white/80 text-[#0f766e] shadow-[0_10px_24px_rgba(15,118,110,0.06)] transition-colors hover:border-[#b9ddd5] hover:bg-white"
              aria-label="Profile settings"
            >
              <UserRound className="size-4" />
            </Link>
          </div>
        </header>

        <div className="mt-5 rounded-[30px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f8f7e]">
            Today workspace
          </p>
          <h1 className="mt-2 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[48px]">
            Create a trail to start.
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#5f6f6b]">
            Your resume is ready. Add a job, interview, or learning goal when
            you want Trailgrad to diagnose your first trail.
          </p>
        </div>

        {updating ? (
          <section className="mt-5 rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#effbf8] text-[#0f9f8d]">
                  <LoaderCircle className="size-5 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    Working on this trail
                  </p>
                  <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-[#5f6f6b]">
                    Trailgrad is analyzing your resume against this trail.
                    This page will refresh when the readiness snapshot is ready.
                  </p>
                </div>
              </div>
              <span className="inline-flex rounded-full bg-[#effbf8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
                Analysis running
              </span>
            </div>
          </section>
        ) : null}

        {applications.length === 0 ? (
          <EmptyApplicationState />
        ) : (
          <ApplicationList
            applications={applications}
            selectedApplicationId={selectedApplicationId}
          />
        )}
      </section>
    </main>
  );
}

function EmptyApplicationState() {
  return (
    <section className="mt-5 rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <div>
          <div className="grid size-12 place-items-center rounded-2xl bg-[#effbf8] text-[#0f9f8d]">
            <BriefcaseBusiness className="size-5" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#111827]">
            No trails yet.
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#5f6f6b]">
            Start with one role, opening, or learning goal. Trailgrad will turn
            it into a targeted risk diagnosis, readiness snapshot, questions,
            and a short improvement plan.
          </p>
        </div>
        <Link
          href="/trails/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0f9f8d] px-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,159,141,0.24)] transition-colors hover:bg-[#0d8d7d]"
        >
          Create trail
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function ApplicationList({
  applications,
  selectedApplicationId,
}: {
  applications: JobApplicationRecord[];
  selectedApplicationId?: string;
}) {
  return (
    <section className="mt-5 rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f8f7e]">
            Trails
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#111827]">
            Your active trails
          </h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {applications.map((application) => {
          const active = application.id === selectedApplicationId;
          const isLearningTrail = application.trailFocus === "learning";
          const title =
            application.targetJobTitle ||
            application.targetCompany ||
            roleLabel(application.targetRole);
          const subtitle = isLearningTrail
            ? application.targetCompany
              ? `Topic: ${application.targetCompany}`
              : roleLabel(application.targetRole)
            : application.targetCompany || roleLabel(application.targetRole);
          const FocusIcon = isLearningTrail ? GraduationCap : BriefcaseBusiness;

          return (
            <Link
              key={application.id}
              href={`/today?trail=${encodeURIComponent(application.id)}`}
              className={`rounded-2xl border p-4 shadow-[0_10px_28px_rgba(15,118,110,0.04)] transition-colors ${
                active
                  ? "border-[#0f9f8d] bg-[#effbf8]"
                  : "border-[#dcefeb] bg-white/74 hover:border-[#a7dcd4]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#effbf8] text-[#0f9f8d]">
                    <FocusIcon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#64746f]">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 rounded-full bg-[#effbf8] px-3 py-1 text-xs font-semibold text-[#0f766e]">
                  {active
                    ? "Selected"
                    : application.analysisJobId
                      ? "Queued"
                      : "Saved"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ApplicationPill>
                  {isLearningTrail ? "Learning" : "Job"}
                </ApplicationPill>
                <ApplicationPill>
                  {application.noDateYet
                    ? "No date yet"
                    : application.applicationDate ?? "No date yet"}
                </ApplicationPill>
                <ApplicationPill>
                  {application.preparationTimePerDay === "flexible"
                    ? "Flexible prep"
                    : `${application.preparationTimePerDay}m/day`}
                </ApplicationPill>
                <ApplicationPill>
                  {application.preparationIntensity}
                </ApplicationPill>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ApplicationPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#d7ebe6] bg-[#f6fbfa] px-3 py-1 text-xs font-semibold text-[#64746f]">
      {children}
    </span>
  );
}

function roleLabel(role: string) {
  return role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
